import { Injectable } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
import { PrismaService } from '../prisma/prisma.service';
import { Location } from '@prisma/client';
import { HostsService } from './hosts.service';

export interface CsvHostRow {
  Name?: string;
  Company?: string;
  'Email Address'?: string;
  'Phone Number'?: string;
  Location?: string;
  Status?: string;
  ID?: string;
}

@Injectable()
export class CsvImportService {
  constructor(
    private prisma: PrismaService,
    private hostsService: HostsService,
  ) {}

  mapLocation(loc: string | undefined): Location | null {
    if (!loc) return null;
    const s = loc.toLowerCase();
    if (s.includes('barwa')) return 'BARWA_TOWERS';
    if (s.includes('marina') && s.includes('50')) return 'MARINA_50';
    if (s.includes('element') || s.includes('mariott')) return 'ELEMENT_MARIOTT';
    return null;
  }

  private parseXlsxFromBase64(base64: string): CsvHostRow[] {
    // Remove data URL prefix if present (e.g., "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,")
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
    const buffer = Buffer.from(base64Data, 'base64');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as Record<string, any>[];
    
    // Map XLSX columns to CsvHostRow format
    return jsonData.map((row) => ({
      Name: row['Name'] || row['ID'] || '',
      Company: row['Company'] || '',
      'Email Address': row['Email Address'] || row['Email'] || '',
      'Phone Number': row['Phone Number'] || row['Phone'] || '',
      Location: row['Location'] || '',
      Status: row['Status'] || '',
      ID: row['ID'] || '',
    }));
  }

