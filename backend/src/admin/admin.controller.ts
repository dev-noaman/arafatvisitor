import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';
import { WhatsAppService } from '../notifications/whatsapp.service';
import { Public } from '../common/decorators/public.decorator';
import * as bcrypt from 'bcrypt';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
import * as XLSX from 'xlsx';
// csv-parse import moved to dynamic import inside method for ESM compatibility

// Note: These endpoints are meant to be accessed through the AdminJS session
// They use @Public() to bypass JWT auth - they rely on AdminJS cookie authentication

@Controller('admin/api')
@Public() // Bypass JWT auth - AdminJS uses cookie-based session auth
export class AdminApiController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly whatsappService: WhatsAppService,
  ) { }

  // ============ DASHBOARD KPIs ============

  @Get('dashboard/kpis')
  async getDashboardKpis() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalHosts, visitsToday, deliveriesToday] = await Promise.all([
      this.prisma.host.count({ where: { status: 1 } }),
      this.prisma.visit.count({
        where: {
          checkInAt: { gte: today },
        },
      }),
      this.prisma.delivery.count({
        where: {
          receivedAt: { gte: today },
        },
      }),
    ]);

    return { totalHosts, visitsToday, deliveriesToday };
  }

  @Get('profile')
  async getProfile(@Query('email') email?: string) {
    if (!email) {
      throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
    }
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return { name: user.name, email: user.email, role: user.role };
  }

  @Post('profile/update')
  async updateProfile(@Body() body: { email: string; name?: string }) {
    const { email, name } = body || ({} as any);
    if (!email) {
      throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
    }
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const updated = await this.prisma.user.update({
      where: { email },
      data: { name: name ?? user.name },
    });
    return { name: updated.name, email: updated.email, role: updated.role };
  }

  // ============ HOSTS BULK IMPORT ============

  @Post('hosts/import')
  async importHosts(@Body() body: { csvContent?: string; xlsxContent?: string }, @Query('validate') validate?: string) {
    console.log('Bulk import request received, body keys:', body ? Object.keys(body) : 'null');

    const isValidate = validate === 'true';

    try {
      const { csvContent, xlsxContent } = body || {};

      if (!csvContent && !xlsxContent) {
        throw new HttpException('csvContent or xlsxContent is required', HttpStatus.BAD_REQUEST);
      }

      // Handle XLSX content
      if (xlsxContent) {
        console.log(`XLSX content received, length: ${xlsxContent.length} chars`);
        return this.importFromXlsxBase64(xlsxContent, isValidate);
      }

      // Handle CSV content
      if (!csvContent || typeof csvContent !== 'string' || !csvContent.trim()) {
        console.log('csvContent validation failed:', {
          hasBody: !!body,
          hasCsvContent: !!csvContent,
          type: typeof csvContent
        });
        throw new HttpException('csvContent is required', HttpStatus.BAD_REQUEST);
      }

      console.log(`CSV content received, length: ${csvContent.length} chars`);

      let records: any[];
      try {
        // Dynamic import for ESM compatibility
        const csvParseModule = await import('csv-parse/sync');
        // csv-parse/sync exports { parse } directly
        const parse = (csvParseModule as any).parse;
        if (typeof parse !== 'function') {
          console.error('csv-parse module exports:', Object.keys(csvParseModule));
          throw new Error('csv-parse parse function not found');
        }
        records = parse(csvContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        });
        console.log(`CSV parsed successfully, ${records.length} records found`);
      } catch (e) {
        console.error('CSV parse error:', e);
        throw new HttpException(`Failed to parse CSV: ${e instanceof Error ? e.message : 'Unknown error'}`, HttpStatus.BAD_REQUEST);
      }

      let totalProcessed = 0;
      let inserted = 0;
      let skipped = 0;
      let usersCreated = 0;
      let usersSkipped = 0;
      const rejectedRows: Array<{ rowNumber: number; reason: string }> = [];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

      const mapLocation = (value?: string | null) => {
        if (!value) return null;
        const v = value.trim();
        if (v === 'Arafat - Barwa Towers') return 'BARWA_TOWERS';
        if (v === 'Arafat - Element Hotel') return 'ELEMENT_MARIOTT';
        if (v === 'Arafat - Marina 50 Tower') return 'MARINA_50';
        return null;
      };

      const mapStatus = (value?: string | null) => {
        if (!value) return undefined;
        const v = value.trim().toLowerCase();
        if (v === 'active') return 1;
        if (v === 'inactive') return 0;
        return undefined;
      };

      const cleanPhone = (value?: string | null) => {
        if (!value) return '';
        let v = value.replace(/[\s\-()]/g, '');
        if (v.startsWith('+')) {
          v = v.slice(1);
        }
        // Qatar-specific adjustments
        const isQatar = v.startsWith('974');
        if (!isQatar && /^\d{6}$/.test(v)) {
          // 6 digits without country code - still treat as Qatar and prefix
          v = `974${v}`;
        } else if (isQatar) {
          const rest = v.slice(3);
          if (rest.length === 6) {
            // already 974 + 6 digits, keep as is
            v = `974${rest}`;
          }
          // other 974* lengths: keep as-is (logged via rejection rules below if needed)
        }
        return v;
      };

      for (let index = 0; index < records.length; index++) {
        const row = records[index];
        const rowNumber = index + 2; // header is row 1
        totalProcessed += 1;

        const reasons: string[] = [];

        const externalIdRaw = (row['ID'] ?? '').toString().trim();
        const nameRaw = (row['Name'] ?? '').toString().trim();
        const companyRaw = (row['Company'] ?? '').toString().trim();
        const emailRaw = (row['Email Address'] ?? '').toString().trim();
        const phoneRaw = (row['Phone Number'] ?? '').toString().trim();
        const locationRaw = (row['Location'] ?? '').toString().trim();
        const statusRaw = (row['Status'] ?? '').toString().trim();

        const name = nameRaw || '';
        if (!name) {
          reasons.push('Missing name');
        }

        const company = companyRaw || null;

        const email = emailRaw ? emailRaw.toLowerCase() : null;
        if (email && !emailRegex.test(email)) {
          reasons.push('Invalid email format');
        }

        let phone = cleanPhone(phoneRaw);
        if (!phone) {
          reasons.push('Invalid or missing phone');
        } else if (/[a-zA-Z]/.test(phone)) {
          reasons.push('Invalid phone (contains letters)');
        }

        const location = mapLocation(locationRaw || null);

        const status = mapStatus(statusRaw || null);
        if (status === undefined) {
          reasons.push('Invalid status');
        }

        if (reasons.length > 0) {
          rejectedRows.push({ rowNumber, reason: reasons.join('; ') });
          continue;
        }

        const externalId = externalIdRaw || null;

        // Check if host already exists by externalId (unique ID from CSV) - skip if exists
        if (externalId) {
          const existingHost = await this.prisma.host.findUnique({
            where: { externalId },
          });
          if (existingHost) {
            // Skip existing hosts - don't update them
            skipped += 1;
            continue;
          }
        }

        try {
          const createdHost = await this.prisma.host.create({
            data: {
              externalId,
              name,
              company: company ?? '',
              email,
              phone,
              location: location as any,
              status: status ?? 1,
            },
          });
          inserted += 1;

          // Auto-create User account for the new Host
          const userEmail = email || `host_${createdHost.id}@system.local`;

          // Check if User with email already exists
          const existingUserByEmail = await this.prisma.user.findUnique({
            where: { email: userEmail },
          });
          if (existingUserByEmail) {
            usersSkipped += 1;
          } else {
            // Check if User with hostId already exists
            const existingUserByHostId = await this.prisma.user.findFirst({
              where: { hostId: createdHost.id },
            });
            if (existingUserByHostId) {
              usersSkipped += 1;
            } else {
              // Generate random 32-char password
              const randomPassword = crypto.randomBytes(16).toString('hex');
              const hashedPassword = await bcrypt.hash(randomPassword, 12);

              // Create User with role=HOST and hostId
              await this.prisma.user.create({
                data: {
                  email: userEmail,
                  password: hashedPassword,
                  name: name,
                  role: 'HOST',
                  hostId: createdHost.id,
                },
              });
              usersCreated += 1;
            }
          }
        } catch (e) {
          const errorMsg = e instanceof Error ? e.message : 'Unknown database error';
          console.error(`Row ${rowNumber} database error:`, e);
          rejectedRows.push({
            rowNumber,
            reason: `Database error: ${errorMsg}`,
          });
        }
      }

      const rejected = rejectedRows.length;

      console.log(`Bulk import completed: ${totalProcessed} processed, ${inserted} inserted, ${skipped} skipped, ${rejected} rejected`);

      return {
        totalProcessed,
        inserted,
        skipped,
        rejected,
        rejectedRows,
        usersCreated,
        usersSkipped,
      };
    } catch (error) {
      // Top-level catch for any unexpected errors
      console.error('Bulk import unexpected error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async importFromXlsxBase64(base64: string, validate: boolean) {
    console.log(`XLSX import started, validate: ${validate}`);

    try {
      // Remove data URL prefix if present
      const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
      const buffer = Buffer.from(base64Data, 'base64');
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const records = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as Record<string, any>[];

      console.log(`XLSX parsed successfully, ${records.length} records found`);

      if (validate) {
        return this.validateXlsxRecords(records);
      }

      return this.processXlsxRecords(records);
    } catch (error) {
      console.error('XLSX import error:', error);
      throw new HttpException(
        `XLSX import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async validateXlsxRecords(records: Record<string, any>[]) {
    let totalProcessed = 0;
    let inserted = 0;
    let skipped = 0;
    let rejected = 0;
    const rejectedRows: Array<{ rowNumber: number; reason: string; data: any }> = [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

    const mapLocation = (value?: string | null) => {
      if (!value) return null;
      const v = value.trim();
      if (v === 'Arafat - Barwa Towers') return 'BARWA_TOWERS';
      if (v === 'Arafat - Element Hotel') return 'ELEMENT_MARIOTT';
      if (v === 'Arafat - Marina 50 Tower') return 'MARINA_50';
      return null;
    };

    const mapStatus = (value?: string | null) => {
      if (!value) return undefined;
      const v = value.trim().toLowerCase();
      if (v === 'active') return 1;
      if (v === 'inactive') return 0;
      return undefined;
    };

    const cleanPhone = (value?: string | null) => {
      if (!value) return '';
      let v = value.replace(/[\s\-()]/g, '');
      if (v.startsWith('+')) {
        v = v.slice(1);
      }
      const isQatar = v.startsWith('974');
      if (!isQatar && /^\d{6}$/.test(v)) {
        v = `974${v}`;
      } else if (isQatar) {
        const rest = v.slice(3);
        if (rest.length === 6) {
          v = `974${rest}`;
        }
      }
      return v;
    };

    for (let index = 0; index < records.length; index++) {
      const row = records[index];
      const rowNumber = index + 2;
      totalProcessed += 1;

      const reasons: string[] = [];

      const externalIdRaw = (row['ID'] || row['id'] || '').toString().trim();
      const nameRaw = (row['Name'] || row['name'] || '').toString().trim();
      const companyRaw = (row['Company'] || row['company'] || '').toString().trim();
      const emailRaw = (row['Email Address'] || row['Email'] || row['email'] || '').toString().trim();
      const phoneRaw = (row['Phone Number'] || row['Phone'] || row['phone'] || '').toString().trim();
      const locationRaw = (row['Location'] || row['location'] || '').toString().trim();
      const statusRaw = (row['Status'] || row['status'] || '').toString().trim();

      const name = nameRaw || '';
      if (!name) {
        reasons.push('Missing name');
      }

      const company = companyRaw || null;

      const email = emailRaw ? emailRaw.toLowerCase() : null;
      if (email && !emailRegex.test(email)) {
        reasons.push('Invalid email format');
      }

      let phone = cleanPhone(phoneRaw);
      if (!phone) {
        reasons.push('Invalid or missing phone');
      } else if (/[a-zA-Z]/.test(phone)) {
        reasons.push('Invalid phone (contains letters)');
      }

      const location = mapLocation(locationRaw || null);

      const status = mapStatus(statusRaw || null);
      if (status === undefined) {
        reasons.push('Invalid status');
      }

      if (reasons.length > 0) {
        rejectedRows.push({
          rowNumber,
          reason: reasons.join('; '),
          data: {
            id: externalIdRaw || '',
            name: name || '',
            company: company || '',
            email: email || '',
            phone: phone || '',
            location: locationRaw || '',
            status: statusRaw || '',
          },
        });
        rejected++;
        continue;
      }

      const externalId = externalIdRaw || null;

      // Check if host already exists by externalId
      if (externalId) {
        const existingHost = await this.prisma.host.findUnique({
          where: { externalId },
        });
        if (existingHost) {
          skipped++;
          continue;
        }
      }

      inserted++;
    }

    return {
      totalProcessed,
      inserted,
      skipped,
      rejected,
      rejectedRows,
      usersCreated: 0,
      usersSkipped: 0,
    };
  }

  private async processXlsxRecords(records: Record<string, any>[]) {
    let totalProcessed = 0;
    let inserted = 0;
    let skipped = 0;
    let usersCreated = 0;
    let usersSkipped = 0;
    const rejectedRows: Array<{ rowNumber: number; reason: string }> = [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

    const mapLocation = (value?: string | null) => {
      if (!value) return null;
      const v = value.trim();
      if (v === 'Arafat - Barwa Towers') return 'BARWA_TOWERS';
      if (v === 'Arafat - Element Hotel') return 'ELEMENT_MARIOTT';
      if (v === 'Arafat - Marina 50 Tower') return 'MARINA_50';
      return null;
    };

    const mapStatus = (value?: string | null) => {
      if (!value) return undefined;
      const v = value.trim().toLowerCase();
      if (v === 'active') return 1;
      if (v === 'inactive') return 0;
      return undefined;
    };

    const cleanPhone = (value?: string | null) => {
      if (!value) return '';
      let v = value.replace(/[\s\-()]/g, '');
      if (v.startsWith('+')) {
        v = v.slice(1);
      }
      const isQatar = v.startsWith('974');
      if (!isQatar && /^\d{6}$/.test(v)) {
        v = `974${v}`;
      } else if (isQatar) {
        const rest = v.slice(3);
        if (rest.length === 6) {
          v = `974${rest}`;
        }
      }
      return v;
    };

    for (let index = 0; index < records.length; index++) {
      const row = records[index];
      const rowNumber = index + 2;
      totalProcessed += 1;

      const reasons: string[] = [];

      const externalIdRaw = (row['ID'] || row['id'] || '').toString().trim();
      const nameRaw = (row['Name'] || row['name'] || '').toString().trim();
      const companyRaw = (row['Company'] || row['company'] || '').toString().trim();
      const emailRaw = (row['Email Address'] || row['Email'] || row['email'] || '').toString().trim();
      const phoneRaw = (row['Phone Number'] || row['Phone'] || row['phone'] || '').toString().trim();
      const locationRaw = (row['Location'] || row['location'] || '').toString().trim();
      const statusRaw = (row['Status'] || row['status'] || '').toString().trim();

      const name = nameRaw || '';
      if (!name) {
        reasons.push('Missing name');
      }

      const company = companyRaw || null;

      const email = emailRaw ? emailRaw.toLowerCase() : null;
      if (email && !emailRegex.test(email)) {
        reasons.push('Invalid email format');
      }

      let phone = cleanPhone(phoneRaw);
      if (!phone) {
        reasons.push('Invalid or missing phone');
      } else if (/[a-zA-Z]/.test(phone)) {
        reasons.push('Invalid phone (contains letters)');
      }

      const location = mapLocation(locationRaw || null);

      const status = mapStatus(statusRaw || null);
      if (status === undefined) {
        reasons.push('Invalid status');
      }

      if (reasons.length > 0) {
        rejectedRows.push({ rowNumber, reason: reasons.join('; ') });
        continue;
      }

      const externalId = externalIdRaw || null;

      // Check if host already exists by externalId
      if (externalId) {
        const existingHost = await this.prisma.host.findUnique({
          where: { externalId },
        });
        if (existingHost) {
          skipped++;
          continue;
        }
      }

      try {
        const createdHost = await this.prisma.host.create({
          data: {
            externalId,
            name,
            company: company ?? '',
            email,
            phone,
            location: location as any,
            status: status ?? 1,
          },
        });
        inserted++;

        // Auto-create User account for new Host
        const userEmail = email || `host_${createdHost.id}@system.local`;

        // Check if User with email already exists
        const existingUserByEmail = await this.prisma.user.findUnique({
          where: { email: userEmail },
        });
        if (existingUserByEmail) {
          usersSkipped++;
        } else {
          // Check if User with hostId already exists
          const existingUserByHostId = await this.prisma.user.findFirst({
            where: { hostId: createdHost.id },
          });
          if (existingUserByHostId) {
            usersSkipped++;
          } else {
            // Generate random 32-char password
            const randomPassword = crypto.randomBytes(16).toString('hex');
            const hashedPassword = await bcrypt.hash(randomPassword, 12);

            // Create User with role=HOST and hostId
            await this.prisma.user.create({
              data: {
                email: userEmail,
                password: hashedPassword,
                name: name,
                role: 'HOST',
                hostId: createdHost.id,
              },
            });
            usersCreated++;
          }
        }
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : 'Unknown database error';
        console.error(`Row ${rowNumber} database error:`, e);
        rejectedRows.push({
          rowNumber,
          reason: `Database error: ${errorMsg}`,
        });
      }
    }

    const rejected = rejectedRows.length;

    console.log(`XLSX import completed: ${totalProcessed} processed, ${inserted} inserted, ${skipped} skipped, ${rejected} rejected`);

    return {
      totalProcessed,
      inserted,
      skipped,
      rejected,
      rejectedRows,
      usersCreated,
      usersSkipped,
    };
  }

  // ============ PENDING APPROVALS ============

  @Get('dashboard/pending-approvals')
  async getPendingApprovals() {
    const pendingVisits = await this.prisma.visit.findMany({
      where: { status: 'PENDING_APPROVAL' },
      include: { host: true },
      orderBy: { expectedDate: 'asc' },
      take: 10,
    });

    return pendingVisits.map((v) => ({
      id: v.id,
      visitorName: v.visitorName,
      visitorPhone: v.visitorPhone,
      hostName: v.host?.name || 'Unknown',
      hostCompany: v.host?.company || 'Unknown',
      expectedDate: v.expectedDate?.toISOString() || v.createdAt.toISOString(),
    }));
  }

  // ============ RECEIVED DELIVERIES ============

  @Get('dashboard/received-deliveries')
  async getReceivedDeliveries() {
    const deliveries = await this.prisma.delivery.findMany({
      where: { status: 'RECEIVED' },
      include: { host: true },
      orderBy: { receivedAt: 'desc' },
      take: 10,
    });

    return deliveries.map((d) => ({
      id: d.id,
      courier: d.courier,
      recipient: d.recipient,
      hostName: d.host?.name || 'Unknown',
      hostCompany: d.host?.company || 'Unknown',
      receivedAt: d.receivedAt?.toISOString() || d.createdAt.toISOString(),
    }));
  }

  // ============ CHART DATA ============

  @Get('dashboard/charts')
  async getChartData() {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Visits per day (last 7 days)
    const visitsPerDay: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await this.prisma.visit.count({
        where: {
          checkInAt: {
            gte: date,
            lt: nextDate,
          },
        },
      });

      visitsPerDay.push({ date: date.toISOString(), count });
    }

    // Status distribution - include all statuses
    const statusCounts = await this.prisma.visit.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const statusDistribution = statusCounts.map((s) => ({
      status: s.status,
      count: s._count.status,
    }));

    // Deliveries per day (last 7 days)
    const deliveriesPerDay: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await this.prisma.delivery.count({
        where: {
          receivedAt: {
            gte: date,
            lt: nextDate,
          },
        },
      });

      deliveriesPerDay.push({ date: date.toISOString(), count });
    }

    return { visitsPerDay, statusDistribution, deliveriesPerDay };
  }

  // ============ CURRENT VISITORS (for card view) ============

  @Get('dashboard/current-visitors')
  async getCurrentVisitors() {
    const visitors = await this.prisma.visit.findMany({
      where: { status: 'CHECKED_IN' },
      include: {
        host: true,
        qrToken: true,
      },
      orderBy: { checkInAt: 'desc' },
    });

    const visitorsWithQr = await Promise.all(
      visitors.map(async (v) => {
        let qrDataUrl: string | null = null;
        if (v.qrToken?.token) {
          try {
            qrDataUrl = await QRCode.toDataURL(v.qrToken.token, {
              width: 200,
              margin: 2,
            });
          } catch (e) {
            console.error('Failed to generate QR:', e);
          }
        }

        return {
          id: v.id,
          sessionId: v.sessionId,
          visitorName: v.visitorName,
          visitorCompany: v.visitorCompany,
          visitorPhone: v.visitorPhone,
          visitorEmail: v.visitorEmail,
          hostName: v.host?.name || 'Unknown',
          hostCompany: v.host?.company || 'Unknown',
          purpose: v.purpose,
          checkInAt: v.checkInAt?.toISOString(),
          qrToken: v.qrToken?.token,
          qrDataUrl,
        };
      }),
    );

    return visitorsWithQr;
  }

  // ============ APPROVE / REJECT ACTIONS ============

  @Post('dashboard/approve/:id')
  async approveVisit(@Param('id') id: string) {
    const visit = await this.prisma.visit.findUnique({ where: { id } });
    if (!visit) {
      throw new HttpException('Visit not found', HttpStatus.NOT_FOUND);
    }

    if (visit.status !== 'PENDING_APPROVAL') {
      throw new HttpException('Invalid status for approval', HttpStatus.BAD_REQUEST);
    }

    await this.prisma.visit.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
      },
    });

    // TODO: Generate QR token and send notifications

    return { success: true, message: 'Visit approved' };
  }

  @Post('dashboard/reject/:id')
  async rejectVisit(@Param('id') id: string) {
    const visit = await this.prisma.visit.findUnique({ where: { id } });
    if (!visit) {
      throw new HttpException('Visit not found', HttpStatus.NOT_FOUND);
    }

    if (visit.status !== 'PENDING_APPROVAL') {
      throw new HttpException('Invalid status for rejection', HttpStatus.BAD_REQUEST);
    }

    await this.prisma.visit.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
      },
    });

    // TODO: Send rejection notification

    return { success: true, message: 'Visit rejected' };
  }

  // ============ CHECKOUT ============

  @Post('dashboard/checkout/:sessionId')
  async checkoutVisitor(@Param('sessionId') sessionId: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { sessionId },
    });

    if (!visit) {
      throw new HttpException('Visit not found', HttpStatus.NOT_FOUND);
    }

    if (visit.status !== 'CHECKED_IN') {
      throw new HttpException('Visitor is not checked in', HttpStatus.BAD_REQUEST);
    }

    await this.prisma.visit.update({
      where: { sessionId },
      data: {
        status: 'CHECKED_OUT',
        checkOutAt: new Date(),
      },
    });

    return { success: true, message: 'Visitor checked out' };
  }

  // ============ QR CODE GENERATION ============

  @Get('qr/:visitId')
  async getQrCode(@Param('visitId') visitId: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId },
      include: { qrToken: true },
    });

    if (!visit) {
      throw new HttpException('Visit not found', HttpStatus.NOT_FOUND);
    }

    let token = visit.qrToken?.token || visit.sessionId;

    try {
      const qrDataUrl = await QRCode.toDataURL(token, {
        width: 300,
        margin: 2,
      });
      return { qrDataUrl, token };
    } catch (e) {
      throw new HttpException('Failed to generate QR code', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ============ SEND QR (WhatsApp / Email) ============

  @Post('send-qr')
  async sendQr(@Body() body: { visitId: string; method: 'whatsapp' | 'email' }) {
    const { visitId, method } = body;

    console.log('[send-qr] Starting for visitId:', visitId, 'method:', method);

    let visit;
    try {
      visit = await this.prisma.visit.findUnique({
        where: { id: visitId },
        include: { qrToken: true, host: true },
      });
    } catch (e) {
      console.error('[send-qr] Database error:', e);
      throw new HttpException('Database error finding visit', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (!visit) {
      throw new HttpException('Visit not found', HttpStatus.NOT_FOUND);
    }

    console.log('[send-qr] Visit found:', visit.visitorName);

    const token = visit.qrToken?.token || visit.sessionId;
    let qrDataUrl: string;
    try {
      qrDataUrl = await QRCode.toDataURL(token, { width: 300, margin: 2 });
      console.log('[send-qr] QR generated, length:', qrDataUrl.length);
    } catch (e) {
      console.error('[send-qr] QR generation error:', e);
      throw new HttpException('Failed to generate QR code', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (method === 'whatsapp') {
      if (!visit.visitorPhone) {
        throw new HttpException('No phone number available', HttpStatus.BAD_REQUEST);
      }

      try {
        const qrLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/check-in?session=${token}`;
        const message = `Hello ${visit.visitorName}!\n\nYour QR code for visiting ${visit.host?.company || 'our office'} is ready.\n\nPlease use this link to access your QR code:\n${qrLink}\n\nOr show this QR code at reception for check-in.`;

        console.log('[send-qr] Sending WhatsApp to:', visit.visitorPhone);
        const sent = await this.whatsappService.send(visit.visitorPhone, message);
        console.log('[send-qr] WhatsApp result:', sent);

        if (!sent) {
          throw new HttpException('WhatsApp service failed to send message. Check configuration.', HttpStatus.SERVICE_UNAVAILABLE);
        }
        return { success: true, message: 'QR sent via WhatsApp' };
      } catch (e) {
        console.error('[send-qr] WhatsApp error:', e);
        if (e instanceof HttpException) throw e;
        throw new HttpException('Failed to send WhatsApp message: ' + (e instanceof Error ? e.message : 'Unknown error'), HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    if (method === 'email') {
      if (!visit.visitorEmail) {
        throw new HttpException('No email address available', HttpStatus.BAD_REQUEST);
      }

      try {
        console.log('[send-qr] Sending email to:', visit.visitorEmail);
        const sent = await this.emailService.send({
          to: visit.visitorEmail,
          subject: `Your Visit QR Code - ${visit.host?.company || 'Office Visit'}`,
          html: `
            <h2>Hello ${visit.visitorName}!</h2>
            <p>Your QR code for visiting <strong>${visit.host?.company || 'our office'}</strong> is ready.</p>
            <p>Please show this QR code at reception for check-in:</p>
            <img src="${qrDataUrl}" alt="QR Code" style="width: 200px; height: 200px;" />
            <p>Host: ${visit.host?.name || 'N/A'}</p>
            <p>Purpose: ${visit.purpose}</p>
            <br />
            <p>Thank you!</p>
          `,
        });
        console.log('[send-qr] Email result:', sent);

        if (!sent) {
          throw new HttpException('Email service failed to send. Check SMTP configuration.', HttpStatus.SERVICE_UNAVAILABLE);
        }
        return { success: true, message: 'QR sent via Email' };
      } catch (e) {
        console.error('[send-qr] Email error:', e);
        if (e instanceof HttpException) throw e;
        throw new HttpException('Failed to send email: ' + (e instanceof Error ? e.message : 'Unknown error'), HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    throw new HttpException('Invalid send method', HttpStatus.BAD_REQUEST);
  }

  // ============ CHANGE PASSWORD ============

  @Post('change-password')
  async changePassword(
    @Body() body: { currentPassword: string; newPassword: string; userEmail?: string },
  ) {
    // Note: In real implementation, get user from AdminJS session
    // For now, we'll require userEmail in the body (set by frontend from session)
    const { currentPassword, newPassword, userEmail } = body;

    if (!userEmail) {
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      throw new HttpException('Current password is incorrect', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { email: userEmail },
      data: { password: hashedPassword },
    });

    return { success: true, message: 'Password changed successfully' };
  }

  // ============ REPORTS ============

  @Get('reports/visitors')
  async getVisitorsReport(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('location') location?: string,
    @Query('company') company?: string,
    @Query('status') status?: string,
  ) {
    const where: any = {};

    if (dateFrom) {
      where.checkInAt = { ...where.checkInAt, gte: new Date(dateFrom) };
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      where.checkInAt = { ...where.checkInAt, lte: endDate };
    }
    if (location) {
      where.location = location;
    }
    if (status) {
      where.status = status;
    }

    const visits = await this.prisma.visit.findMany({
      where,
      include: { host: true },
      orderBy: { checkInAt: 'desc' },
    });

    // Filter by company if specified
    let filtered = visits;
    if (company) {
      filtered = visits.filter((v) =>
        v.host?.company?.toLowerCase().includes(company.toLowerCase()),
      );
    }

    return filtered;
  }

  @Get('reports/visitors/export')
  async exportVisitorsReport(
    @Res() res: Response,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('location') location?: string,
    @Query('company') company?: string,
    @Query('status') status?: string,
    @Query('format') format: 'csv' | 'excel' = 'csv',
  ) {
    const data = await this.getVisitorsReport(dateFrom, dateTo, location, company, status);

    if (format === 'csv') {
      const csv = this.generateCsv(data, [
        'visitorName',
        'visitorCompany',
        'visitorPhone',
        'visitorEmail',
        'purpose',
        'status',
        'checkInAt',
        'checkOutAt',
      ]);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=visitors-report.csv');
      return res.send(csv);
    }

    if (format === 'excel') {
      const xlsx = await import('xlsx');
      const ws = xlsx.utils.json_to_sheet(
        data.map((v: any) => ({
          'Visitor Name': v.visitorName,
          'Visitor Company': v.visitorCompany,
          'Phone': v.visitorPhone,
          'Email': v.visitorEmail || '',
          'Host': v.host?.name || '',
          'Host Company': v.host?.company || '',
          'Purpose': v.purpose,
          'Status': v.status,
          'Check In': v.checkInAt ? new Date(v.checkInAt).toLocaleString() : '',
          'Check Out': v.checkOutAt ? new Date(v.checkOutAt).toLocaleString() : '',
        })),
      );
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'Visitors');
      const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=visitors-report.xlsx');
      return res.send(buffer);
    }
  }

  @Get('reports/deliveries')
  async getDeliveriesReport(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('location') location?: string,
    @Query('company') company?: string,
    @Query('status') status?: string,
  ) {
    const where: any = {};

    if (dateFrom) {
      where.receivedAt = { ...where.receivedAt, gte: new Date(dateFrom) };
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      where.receivedAt = { ...where.receivedAt, lte: endDate };
    }
    if (location) {
      where.location = location;
    }
    if (status) {
      where.status = status;
    }

    const deliveries = await this.prisma.delivery.findMany({
      where,
      include: { host: true },
      orderBy: { receivedAt: 'desc' },
    });

    // Filter by company if specified
    let filtered = deliveries;
    if (company) {
      filtered = deliveries.filter((d) =>
        d.host?.company?.toLowerCase().includes(company.toLowerCase()),
      );
    }

    return filtered;
  }

  @Get('reports/deliveries/export')
  async exportDeliveriesReport(
    @Res() res: Response,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('location') location?: string,
    @Query('company') company?: string,
    @Query('status') status?: string,
    @Query('format') format: 'csv' | 'excel' = 'csv',
  ) {
    const data = await this.getDeliveriesReport(dateFrom, dateTo, location, company, status);

    if (format === 'csv') {
      const csv = this.generateCsv(data, [
        'courier',
        'recipient',
        'location',
        'status',
        'receivedAt',
        'pickedUpAt',
      ]);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=deliveries-report.csv');
      return res.send(csv);
    }

    if (format === 'excel') {
      const xlsx = await import('xlsx');
      const ws = xlsx.utils.json_to_sheet(
        data.map((d: any) => ({
          'Courier': d.courier,
          'Recipient': d.recipient,
          'Host': d.host?.name || '',
          'Host Company': d.host?.company || '',
          'Location': d.location,
          'Status': d.status,
          'Received At': d.receivedAt ? new Date(d.receivedAt).toLocaleString() : '',
          'Picked Up At': d.pickedUpAt ? new Date(d.pickedUpAt).toLocaleString() : '',
        })),
      );
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'Deliveries');
      const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=deliveries-report.xlsx');
      return res.send(buffer);
    }
  }

  // ============ SETTINGS ============

  @Get('settings')
  async getSettings() {
    return {
      site: {
        name: process.env.SITE_NAME || 'Arafat VMS',
        timezone: process.env.SITE_TIMEZONE || 'Asia/Qatar',
      },
      whatsapp: {
        enabled: !!(process.env.WHATSAPP_ENDPOINT && process.env.WHATSAPP_API_KEY),
        provider: 'wbiztool',
        configured: !!(process.env.WHATSAPP_ENDPOINT && process.env.WHATSAPP_CLIENT_ID && process.env.WHATSAPP_CLIENT && process.env.WHATSAPP_API_KEY),
      },
      smtp: {
        enabled: process.env.SMTP_ENABLED === 'true',
        host: process.env.SMTP_HOST || 'Not configured',
        configured: !!process.env.SMTP_HOST && !!process.env.SMTP_USER,
      },
      maintenance: {
        enabled: process.env.MAINTENANCE_MODE === 'true',
        message: process.env.MAINTENANCE_MESSAGE || 'System under maintenance',
      },
    };
  }

  @Post('settings/test-whatsapp')
  async testWhatsapp(@Body() body: { phone: string }) {
    const { phone } = body;

    if (!process.env.WHATSAPP_API_KEY || !process.env.WHATSAPP_ENDPOINT) {
      throw new HttpException('WhatsApp not configured', HttpStatus.BAD_REQUEST);
    }

    try {
      const sent = await this.whatsappService.send(
        phone,
        'This is a test message from Arafat VMS. If you received this, WhatsApp is configured correctly!',
      );
      if (!sent) {
        throw new Error('WhatsApp service returned false');
      }
      return { success: true, message: 'Test message sent' };
    } catch (e) {
      throw new HttpException('Failed to send test message', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('settings/test-email')
  async testEmail(@Body() body: { email: string }) {
    const { email } = body;

    if (!process.env.SMTP_HOST) {
      throw new HttpException('SMTP not configured', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.emailService.send({
        to: email,
        subject: 'Test Email - Arafat VMS',
        html: '<h2>Test Email</h2><p>This is a test email from Arafat VMS. If you received this, SMTP is configured correctly!</p>',
      });
      return { success: true, message: 'Test email sent' };
    } catch (e) {
      throw new HttpException('Failed to send test email', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('settings/update')
  async updateSettings(@Body() body: {
    smtp?: {
      enabled?: boolean;
      host?: string;
      port?: number;
      user?: string;
      pass?: string;
      from?: string;
    };
    whatsapp?: {
      endpoint?: string;
      clientId?: string;
      client?: string;
      apiKey?: string;
    };
    maintenance?: {
      enabled?: boolean;
      message?: string;
    };
  }) {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(process.cwd(), '.env');

    try {
      // Read current .env file
      let envContent = fs.readFileSync(envPath, 'utf8');

      // Helper to update or add env var
      const updateEnvVar = (key: string, value: string | number | boolean) => {
        const strValue = String(value);
        const regex = new RegExp(`^${key}=.*$`, 'm');
        if (regex.test(envContent)) {
          envContent = envContent.replace(regex, `${key}=${strValue}`);
        } else {
          envContent += `\n${key}=${strValue}`;
        }
        // Also update process.env for immediate effect
        process.env[key] = strValue;
      };

      // Update SMTP settings
      if (body.smtp) {
        if (body.smtp.enabled !== undefined) updateEnvVar('SMTP_ENABLED', body.smtp.enabled);
        if (body.smtp.host) updateEnvVar('SMTP_HOST', body.smtp.host);
        if (body.smtp.port) updateEnvVar('SMTP_PORT', body.smtp.port);
        if (body.smtp.user) updateEnvVar('SMTP_USER', body.smtp.user);
        if (body.smtp.pass) updateEnvVar('SMTP_PASS', body.smtp.pass);
        if (body.smtp.from) updateEnvVar('SMTP_FROM', body.smtp.from);
      }

      // Update WhatsApp settings
      if (body.whatsapp) {
        if (body.whatsapp.endpoint) updateEnvVar('WHATSAPP_ENDPOINT', body.whatsapp.endpoint);
        if (body.whatsapp.clientId) updateEnvVar('WHATSAPP_CLIENT_ID', body.whatsapp.clientId);
        if (body.whatsapp.client) updateEnvVar('WHATSAPP_CLIENT', body.whatsapp.client);
        if (body.whatsapp.apiKey) updateEnvVar('WHATSAPP_API_KEY', body.whatsapp.apiKey);
      }

      // Update Maintenance settings
      if (body.maintenance) {
        if (body.maintenance.enabled !== undefined) updateEnvVar('MAINTENANCE_MODE', body.maintenance.enabled);
        if (body.maintenance.message) updateEnvVar('MAINTENANCE_MESSAGE', body.maintenance.message);
      }

      // Write updated .env file
      fs.writeFileSync(envPath, envContent);

      return { success: true, message: 'Settings updated. Some changes may require server restart.' };
    } catch (e) {
      console.error('Failed to update settings:', e);
      throw new HttpException('Failed to update settings', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ============ HELPER METHODS ============

  private generateCsv(data: any[], columns: string[]): string {
    const header = columns.join(',');
    const rows = data.map((item) =>
      columns
        .map((col) => {
          const value = item[col];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        })
        .join(','),
    );
    return [header, ...rows].join('\n');
  }
}