  async importFromBuffer(buffer: Buffer): Promise<{ imported: number; skipped: number; errors: string[] }> {
    const records = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    }) as CsvHostRow[];

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const name = row.Name?.trim();
      const company = row.Company?.trim();
      const phone = (row['Phone Number'] ?? '').toString().replace(/^\+/, '').trim();

      if (!name || !company) {
        skipped++;
        continue;
      }
      if (!phone || phone.length < 6) {
        skipped++;
        continue;
      }

      const externalId = row.ID?.trim() || undefined;
      const email = row['Email Address']?.trim() || undefined;

      // Check if host already exists by externalId (unique ID) - skip if exists
      if (externalId) {
        const existing = await this.prisma.host.findUnique({ where: { externalId } });
        if (existing) {
          skipped++;
          continue;
        }
      }

      const location = this.mapLocation(row.Location);
      const status = (row.Status ?? '').toLowerCase() === 'active' ? 1 : 0;

      try {
        await this.prisma.host.create({
          data: {
            name: name.substring(0, 100),
            company: company.substring(0, 100),
            email: email ? email.substring(0, 100) : undefined,
            phone: phone.substring(0, 191),
            location,
            status,
            externalId: externalId || undefined,
          },
        });
        imported++;
      } catch (e) {
        errors.push(`Row ${i + 2}: ${(e as Error).message}`);
      }
    }

    return { imported, skipped, errors };
  }

  async importFromXlsxBase64(base64: string): Promise<{ imported: number; skipped: number; errors: string[] }> {
    const records = this.parseXlsxFromBase64(base64);

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const name = row.Name?.trim();
      const company = row.Company?.trim();
      const phone = (row['Phone Number'] ?? '').toString().replace(/^\+/, '').trim();

      if (!name || !company) {
        skipped++;
        continue;
      }
      if (!phone || phone.length < 6) {
        skipped++;
        continue;
      }

      const externalId = row.ID?.trim() || undefined;
      const email = row['Email Address']?.trim() || undefined;

      // Check if host already exists by externalId (unique ID) - skip if exists
      if (externalId) {
        const existing = await this.prisma.host.findUnique({ where: { externalId } });
        if (existing) {
          skipped++;
          continue;
        }
      }

      const location = this.mapLocation(row.Location);
      const status = (row.Status ?? '').toLowerCase() === 'active' ? 1 : 0;

      try {
        await this.prisma.host.create({
          data: {
            name: name.substring(0, 100),
            company: company.substring(0, 100),
            email: email ? email.substring(0, 100) : undefined,
            phone: phone.substring(0, 191),
            location,
            status,
            externalId: externalId || undefined,
          },
        });
        imported++;
      } catch (e) {
        errors.push(`Row ${i + 2}: ${(e as Error).message}`);
      }
    }

    return { imported, skipped, errors };
  }

  async validateFromXlsxBase64(base64: string): Promise<{
    totalProcessed: number;
    inserted: number;
    skipped: number;
    rejected: number;
    rejectedRows: Array<{ rowNumber: number; reason: string; data: any }>;
    usersCreated: number;
    usersSkipped: number;
  }> {
    const records = this.parseXlsxFromBase64(base64);

    let inserted = 0;
    let skipped = 0;
    let rejected = 0;
    const rejectedRows: Array<{ rowNumber: number; reason: string; data: any }> = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const name = row.Name?.trim();
      const company = row.Company?.trim();
      const phone = (row['Phone Number'] ?? '').toString().replace(/^\+/, '').trim();
      const email = row['Email Address']?.trim();
      const externalId = row.ID?.trim();

      // Validation
      if (!name) {
        rejected++;
        rejectedRows.push({
          rowNumber: i + 2,
          reason: 'Name is required',
          data: {
            id: externalId || '',
            name: name || '',
            company: row.Company || '',
            email: email || '',
            phone: phone || '',
            location: row.Location || '',
            status: row.Status || '',
          },
        });
        continue;
      }

      if (!company) {
        rejected++;
        rejectedRows.push({
          rowNumber: i + 2,
          reason: 'Company is required',
          data: {
            id: externalId || '',
            name: name || '',
            company: company || '',
            email: email || '',
            phone: phone || '',
            location: row.Location || '',
            status: row.Status || '',
          },
        });
        continue;
      }

      if (!phone || phone.length < 6) {
        rejected++;
        rejectedRows.push({
          rowNumber: i + 2,
          reason: 'Phone number must be at least 6 characters',
          data: {
            id: externalId || '',
            name: name || '',
            company: company || '',
            email: email || '',
            phone: phone || '',
            location: row.Location || '',
            status: row.Status || '',
          },
        });
        continue;
      }

      // Check if host already exists by externalId
      if (externalId) {
        const existing = await this.prisma.host.findUnique({ where: { externalId } });
        if (existing) {
          skipped++;
          continue;
        }
      }

      inserted++;
    }

    return {
      totalProcessed: records.length,
      inserted,
      skipped,
      rejected,
      rejectedRows,
      usersCreated: 0,
      usersSkipped: 0,
    };
  }

  async validateFromCsvBuffer(buffer: Buffer): Promise<{
    totalProcessed: number;
    inserted: number;
    skipped: number;
    rejected: number;
    rejectedRows: Array<{ rowNumber: number; reason: string; data: any }>;
    usersCreated: number;
    usersSkipped: number;
  }> {
    const records = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    }) as CsvHostRow[];

    let inserted = 0;
    let skipped = 0;
    let rejected = 0;
    const rejectedRows: Array<{ rowNumber: number; reason: string; data: any }> = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const name = row.Name?.trim();
      const company = row.Company?.trim();
      const phone = (row['Phone Number'] ?? '').toString().replace(/^\+/, '').trim();
      const email = row['Email Address']?.trim();
      const externalId = row.ID?.trim();

      // Validation
      if (!name) {
        rejected++;
        rejectedRows.push({
          rowNumber: i + 2,
          reason: 'Name is required',
          data: {
            id: externalId || '',
            name: name || '',
            company: row.Company || '',
            email: email || '',
            phone: phone || '',
            location: row.Location || '',
            status: row.Status || '',
          },
        });
        continue;
      }

      if (!company) {
        rejected++;
        rejectedRows.push({
          rowNumber: i + 2,
          reason: 'Company is required',
          data: {
            id: externalId || '',
            name: name || '',
            company: company || '',
            email: email || '',
            phone: phone || '',
            location: row.Location || '',
            status: row.Status || '',
          },
        });
        continue;
      }

      if (!phone || phone.length < 6) {
        rejected++;
        rejectedRows.push({
          rowNumber: i + 2,
          reason: 'Phone number must be at least 6 characters',
          data: {
            id: externalId || '',
            name: name || '',
            company: company || '',
            email: email || '',
            phone: phone || '',
            location: row.Location || '',
            status: row.Status || '',
          },
        });
        continue;
      }

      // Check if host already exists by externalId
      if (externalId) {
        const existing = await this.prisma.host.findUnique({ where: { externalId } });
        if (existing) {
          skipped++;
          continue;
        }
      }

      inserted++;
    }

    return {
      totalProcessed: records.length,
      inserted,
      skipped,
      rejected,
      rejectedRows,
      usersCreated: 0,
      usersSkipped: 0,
    };
  }
}
