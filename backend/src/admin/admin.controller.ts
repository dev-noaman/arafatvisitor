import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Res,
  Req,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "../notifications/email.service";
import { WhatsAppService } from "../notifications/whatsapp.service";
import { BadgeGeneratorService } from "../notifications/badge-generator.service";
import { Public } from "../common/decorators/public.decorator";
import * as bcrypt from "bcrypt";
import * as QRCode from "qrcode";
import * as crypto from "crypto";
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";
import { Prisma } from "@prisma/client";
// csv-parse import moved to dynamic import inside method for ESM compatibility

// Type for visit with host relation
type VisitWithHost = Prisma.VisitGetPayload<{ include: { host: true } }>;

// Type for delivery with host relation
type DeliveryWithHost = Prisma.DeliveryGetPayload<{ include: { host: true } }>;

// Note: These endpoints are meant to be accessed through the AdminJS session
// They use @Public() to bypass JWT auth - they rely on AdminJS cookie authentication
// @SkipThrottle() bypasses rate limiting for admin panel which makes many concurrent requests

@Controller("admin/api")
@SkipThrottle() // Bypass rate limiting - admin panel makes many concurrent API calls
@Public() // Bypass JWT auth - AdminJS uses cookie-based session auth
export class AdminApiController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly whatsappService: WhatsAppService,
    private readonly badgeGeneratorService: BadgeGeneratorService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ============ AUTHENTICATION ============

  @Post("login")
  async login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;

    if (!email || !password) {
      throw new HttpException(
        "Email and password are required",
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { host: true },
    });

    if (!user) {
      throw new HttpException("Invalid credentials", HttpStatus.UNAUTHORIZED);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new HttpException("Invalid credentials", HttpStatus.UNAUTHORIZED);
    }

    const payload = { sub: user.id, email: user.email, role: user.role, name: user.name };
    const token = this.jwtService.sign(payload, {
      expiresIn: this.configService.get("JWT_EXPIRES_IN") || "24h",
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hostId: user.hostId,
      },
    };
  }

  // ============ DASHBOARD KPIs ============

  @Get("dashboard/kpis")
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

  @Get("profile")
  async getProfile(@Query("email") email?: string) {
    if (!email) {
      throw new HttpException("Email is required", HttpStatus.BAD_REQUEST);
    }
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }
    return { name: user.name, email: user.email, role: user.role };
  }

  @Post("profile/update")
  async updateProfile(@Body() body: { email: string; name?: string }) {
    const { email, name } = body ?? { email: "", name: undefined };
    if (!email) {
      throw new HttpException("Email is required", HttpStatus.BAD_REQUEST);
    }
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }
    const updated = await this.prisma.user.update({
      where: { email },
      data: { name: name ?? user.name },
    });
    return { name: updated.name, email: updated.email, role: updated.role };
  }

  // ============ DEBUG ENDPOINT ============

  @Get("debug/delivery/:id")
  async debugDelivery(@Param("id") id: string, @Req() req: any) {
    console.log(`[DEBUG] Checking delivery with id: ${id}`);
    console.log(`[DEBUG] Session data:`, req.session);

    const delivery = await this.prisma.delivery.findUnique({
      where: { id: BigInt(id) as any },
      include: { host: true },
    });

    if (!delivery) {
      console.log(`[DEBUG] Delivery not found with id: ${id}`);
      return { error: "Delivery not found", id };
    }

    console.log(`[DEBUG] Delivery found:`, {
      id: delivery.id.toString(),
      status: delivery.status,
      courier: delivery.courier,
      recipient: delivery.recipient,
      hostId: delivery.hostId?.toString(),
    });

    return {
      delivery: {
        id: delivery.id.toString(),
        status: delivery.status,
        courier: delivery.courier,
        recipient: delivery.recipient,
        hostId: delivery.hostId?.toString(),
        host: (delivery as any).host
          ? {
              id: (delivery as any).host.id.toString(),
              name: (delivery as any).host.name,
              company: (delivery as any).host.company,
            }
          : null,
        receivedAt: delivery.receivedAt,
        pickedUpAt: delivery.pickedUpAt,
      },
      session: req.session,
    };
  }

  // ============ HOSTS BULK IMPORT ============

  @Post("hosts/import")
  async importHosts(
    @Body() body: { csvContent?: string; xlsxContent?: string },
    @Query("validate") validate?: string,
  ) {
    console.log(
      "Bulk import request received, body keys:",
      body ? Object.keys(body) : "null",
    );

    const isValidate = validate === "true";

    try {
      const { csvContent, xlsxContent } = body || {};

      if (!csvContent && !xlsxContent) {
        throw new HttpException(
          "csvContent or xlsxContent is required",
          HttpStatus.BAD_REQUEST,
        );
      }

      // Handle XLSX content
      if (xlsxContent) {
        console.log(
          `XLSX content received, length: ${xlsxContent.length} chars`,
        );
        return this.importFromXlsxBase64(xlsxContent, isValidate);
      }

      // Handle CSV content
      if (!csvContent || typeof csvContent !== "string" || !csvContent.trim()) {
        console.log("csvContent validation failed:", {
          hasBody: !!body,
          hasCsvContent: !!csvContent,
          type: typeof csvContent,
        });
        throw new HttpException(
          "csvContent is required",
          HttpStatus.BAD_REQUEST,
        );
      }

      console.log(`CSV content received, length: ${csvContent.length} chars`);

      let records: Record<string, unknown>[];
      try {
        // Dynamic import for ESM compatibility
        const csvParseModule = await import("csv-parse/sync");
        // csv-parse/sync exports { parse } directly
        const parse = (
          csvParseModule as {
            parse: (
              input: string,
              options: unknown,
            ) => Record<string, unknown>[];
          }
        ).parse;
        if (typeof parse !== "function") {
          console.error(
            "csv-parse module exports:",
            Object.keys(csvParseModule),
          );
          throw new Error("csv-parse parse function not found");
        }
        records = parse(csvContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        });
        console.log(`CSV parsed successfully, ${records.length} records found`);
      } catch (e) {
        console.error("CSV parse error:", e);
        throw new HttpException(
          `Failed to parse CSV: ${e instanceof Error ? e.message : "Unknown error"}`,
          HttpStatus.BAD_REQUEST,
        );
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
        if (v === "Arafat - Barwa Towers") return "BARWA_TOWERS";
        if (v === "Arafat - Element Hotel") return "ELEMENT_MARIOTT";
        if (v === "Arafat - Marina 50 Tower") return "MARINA_50";
        return null;
      };

      const mapStatus = (value?: string | null) => {
        if (!value) return undefined;
        const v = value.trim().toLowerCase();
        if (v === "active") return 1;
        if (v === "inactive") return 0;
        return undefined;
      };

      const cleanPhone = (value?: string | null) => {
        if (!value) return "";
        let v = value.replace(/[\s\-()]/g, "");
        if (v.startsWith("+")) {
          v = v.slice(1);
        }
        // Qatar-specific adjustments
        const isQatar = v.startsWith("974");
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

        const externalIdRaw = (row["ID"] ?? "").toString().trim();
        const nameRaw = (row["Name"] ?? "").toString().trim();
        const companyRaw = (row["Company"] ?? "").toString().trim();
        const emailRaw = (row["Email Address"] ?? "").toString().trim();
        const phoneRaw = (row["Phone Number"] ?? "").toString().trim();
        const locationRaw = (row["Location"] ?? "").toString().trim();
        const statusRaw = (row["Status"] ?? "").toString().trim();

        const name = nameRaw || "";
        if (!name) {
          reasons.push("Missing name");
        }

        const company = companyRaw || null;

        const email = emailRaw ? emailRaw.toLowerCase() : null;
        if (email && !emailRegex.test(email)) {
          reasons.push("Invalid email format");
        }

        const phone: string = cleanPhone(phoneRaw);
        if (!phone) {
          reasons.push("Invalid or missing phone");
        } else if (/[a-zA-Z]/.test(phone)) {
          reasons.push("Invalid phone (contains letters)");
        }

        const location = mapLocation(locationRaw || null);

        const status = mapStatus(statusRaw || null);
        if (status === undefined) {
          reasons.push("Invalid status");
        }

        if (reasons.length > 0) {
          rejectedRows.push({ rowNumber, reason: reasons.join("; ") });
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
              company: company ?? "",
              email,
              phone,
              location: location as
                | "BARWA_TOWERS"
                | "ELEMENT_MARIOTT"
                | "MARINA_50"
                | null,
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
              const randomPassword = crypto.randomBytes(16).toString("hex");
              const hashedPassword = await bcrypt.hash(randomPassword, 12);

              // Create User with role=HOST and hostId
              await this.prisma.user.create({
                data: {
                  email: userEmail,
                  password: hashedPassword,
                  name: name,
                  role: "HOST",
                  hostId: createdHost.id,
                },
              });
              usersCreated += 1;
            }
          }
        } catch (e) {
          const errorMsg =
            e instanceof Error ? e.message : "Unknown database error";
          console.error(`Row ${rowNumber} database error:`, e);
          rejectedRows.push({
            rowNumber,
            reason: `Database error: ${errorMsg}`,
          });
        }
      }

      const rejected = rejectedRows.length;

      console.log(
        `Bulk import completed: ${totalProcessed} processed, ${inserted} inserted, ${skipped} skipped, ${rejected} rejected`,
      );

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
      console.error("Bulk import unexpected error:", error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Import failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async importFromXlsxBase64(base64: string, validate: boolean) {
    console.log(`XLSX import started, validate: ${validate}`);

    try {
      // Remove data URL prefix if present
      const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;
      const buffer = Buffer.from(base64Data, "base64");
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const records = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
      }) as Record<string, unknown>[];

      console.log(`XLSX parsed successfully, ${records.length} records found`);

      if (validate) {
        return this.validateXlsxRecords(records);
      }

      return this.processXlsxRecords(records);
    } catch (error) {
      console.error("XLSX import error:", error);
      throw new HttpException(
        `XLSX import failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async validateXlsxRecords(records: Record<string, unknown>[]) {
    let totalProcessed = 0;
    let inserted = 0;
    let skipped = 0;
    let rejected = 0;
    const rejectedRows: Array<{
      rowNumber: number;
      reason: string;
      data: Record<string, string>;
    }> = [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

    const mapLocation = (value?: string | null) => {
      if (!value) return null;
      const v = value.trim();
      if (v === "Arafat - Barwa Towers") return "BARWA_TOWERS";
      if (v === "Arafat - Element Hotel") return "ELEMENT_MARIOTT";
      if (v === "Arafat - Marina 50 Tower") return "MARINA_50";
      return null;
    };

    const mapStatus = (value?: string | null) => {
      if (!value) return undefined;
      const v = value.trim().toLowerCase();
      if (v === "active") return 1;
      if (v === "inactive") return 0;
      return undefined;
    };

    const cleanPhone = (value?: string | null) => {
      if (!value) return "";
      let v = value.replace(/[\s\-()]/g, "");
      if (v.startsWith("+")) {
        v = v.slice(1);
      }
      const isQatar = v.startsWith("974");
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

      const externalIdRaw = (row["ID"] || row["id"] || "").toString().trim();
      const nameRaw = (row["Name"] || row["name"] || "").toString().trim();
      const companyRaw = (row["Company"] || row["company"] || "")
        .toString()
        .trim();
      const emailRaw = (
        row["Email Address"] ||
        row["Email"] ||
        row["email"] ||
        ""
      )
        .toString()
        .trim();
      const phoneRaw = (
        row["Phone Number"] ||
        row["Phone"] ||
        row["phone"] ||
        ""
      )
        .toString()
        .trim();
      const locationRaw = (row["Location"] || row["location"] || "")
        .toString()
        .trim();
      const statusRaw = (row["Status"] || row["status"] || "")
        .toString()
        .trim();

      const name = nameRaw || "";
      if (!name) {
        reasons.push("Missing name");
      }

      const company = companyRaw || null;

      const email = emailRaw ? emailRaw.toLowerCase() : null;
      if (email && !emailRegex.test(email)) {
        reasons.push("Invalid email format");
      }

      const phone: string = cleanPhone(phoneRaw);
      if (!phone) {
        reasons.push("Invalid or missing phone");
      } else if (/[a-zA-Z]/.test(phone)) {
        reasons.push("Invalid phone (contains letters)");
      }

      const location = mapLocation(locationRaw || null);
      if (locationRaw && !location) {
        reasons.push("Invalid location");
      }

      const status = mapStatus(statusRaw || null);
      if (status === undefined) {
        reasons.push("Invalid status");
      }

      if (reasons.length > 0) {
        rejectedRows.push({
          rowNumber,
          reason: reasons.join("; "),
          data: {
            id: externalIdRaw || "",
            name: name || "",
            company: company || "",
            email: email || "",
            phone: phone || "",
            location: locationRaw || "",
            status: statusRaw || "",
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

  private async processXlsxRecords(records: Record<string, unknown>[]) {
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
      if (v === "Arafat - Barwa Towers") return "BARWA_TOWERS";
      if (v === "Arafat - Element Hotel") return "ELEMENT_MARIOTT";
      if (v === "Arafat - Marina 50 Tower") return "MARINA_50";
      return null;
    };

    const mapStatus = (value?: string | null) => {
      if (!value) return undefined;
      const v = value.trim().toLowerCase();
      if (v === "active") return 1;
      if (v === "inactive") return 0;
      return undefined;
    };

    const cleanPhone = (value?: string | null) => {
      if (!value) return "";
      let v = value.replace(/[\s\-()]/g, "");
      if (v.startsWith("+")) {
        v = v.slice(1);
      }
      const isQatar = v.startsWith("974");
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

      const externalIdRaw = (row["ID"] || row["id"] || "").toString().trim();
      const nameRaw = (row["Name"] || row["name"] || "").toString().trim();
      const companyRaw = (row["Company"] || row["company"] || "")
        .toString()
        .trim();
      const emailRaw = (
        row["Email Address"] ||
        row["Email"] ||
        row["email"] ||
        ""
      )
        .toString()
        .trim();
      const phoneRaw = (
        row["Phone Number"] ||
        row["Phone"] ||
        row["phone"] ||
        ""
      )
        .toString()
        .trim();
      const locationRaw = (row["Location"] || row["location"] || "")
        .toString()
        .trim();
      const statusRaw = (row["Status"] || row["status"] || "")
        .toString()
        .trim();

      const name = nameRaw || "";
      if (!name) {
        reasons.push("Missing name");
      }

      const company = companyRaw || null;

      const email = emailRaw ? emailRaw.toLowerCase() : null;
      if (email && !emailRegex.test(email)) {
        reasons.push("Invalid email format");
      }

      const phone = cleanPhone(phoneRaw);
      if (!phone) {
        reasons.push("Invalid or missing phone");
      } else if (/[a-zA-Z]/.test(phone)) {
        reasons.push("Invalid phone (contains letters)");
      }

      const location = mapLocation(locationRaw || null);

      const status = mapStatus(statusRaw || null);
      if (status === undefined) {
        reasons.push("Invalid status");
      }

      if (reasons.length > 0) {
        rejectedRows.push({ rowNumber, reason: reasons.join("; ") });
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
            company: company ?? "",
            email,
            phone,
            location: location as
              | "BARWA_TOWERS"
              | "ELEMENT_MARIOTT"
              | "MARINA_50"
              | null,
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
            const randomPassword = crypto.randomBytes(16).toString("hex");
            const hashedPassword = await bcrypt.hash(randomPassword, 12);

            // Create User with role=HOST and hostId
            await this.prisma.user.create({
              data: {
                email: userEmail,
                password: hashedPassword,
                name: name,
                role: "HOST",
                hostId: createdHost.id,
              },
            });
            usersCreated++;
          }
        }
      } catch (e) {
        const errorMsg =
          e instanceof Error ? e.message : "Unknown database error";
        console.error(`Row ${rowNumber} database error:`, e);
        rejectedRows.push({
          rowNumber,
          reason: `Database error: ${errorMsg}`,
        });
      }
    }

    const rejected = rejectedRows.length;

    console.log(
      `XLSX import completed: ${totalProcessed} processed, ${inserted} inserted, ${skipped} skipped, ${rejected} rejected`,
    );

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

  @Get("dashboard/pending-approvals")
  async getPendingApprovals() {
    // Dashboard only shows PENDING_APPROVAL (clean view)
    // Rejected visits are managed in PreRegister resource page
    const visits = await this.prisma.visit.findMany({
      where: { status: "PENDING_APPROVAL" },
      include: { host: true },
      orderBy: { expectedDate: "asc" },
      take: 10,
    });

    return visits.map((v) => ({
      id: v.id,
      visitorName: v.visitorName,
      visitorPhone: v.visitorPhone,
      hostName: v.host?.name || "Unknown",
      hostCompany: v.host?.company || "Unknown",
      expectedDate: v.expectedDate?.toISOString() || v.createdAt.toISOString(),
    }));
  }

  // ============ RECEIVED DELIVERIES ============

  @Get("dashboard/received-deliveries")
  async getReceivedDeliveries() {
    const deliveries = await this.prisma.delivery.findMany({
      where: { status: "RECEIVED" },
      include: { host: true },
      orderBy: { receivedAt: "desc" },
      take: 10,
    });

    return deliveries.map((d) => ({
      id: d.id,
      courier: d.courier,
      recipient: d.recipient,
      hostName: d.host?.name || "Unknown",
      hostCompany: d.host?.company || "Unknown",
      receivedAt: d.receivedAt?.toISOString() || d.createdAt.toISOString(),
    }));
  }

  // ============ CHART DATA ============

  @Get("dashboard/charts")
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
      by: ["status"],
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

  @Get("dashboard/current-visitors")
  async getCurrentVisitors() {
    const visitors = await this.prisma.visit.findMany({
      where: { status: "CHECKED_IN" },
      include: {
        host: true,
        qrToken: true,
      },
      orderBy: { checkInAt: "desc" },
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
            console.error("Failed to generate QR:", e);
          }
        }

        return {
          id: v.id,
          sessionId: v.sessionId,
          visitorName: v.visitorName,
          visitorCompany: v.visitorCompany,
          visitorPhone: v.visitorPhone,
          visitorEmail: v.visitorEmail,
          hostName: v.host?.name || "Unknown",
          hostCompany: v.host?.company || "Unknown",
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

  @Post("dashboard/approve/:id")
  async approveVisit(@Param("id") id: string) {
    const visit = await this.prisma.visit.findUnique({ where: { id } });
    if (!visit) {
      throw new HttpException("Visit not found", HttpStatus.NOT_FOUND);
    }

    // Allow approving from PENDING_APPROVAL or REJECTED (re-approve)
    if (visit.status !== "PENDING_APPROVAL" && visit.status !== "REJECTED") {
      throw new HttpException(
        "Invalid status for approval",
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.visit.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        // Clear rejection data when re-approving
        rejectedAt: null,
        rejectionReason: null,
      },
    });

    // TODO: Generate QR token and send notifications

    return { success: true, message: "Visit approved" };
  }

  @Post("dashboard/reject/:id")
  async rejectVisit(@Param("id") id: string) {
    const visit = await this.prisma.visit.findUnique({ where: { id } });
    if (!visit) {
      throw new HttpException("Visit not found", HttpStatus.NOT_FOUND);
    }

    if (visit.status !== "PENDING_APPROVAL") {
      throw new HttpException(
        "Invalid status for rejection",
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.visit.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
      },
    });

    // TODO: Send rejection notification

    return { success: true, message: "Visit rejected" };
  }

  // ============ CHECKOUT ============

  @Post("dashboard/checkout/:sessionId")
  async checkoutVisitor(@Param("sessionId") sessionId: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { sessionId },
    });

    if (!visit) {
      throw new HttpException("Visit not found", HttpStatus.NOT_FOUND);
    }

    if (visit.status !== "CHECKED_IN") {
      throw new HttpException(
        "Visitor is not checked in",
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.visit.update({
      where: { sessionId },
      data: {
        status: "CHECKED_OUT",
        checkOutAt: new Date(),
      },
    });

    return { success: true, message: "Visitor checked out" };
  }

  // ============ QR CODE GENERATION ============

  @Get("qr/:visitId")
  async getQrCode(@Param("visitId") visitId: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId },
      include: { qrToken: true },
    });

    if (!visit) {
      throw new HttpException("Visit not found", HttpStatus.NOT_FOUND);
    }

    const token = visit.qrToken?.token || visit.sessionId;

    try {
      const qrDataUrl = await QRCode.toDataURL(token, {
        width: 300,
        margin: 2,
      });
      return { qrDataUrl, token };
    } catch (e) {
      throw new HttpException(
        "Failed to generate QR code",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ============ SEND QR (WhatsApp / Email) ============

  @Post("send-qr")
  async sendQr(
    @Body() body: { visitId: string; method: "whatsapp" | "email" },
  ) {
    const { visitId, method } = body;

    console.log("[send-qr] Starting for visitId:", visitId, "method:", method);

    let visit;
    try {
      visit = await this.prisma.visit.findUnique({
        where: { id: visitId },
        include: { qrToken: true, host: true },
      });
    } catch (e) {
      console.error("[send-qr] Database error:", e);
      throw new HttpException(
        "Database error finding visit",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!visit) {
      throw new HttpException("Visit not found", HttpStatus.NOT_FOUND);
    }

    console.log("[send-qr] Visit found:", visit.visitorName);

    const token = visit.qrToken?.token || visit.sessionId;
    let qrDataUrl: string;
    try {
      qrDataUrl = await QRCode.toDataURL(token, { width: 300, margin: 2 });
      console.log("[send-qr] QR generated, length:", qrDataUrl.length);
    } catch (e) {
      console.error("[send-qr] QR generation error:", e);
      throw new HttpException(
        "Failed to generate QR code",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (method === "whatsapp") {
      if (!visit.visitorPhone) {
        throw new HttpException(
          "No phone number available",
          HttpStatus.BAD_REQUEST,
        );
      }

      try {
        console.log("[send-qr] Generating visitor badge image...");

        // Generate visitor badge image
        const badgeBase64 = await this.badgeGeneratorService.generateVisitorBadge({
          visitorName: visit.visitorName,
          visitorCompany: visit.visitorCompany || undefined,
          hostName: visit.host?.name || "N/A",
          hostCompany: visit.host?.company || "Arafat Group",
          location: visit.location || "BARWA_TOWERS",
          purpose: visit.purpose || "Visit",
          sessionId: token,
          visitDate: visit.expectedDate || new Date(),
        });

        console.log("[send-qr] Badge generated, sending via WhatsApp to:", visit.visitorPhone);

        // Send image via WhatsApp (msg_type: 1 for image)
        const sent = await this.whatsappService.sendImage(
          visit.visitorPhone,
          badgeBase64,
          `Visitor Pass for ${visit.visitorName}`
        );
        console.log("[send-qr] WhatsApp image result:", sent);

        if (!sent) {
          throw new HttpException(
            "WhatsApp service failed to send image. Check configuration.",
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }
        return {
          success: true,
          message: "Visitor pass sent via WhatsApp",
        };
      } catch (e) {
        console.error("[send-qr] WhatsApp error:", e);
        if (e instanceof HttpException) throw e;
        throw new HttpException(
          "Failed to send WhatsApp message: " +
            (e instanceof Error ? e.message : "Unknown error"),
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    if (method === "email") {
      if (!visit.visitorEmail) {
        throw new HttpException(
          "No email address available",
          HttpStatus.BAD_REQUEST,
        );
      }

      try {
        console.log("[send-qr] Sending email to:", visit.visitorEmail);
        const sent = await this.emailService.send({
          to: visit.visitorEmail,
          subject: `Your Visit QR Code - ${visit.host?.company || "Office Visit"}`,
          html: `
            <h2>Hello ${visit.visitorName}!</h2>
            <p>Your QR code for visiting <strong>${visit.host?.company || "our office"}</strong> is ready.</p>
            <p>Please show this QR code at reception for check-in:</p>
            <img src="${qrDataUrl}" alt="QR Code" style="width: 200px; height: 200px;" />
            <p>Host: ${visit.host?.name || "N/A"}</p>
            <p>Purpose: ${visit.purpose}</p>
            <br />
            <p>Thank you!</p>
          `,
        });
        console.log("[send-qr] Email result:", sent);

        if (!sent) {
          throw new HttpException(
            "Email service failed to send. Check SMTP configuration.",
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }
        return { success: true, message: "QR sent via Email" };
      } catch (e) {
        console.error("[send-qr] Email error:", e);
        if (e instanceof HttpException) throw e;
        throw new HttpException(
          "Failed to send email: " +
            (e instanceof Error ? e.message : "Unknown error"),
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    throw new HttpException("Invalid send method", HttpStatus.BAD_REQUEST);
  }

  // ============ CHANGE PASSWORD ============

  @Post("change-password")
  async changePassword(
    @Body()
    body: {
      currentPassword: string;
      newPassword: string;
      userEmail?: string;
    },
  ) {
    // Note: In real implementation, get user from AdminJS session
    // For now, we'll require userEmail in the body (set by frontend from session)
    const { currentPassword, newPassword, userEmail } = body;

    if (!userEmail) {
      throw new HttpException(
        "User not authenticated",
        HttpStatus.UNAUTHORIZED,
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      throw new HttpException(
        "Current password is incorrect",
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { email: userEmail },
      data: { password: hashedPassword },
    });

    return { success: true, message: "Password changed successfully" };
  }

  // ============ REPORTS ============

  @Get("reports")
  async getReportsSummary(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    // Get summary statistics
    const [
      totalVisits,
      approvedVisits,
      checkedInVisits,
      totalDeliveries,
      deliveriesPickedUp,
      activeHosts,
    ] = await Promise.all([
      this.prisma.visit.count({
        where: { createdAt: { gte: start, lte: end } },
      }),
      this.prisma.visit.count({
        where: { status: "APPROVED", createdAt: { gte: start, lte: end } },
      }),
      this.prisma.visit.count({
        where: { status: "CHECKED_IN", createdAt: { gte: start, lte: end } },
      }),
      this.prisma.delivery.count({
        where: { createdAt: { gte: start, lte: end } },
      }),
      this.prisma.delivery.count({
        where: { status: "PICKED_UP", createdAt: { gte: start, lte: end } },
      }),
      this.prisma.host.count({ where: { status: 1 } }),
    ]);

    // Get visit reports grouped by date
    const visits = await this.prisma.visit.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { createdAt: true, status: true },
    });

    const visitsByDate = new Map<string, { total: number; approved: number; checkedIn: number; checkedOut: number; pending: number; rejected: number }>();
    visits.forEach((v) => {
      const dateKey = v.createdAt.toISOString().split("T")[0];
      if (!visitsByDate.has(dateKey)) {
        visitsByDate.set(dateKey, { total: 0, approved: 0, checkedIn: 0, checkedOut: 0, pending: 0, rejected: 0 });
      }
      const entry = visitsByDate.get(dateKey)!;
      entry.total++;
      if (v.status === "APPROVED") entry.approved++;
      else if (v.status === "CHECKED_IN") entry.checkedIn++;
      else if (v.status === "CHECKED_OUT") entry.checkedOut++;
      else if (v.status === "PENDING_APPROVAL" || v.status === "PRE_REGISTERED") entry.pending++;
      else if (v.status === "REJECTED") entry.rejected++;
    });

    const visitReports = Array.from(visitsByDate.entries()).map(([date, data]) => ({
      date,
      totalVisits: data.total,
      checkedIn: data.checkedIn,
      checkedOut: data.checkedOut,
      pending: data.pending,
      approved: data.approved,
      rejected: data.rejected,
    }));

    // Get delivery reports grouped by date
    const deliveries = await this.prisma.delivery.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { createdAt: true, status: true },
    });

    const deliveriesByDate = new Map<string, { total: number; pickedUp: number; pending: number }>();
    deliveries.forEach((d) => {
      const dateKey = d.createdAt.toISOString().split("T")[0];
      if (!deliveriesByDate.has(dateKey)) {
        deliveriesByDate.set(dateKey, { total: 0, pickedUp: 0, pending: 0 });
      }
      const entry = deliveriesByDate.get(dateKey)!;
      entry.total++;
      if (d.status === "PICKED_UP") entry.pickedUp++;
      else entry.pending++;
    });

    const deliveryReports = Array.from(deliveriesByDate.entries()).map(([date, data]) => ({
      date,
      totalDeliveries: data.total,
      pickedUp: data.pickedUp,
      pending: data.pending,
    }));

    // Get host reports
    const hostsWithVisits = await this.prisma.host.findMany({
      where: { status: 1 },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            visits: {
              where: { createdAt: { gte: start, lte: end } },
            },
          },
        },
      },
      take: 10,
      orderBy: { visits: { _count: "desc" } },
    });

    const hostReports = hostsWithVisits.map((h) => ({
      hostId: String(h.id),
      hostName: h.name,
      totalVisits: h._count.visits,
    }));

    return {
      summary: {
        totalVisits,
        approvedVisits,
        checkedInVisits,
        totalDeliveries,
        deliveriesPickedUp,
        activeHosts,
      },
      visitReports,
      deliveryReports,
      hostReports,
    };
  }

  @Get("reports/visitors")
  async getVisitorsReport(
    @Query("dateFrom") dateFrom?: string,
    @Query("dateTo") dateTo?: string,
    @Query("location") location?: string,
    @Query("company") company?: string,
    @Query("status") status?: string,
  ): Promise<VisitWithHost[]> {
    const where: Prisma.VisitWhereInput = {};

    if (dateFrom || dateTo) {
      where.checkInAt = {};
      if (dateFrom) {
        where.checkInAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.checkInAt.lte = endDate;
      }
    }
    if (location) {
      where.location = location as Prisma.EnumLocationFilter;
    }
    if (status) {
      where.status = status as Prisma.EnumVisitStatusFilter;
    }

    const visits = await this.prisma.visit.findMany({
      where,
      include: { host: true },
      orderBy: { checkInAt: "desc" },
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

  @Get("reports/visitors/export")
  async exportVisitorsReport(
    @Res() res: Response,
    @Query("dateFrom") dateFrom?: string,
    @Query("dateTo") dateTo?: string,
    @Query("location") location?: string,
    @Query("company") company?: string,
    @Query("status") status?: string,
    @Query("format") format: "csv" | "excel" = "csv",
  ) {
    const data = await this.getVisitorsReport(
      dateFrom,
      dateTo,
      location,
      company,
      status,
    );

    if (format === "csv") {
      const csv = this.generateCsv(data, [
        "visitorName",
        "visitorCompany",
        "visitorPhone",
        "visitorEmail",
        "purpose",
        "status",
        "checkInAt",
        "checkOutAt",
      ]);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=visitors-report.csv",
      );
      return res.send(csv);
    }

    if (format === "excel") {
      const xlsx = await import("xlsx");
      const ws = xlsx.utils.json_to_sheet(
        data.map((v: VisitWithHost) => ({
          "Visitor Name": v.visitorName,
          "Visitor Company": v.visitorCompany,
          Phone: v.visitorPhone,
          Email: v.visitorEmail || "",
          Host: v.host?.name || "",
          "Host Company": v.host?.company || "",
          Purpose: v.purpose,
          Status: v.status,
          "Check In": v.checkInAt ? new Date(v.checkInAt).toLocaleString() : "",
          "Check Out": v.checkOutAt
            ? new Date(v.checkOutAt).toLocaleString()
            : "",
        })),
      );
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, "Visitors");
      const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=visitors-report.xlsx",
      );
      return res.send(buffer);
    }
  }

  @Get("reports/deliveries")
  async getDeliveriesReport(
    @Query("dateFrom") dateFrom?: string,
    @Query("dateTo") dateTo?: string,
    @Query("location") location?: string,
    @Query("company") company?: string,
    @Query("status") status?: string,
  ): Promise<DeliveryWithHost[]> {
    const where: Prisma.DeliveryWhereInput = {};

    if (dateFrom || dateTo) {
      where.receivedAt = {};
      if (dateFrom) {
        where.receivedAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.receivedAt.lte = endDate;
      }
    }
    if (location) {
      where.location = location as Prisma.EnumLocationFilter;
    }
    if (status) {
      where.status = status as Prisma.EnumDeliveryStatusFilter;
    }

    const deliveries = await this.prisma.delivery.findMany({
      where,
      include: { host: true },
      orderBy: { receivedAt: "desc" },
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

  @Get("reports/deliveries/export")
  async exportDeliveriesReport(
    @Res() res: Response,
    @Query("dateFrom") dateFrom?: string,
    @Query("dateTo") dateTo?: string,
    @Query("location") location?: string,
    @Query("company") company?: string,
    @Query("status") status?: string,
    @Query("format") format: "csv" | "excel" = "csv",
  ) {
    const data = await this.getDeliveriesReport(
      dateFrom,
      dateTo,
      location,
      company,
      status,
    );

    if (format === "csv") {
      const csv = this.generateCsv(data, [
        "courier",
        "recipient",
        "location",
        "status",
        "receivedAt",
        "pickedUpAt",
      ]);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=deliveries-report.csv",
      );
      return res.send(csv);
    }

    if (format === "excel") {
      const xlsx = await import("xlsx");
      const ws = xlsx.utils.json_to_sheet(
        data.map((d: DeliveryWithHost) => ({
          Courier: d.courier,
          Recipient: d.recipient,
          Host: d.host?.name || "",
          "Host Company": d.host?.company || "",
          Location: d.location,
          Status: d.status,
          "Received At": d.receivedAt
            ? new Date(d.receivedAt).toLocaleString()
            : "",
          "Picked Up At": d.pickedUpAt
            ? new Date(d.pickedUpAt).toLocaleString()
            : "",
        })),
      );
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, "Deliveries");
      const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=deliveries-report.xlsx",
      );
      return res.send(buffer);
    }
  }

  // ============ SETTINGS ============

  @Get("settings")
  async getSettings() {
    // Return settings in the format expected by the frontend
    return {
      id: "settings",
      smtpHost: process.env.SMTP_HOST || "",
      smtpPort: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
      smtpSecure: process.env.SMTP_SECURE === "true",
      smtpUser: process.env.SMTP_USER || "",
      smtpFrom: process.env.SMTP_FROM || "",
      whatsappApiKey: process.env.WHATSAPP_API_KEY ? "***configured***" : "",
      whatsappPhoneNumber: process.env.WHATSAPP_CLIENT || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Additional fields for compatibility
      site: {
        name: process.env.SITE_NAME || "Arafat VMS",
        timezone: process.env.SITE_TIMEZONE || "Asia/Qatar",
      },
      whatsapp: {
        enabled: !!(process.env.WHATSAPP_ENDPOINT && process.env.WHATSAPP_API_KEY),
        provider: "wbiztool",
        configured: !!(
          process.env.WHATSAPP_ENDPOINT &&
          process.env.WHATSAPP_CLIENT_ID &&
          process.env.WHATSAPP_CLIENT &&
          process.env.WHATSAPP_API_KEY
        ),
      },
      smtp: {
        enabled: process.env.SMTP_ENABLED === "true",
        host: process.env.SMTP_HOST || "Not configured",
        configured: !!process.env.SMTP_HOST && !!process.env.SMTP_USER,
      },
      maintenance: {
        enabled: process.env.MAINTENANCE_MODE === "true",
        message: process.env.MAINTENANCE_MESSAGE || "System under maintenance",
      },
    };
  }

  @Put("settings/smtp")
  async updateSmtpSettings(
    @Body()
    body: {
      smtpHost?: string;
      smtpPort?: number;
      smtpSecure?: boolean;
      smtpUser?: string;
      smtpPassword?: string;
      smtpFrom?: string;
    },
  ) {
    const envPath = path.join(process.cwd(), ".env");

    try {
      let envContent = fs.readFileSync(envPath, "utf8");

      const updateEnvVar = (key: string, value: string | number | boolean) => {
        const strValue = String(value);
        const regex = new RegExp(`^${key}=.*$`, "m");
        if (regex.test(envContent)) {
          envContent = envContent.replace(regex, `${key}=${strValue}`);
        } else {
          envContent += `\n${key}=${strValue}`;
        }
        process.env[key] = strValue;
      };

      if (body.smtpHost !== undefined) updateEnvVar("SMTP_HOST", body.smtpHost);
      if (body.smtpPort !== undefined) updateEnvVar("SMTP_PORT", body.smtpPort);
      if (body.smtpSecure !== undefined) updateEnvVar("SMTP_SECURE", body.smtpSecure);
      if (body.smtpUser !== undefined) updateEnvVar("SMTP_USER", body.smtpUser);
      if (body.smtpPassword !== undefined) updateEnvVar("SMTP_PASS", body.smtpPassword);
      if (body.smtpFrom !== undefined) updateEnvVar("SMTP_FROM", body.smtpFrom);

      fs.writeFileSync(envPath, envContent);

      return this.getSettings();
    } catch (e) {
      console.error("Failed to update SMTP settings:", e);
      throw new HttpException(
        "Failed to update SMTP settings",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put("settings/whatsapp")
  async updateWhatsAppSettings(
    @Body()
    body: {
      whatsappApiKey?: string;
      whatsappPhoneNumber?: string;
      whatsappEndpoint?: string;
      whatsappClientId?: string;
    },
  ) {
    const envPath = path.join(process.cwd(), ".env");

    try {
      let envContent = fs.readFileSync(envPath, "utf8");

      const updateEnvVar = (key: string, value: string) => {
        const regex = new RegExp(`^${key}=.*$`, "m");
        if (regex.test(envContent)) {
          envContent = envContent.replace(regex, `${key}=${value}`);
        } else {
          envContent += `\n${key}=${value}`;
        }
        process.env[key] = value;
      };

      if (body.whatsappApiKey !== undefined) updateEnvVar("WHATSAPP_API_KEY", body.whatsappApiKey);
      if (body.whatsappPhoneNumber !== undefined) updateEnvVar("WHATSAPP_CLIENT", body.whatsappPhoneNumber);
      if (body.whatsappEndpoint !== undefined) updateEnvVar("WHATSAPP_ENDPOINT", body.whatsappEndpoint);
      if (body.whatsappClientId !== undefined) updateEnvVar("WHATSAPP_CLIENT_ID", body.whatsappClientId);

      fs.writeFileSync(envPath, envContent);

      return this.getSettings();
    } catch (e) {
      console.error("Failed to update WhatsApp settings:", e);
      throw new HttpException(
        "Failed to update WhatsApp settings",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("settings/test-whatsapp")
  async testWhatsapp(@Body() body: { phone: string }) {
    const { phone } = body;

    if (!process.env.WHATSAPP_API_KEY || !process.env.WHATSAPP_ENDPOINT) {
      throw new HttpException(
        "WhatsApp not configured",
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const sent = await this.whatsappService.send(
        phone,
        "This is a test message from Arafat VMS. If you received this, WhatsApp is configured correctly!",
      );
      if (!sent) {
        throw new Error("WhatsApp service returned false");
      }
      return { success: true, message: "Test message sent" };
    } catch (e) {
      throw new HttpException(
        "Failed to send test message",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("settings/test-email")
  async testEmail(@Body() body: { email: string }) {
    const { email } = body;

    if (!process.env.SMTP_HOST) {
      throw new HttpException("SMTP not configured", HttpStatus.BAD_REQUEST);
    }

    try {
      await this.emailService.send({
        to: email,
        subject: "Test Email - Arafat VMS",
        html: "<h2>Test Email</h2><p>This is a test email from Arafat VMS. If you received this, SMTP is configured correctly!</p>",
      });
      return { success: true, message: "Test email sent" };
    } catch (e) {
      throw new HttpException(
        "Failed to send test email",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("settings/update")
  async updateSettings(
    @Body()
    body: {
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
    },
  ) {
    const envPath = path.join(process.cwd(), ".env");

    try {
      // Read current .env file
      let envContent = fs.readFileSync(envPath, "utf8");

      // Helper to update or add env var
      const updateEnvVar = (key: string, value: string | number | boolean) => {
        const strValue = String(value);
        const regex = new RegExp(`^${key}=.*$`, "m");
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
        if (body.smtp.enabled !== undefined)
          updateEnvVar("SMTP_ENABLED", body.smtp.enabled);
        if (body.smtp.host) updateEnvVar("SMTP_HOST", body.smtp.host);
        if (body.smtp.port) updateEnvVar("SMTP_PORT", body.smtp.port);
        if (body.smtp.user) updateEnvVar("SMTP_USER", body.smtp.user);
        if (body.smtp.pass) updateEnvVar("SMTP_PASS", body.smtp.pass);
        if (body.smtp.from) updateEnvVar("SMTP_FROM", body.smtp.from);
      }

      // Update WhatsApp settings
      if (body.whatsapp) {
        if (body.whatsapp.endpoint)
          updateEnvVar("WHATSAPP_ENDPOINT", body.whatsapp.endpoint);
        if (body.whatsapp.clientId)
          updateEnvVar("WHATSAPP_CLIENT_ID", body.whatsapp.clientId);
        if (body.whatsapp.client)
          updateEnvVar("WHATSAPP_CLIENT", body.whatsapp.client);
        if (body.whatsapp.apiKey)
          updateEnvVar("WHATSAPP_API_KEY", body.whatsapp.apiKey);
      }

      // Update Maintenance settings
      if (body.maintenance) {
        if (body.maintenance.enabled !== undefined)
          updateEnvVar("MAINTENANCE_MODE", body.maintenance.enabled);
        if (body.maintenance.message)
          updateEnvVar("MAINTENANCE_MESSAGE", body.maintenance.message);
      }

      // Write updated .env file
      fs.writeFileSync(envPath, envContent);

      return {
        success: true,
        message: "Settings updated. Some changes may require server restart.",
      };
    } catch (e) {
      console.error("Failed to update settings:", e);
      throw new HttpException(
        "Failed to update settings",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ============ VISITORS CRUD ============

  @Get("visitors")
  async getVisitors(
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Query("search") search?: string,
    @Query("status") status?: string,
    @Query("location") location?: string,
    @Query("sortBy") sortBy = "createdAt",
    @Query("sortOrder") sortOrder: "asc" | "desc" = "desc",
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.VisitWhereInput = {
      // Visitors panel shows APPROVED, CHECKED_IN, CHECKED_OUT
      status: status
        ? (status as Prisma.EnumVisitStatusFilter)
        : { in: ["APPROVED", "CHECKED_IN", "CHECKED_OUT"] },
    };

    if (search) {
      where.OR = [
        { visitorName: { contains: search, mode: "insensitive" } },
        { visitorCompany: { contains: search, mode: "insensitive" } },
        { visitorPhone: { contains: search, mode: "insensitive" } },
        { visitorEmail: { contains: search, mode: "insensitive" } },
      ];
    }

    if (location) {
      where.location = location as Prisma.EnumLocationFilter;
    }

    const [data, total] = await Promise.all([
      this.prisma.visit.findMany({
        where,
        include: { host: true },
        skip,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.visit.count({ where }),
    ]);

    return {
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  @Get("visitors/:id")
  async getVisitor(@Param("id") id: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
      include: { host: true, qrToken: true },
    });

    if (!visit) {
      throw new HttpException("Visitor not found", HttpStatus.NOT_FOUND);
    }

    return visit;
  }

  @Post("visitors")
  async createVisitor(
    @Body()
    body: {
      visitorName: string;
      visitorCompany?: string;
      visitorPhone: string;
      visitorEmail?: string;
      hostId: string;
      purpose: string;
      location: string;
      expectedDate?: string;
    },
  ) {
    const sessionId = crypto.randomUUID();

    const visit = await this.prisma.visit.create({
      data: {
        sessionId,
        visitorName: body.visitorName,
        visitorCompany: body.visitorCompany || "",
        visitorPhone: body.visitorPhone,
        visitorEmail: body.visitorEmail,
        hostId: BigInt(body.hostId),
        purpose: body.purpose,
        location: body.location as "BARWA_TOWERS" | "MARINA_50" | "ELEMENT_MARIOTT",
        status: "APPROVED",
        expectedDate: body.expectedDate ? new Date(body.expectedDate) : null,
        approvedAt: new Date(),
      },
      include: { host: true },
    });

    return visit;
  }

  @Put("visitors/:id")
  async updateVisitor(
    @Param("id") id: string,
    @Body()
    body: {
      visitorName?: string;
      visitorCompany?: string;
      visitorPhone?: string;
      visitorEmail?: string;
      hostId?: string;
      purpose?: string;
      location?: string;
      status?: string;
    },
  ) {
    const existing = await this.prisma.visit.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpException("Visitor not found", HttpStatus.NOT_FOUND);
    }

    const updateData: Prisma.VisitUpdateInput = {};
    if (body.visitorName !== undefined) updateData.visitorName = body.visitorName;
    if (body.visitorCompany !== undefined) updateData.visitorCompany = body.visitorCompany;
    if (body.visitorPhone !== undefined) updateData.visitorPhone = body.visitorPhone;
    if (body.visitorEmail !== undefined) updateData.visitorEmail = body.visitorEmail;
    if (body.purpose !== undefined) updateData.purpose = body.purpose;
    if (body.location !== undefined)
      updateData.location = body.location as "BARWA_TOWERS" | "MARINA_50" | "ELEMENT_MARIOTT";
    if (body.status !== undefined)
      updateData.status = body.status as Prisma.EnumVisitStatusFieldUpdateOperationsInput["set"];
    if (body.hostId !== undefined) {
      updateData.host = { connect: { id: BigInt(body.hostId) } };
    }

    const visit = await this.prisma.visit.update({
      where: { id },
      data: updateData,
      include: { host: true },
    });

    return visit;
  }

  @Delete("visitors/:id")
  async deleteVisitor(@Param("id") id: string) {
    const existing = await this.prisma.visit.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpException("Visitor not found", HttpStatus.NOT_FOUND);
    }

    await this.prisma.visit.delete({ where: { id } });
    return { success: true, message: "Visitor deleted" };
  }

  @Post("visitors/:id/approve")
  async approveVisitor(@Param("id") id: string) {
    const visit = await this.prisma.visit.findUnique({ where: { id } });
    if (!visit) {
      throw new HttpException("Visit not found", HttpStatus.NOT_FOUND);
    }

    await this.prisma.visit.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        rejectedAt: null,
        rejectionReason: null,
      },
    });

    return { success: true, message: "Visit approved" };
  }

  @Post("visitors/:id/reject")
  async rejectVisitor(
    @Param("id") id: string,
    @Body() body: { reason?: string },
  ) {
    const visit = await this.prisma.visit.findUnique({ where: { id } });
    if (!visit) {
      throw new HttpException("Visit not found", HttpStatus.NOT_FOUND);
    }

    await this.prisma.visit.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
        rejectionReason: body.reason,
      },
    });

    return { success: true, message: "Visit rejected" };
  }

  @Post("visitors/:id/checkin")
  async checkinVisitor(@Param("id") id: string) {
    const visit = await this.prisma.visit.findUnique({ where: { id } });
    if (!visit) {
      throw new HttpException("Visit not found", HttpStatus.NOT_FOUND);
    }

    if (visit.status !== "APPROVED") {
      throw new HttpException("Visit must be approved to check in", HttpStatus.BAD_REQUEST);
    }

    await this.prisma.visit.update({
      where: { id },
      data: {
        status: "CHECKED_IN",
        checkInAt: new Date(),
      },
    });

    return { success: true, message: "Visitor checked in" };
  }

  @Post("visitors/:id/checkout")
  async checkoutVisitorById(@Param("id") id: string) {
    const visit = await this.prisma.visit.findUnique({ where: { id } });
    if (!visit) {
      throw new HttpException("Visit not found", HttpStatus.NOT_FOUND);
    }

    if (visit.status !== "CHECKED_IN") {
      throw new HttpException("Visit must be checked in to check out", HttpStatus.BAD_REQUEST);
    }

    await this.prisma.visit.update({
      where: { id },
      data: {
        status: "CHECKED_OUT",
        checkOutAt: new Date(),
      },
    });

    return { success: true, message: "Visitor checked out" };
  }

  @Post("visitors/bulk/approve")
  async bulkApproveVisitors(@Body() body: { ids: string[] }) {
    const { ids } = body;
    if (!ids || ids.length === 0) {
      throw new HttpException("No IDs provided", HttpStatus.BAD_REQUEST);
    }

    await this.prisma.visit.updateMany({
      where: { id: { in: ids } },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        rejectedAt: null,
        rejectionReason: null,
      },
    });

    return { success: true, message: `${ids.length} visits approved` };
  }

  @Post("visitors/bulk/reject")
  async bulkRejectVisitors(@Body() body: { ids: string[]; reason?: string }) {
    const { ids, reason } = body;
    if (!ids || ids.length === 0) {
      throw new HttpException("No IDs provided", HttpStatus.BAD_REQUEST);
    }

    await this.prisma.visit.updateMany({
      where: { id: { in: ids } },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
        rejectionReason: reason,
      },
    });

    return { success: true, message: `${ids.length} visits rejected` };
  }

  @Post("visitors/bulk/checkout")
  async bulkCheckoutVisitors(@Body() body: { ids: string[] }) {
    const { ids } = body;
    if (!ids || ids.length === 0) {
      throw new HttpException("No IDs provided", HttpStatus.BAD_REQUEST);
    }

    await this.prisma.visit.updateMany({
      where: { id: { in: ids }, status: "CHECKED_IN" },
      data: {
        status: "CHECKED_OUT",
        checkOutAt: new Date(),
      },
    });

    return { success: true, message: `Visitors checked out` };
  }

  // ============ HOSTS CRUD ============

  @Get("hosts")
  async getHosts(
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Query("search") search?: string,
    @Query("location") location?: string,
    @Query("status") status?: string,
    @Query("sortBy") sortBy = "createdAt",
    @Query("sortOrder") sortOrder: "asc" | "desc" = "desc",
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.HostWhereInput = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    if (location) {
      where.location = location as Prisma.EnumLocationFilter;
    }

    if (status !== undefined) {
      where.status = parseInt(status, 10);
    }

    const [data, total] = await Promise.all([
      this.prisma.host.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.host.count({ where }),
    ]);

    return {
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  @Get("hosts/:id")
  async getHost(@Param("id") id: string) {
    const host = await this.prisma.host.findUnique({
      where: { id: BigInt(id) },
    });

    if (!host) {
      throw new HttpException("Host not found", HttpStatus.NOT_FOUND);
    }

    return host;
  }

  @Post("hosts")
  async createHost(
    @Body()
    body: {
      name: string;
      company: string;
      email?: string;
      phone?: string;
      location?: string;
      status?: number;
      externalId?: string;
    },
  ) {
    const host = await this.prisma.host.create({
      data: {
        name: body.name,
        company: body.company,
        email: body.email,
        phone: body.phone,
        location: body.location as "BARWA_TOWERS" | "MARINA_50" | "ELEMENT_MARIOTT" | undefined,
        status: body.status ?? 1,
        externalId: body.externalId,
      },
    });

    return host;
  }

  @Put("hosts/:id")
  async updateHost(
    @Param("id") id: string,
    @Body()
    body: {
      name?: string;
      company?: string;
      email?: string;
      phone?: string;
      location?: string;
      status?: number;
    },
  ) {
    const existing = await this.prisma.host.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existing) {
      throw new HttpException("Host not found", HttpStatus.NOT_FOUND);
    }

    const host = await this.prisma.host.update({
      where: { id: BigInt(id) },
      data: {
        name: body.name,
        company: body.company,
        email: body.email,
        phone: body.phone,
        location: body.location as "BARWA_TOWERS" | "MARINA_50" | "ELEMENT_MARIOTT" | undefined,
        status: body.status,
      },
    });

    return host;
  }

  @Delete("hosts/:id")
  async deleteHost(@Param("id") id: string) {
    const existing = await this.prisma.host.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existing) {
      throw new HttpException("Host not found", HttpStatus.NOT_FOUND);
    }

    // Soft delete
    await this.prisma.host.update({
      where: { id: BigInt(id) },
      data: { deletedAt: new Date(), status: 0 },
    });

    return { success: true, message: "Host deleted" };
  }

  @Post("hosts/bulk/delete")
  async bulkDeleteHosts(@Body() body: { ids: string[] }) {
    const { ids } = body;
    if (!ids || ids.length === 0) {
      throw new HttpException("No IDs provided", HttpStatus.BAD_REQUEST);
    }

    await this.prisma.host.updateMany({
      where: { id: { in: ids.map((id) => BigInt(id)) } },
      data: { deletedAt: new Date(), status: 0 },
    });

    return { success: true, message: `${ids.length} hosts deleted` };
  }

  // ============ DELIVERIES CRUD ============

  @Get("deliveries")
  async getDeliveries(
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Query("search") search?: string,
    @Query("status") status?: string,
    @Query("location") location?: string,
    @Query("sortBy") sortBy = "createdAt",
    @Query("sortOrder") sortOrder: "asc" | "desc" = "desc",
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.DeliveryWhereInput = {};

    if (search) {
      where.OR = [
        { recipient: { contains: search, mode: "insensitive" } },
        { courier: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status as Prisma.EnumDeliveryStatusFilter;
    }

    if (location) {
      where.location = location as Prisma.EnumLocationFilter;
    }

    const [data, total] = await Promise.all([
      this.prisma.delivery.findMany({
        where,
        include: { host: true },
        skip,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.delivery.count({ where }),
    ]);

    return {
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  @Get("deliveries/:id")
  async getDelivery(@Param("id") id: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id },
      include: { host: true },
    });

    if (!delivery) {
      throw new HttpException("Delivery not found", HttpStatus.NOT_FOUND);
    }

    return delivery;
  }

  @Post("deliveries")
  async createDelivery(
    @Body()
    body: {
      recipient: string;
      hostId?: string;
      courier: string;
      location: string;
      notes?: string;
    },
  ) {
    const delivery = await this.prisma.delivery.create({
      data: {
        recipient: body.recipient,
        hostId: body.hostId ? BigInt(body.hostId) : null,
        courier: body.courier,
        location: body.location as "BARWA_TOWERS" | "MARINA_50" | "ELEMENT_MARIOTT",
        notes: body.notes,
        status: "RECEIVED",
        receivedAt: new Date(),
      },
      include: { host: true },
    });

    return delivery;
  }

  @Put("deliveries/:id")
  async updateDelivery(
    @Param("id") id: string,
    @Body()
    body: {
      recipient?: string;
      hostId?: string;
      courier?: string;
      location?: string;
      notes?: string;
      status?: string;
    },
  ) {
    const existing = await this.prisma.delivery.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpException("Delivery not found", HttpStatus.NOT_FOUND);
    }

    const updateData: Prisma.DeliveryUpdateInput = {};
    if (body.recipient !== undefined) updateData.recipient = body.recipient;
    if (body.courier !== undefined) updateData.courier = body.courier;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.location !== undefined)
      updateData.location = body.location as "BARWA_TOWERS" | "MARINA_50" | "ELEMENT_MARIOTT";
    if (body.status !== undefined) {
      updateData.status = body.status as "RECEIVED" | "PICKED_UP";
      if (body.status === "PICKED_UP") {
        updateData.pickedUpAt = new Date();
      }
    }
    if (body.hostId !== undefined) {
      updateData.host = body.hostId ? { connect: { id: BigInt(body.hostId) } } : { disconnect: true };
    }

    const delivery = await this.prisma.delivery.update({
      where: { id },
      data: updateData,
      include: { host: true },
    });

    return delivery;
  }

  @Delete("deliveries/:id")
  async deleteDelivery(@Param("id") id: string) {
    const existing = await this.prisma.delivery.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpException("Delivery not found", HttpStatus.NOT_FOUND);
    }

    await this.prisma.delivery.delete({ where: { id } });
    return { success: true, message: "Delivery deleted" };
  }

  @Post("deliveries/:id/mark-picked-up")
  async markDeliveryPickedUp(@Param("id") id: string) {
    const delivery = await this.prisma.delivery.findUnique({ where: { id } });
    if (!delivery) {
      throw new HttpException("Delivery not found", HttpStatus.NOT_FOUND);
    }

    if (delivery.status === "PICKED_UP") {
      throw new HttpException("Delivery already picked up", HttpStatus.BAD_REQUEST);
    }

    await this.prisma.delivery.update({
      where: { id },
      data: {
        status: "PICKED_UP",
        pickedUpAt: new Date(),
      },
    });

    return { success: true, message: "Delivery marked as picked up" };
  }

  // ============ PRE-REGISTRATIONS CRUD ============

  @Get("pre-registrations")
  async getPreRegistrations(
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Query("search") search?: string,
    @Query("status") status?: string,
    @Query("location") location?: string,
    @Query("sortBy") sortBy = "createdAt",
    @Query("sortOrder") sortOrder: "asc" | "desc" = "desc",
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.VisitWhereInput = {
      // Pre-registration panel shows PENDING_APPROVAL, REJECTED, PRE_REGISTERED
      status: status
        ? (status as Prisma.EnumVisitStatusFilter)
        : { in: ["PENDING_APPROVAL", "REJECTED", "PRE_REGISTERED"] },
    };

    if (search) {
      where.OR = [
        { visitorName: { contains: search, mode: "insensitive" } },
        { visitorCompany: { contains: search, mode: "insensitive" } },
        { visitorPhone: { contains: search, mode: "insensitive" } },
        { visitorEmail: { contains: search, mode: "insensitive" } },
      ];
    }

    if (location) {
      where.location = location as Prisma.EnumLocationFilter;
    }

    const [data, total] = await Promise.all([
      this.prisma.visit.findMany({
        where,
        include: { host: true },
        skip,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.visit.count({ where }),
    ]);

    return {
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  @Get("pre-registrations/:id")
  async getPreRegistration(@Param("id") id: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
      include: { host: true, qrToken: true },
    });

    if (!visit) {
      throw new HttpException("Pre-registration not found", HttpStatus.NOT_FOUND);
    }

    return visit;
  }

  @Post("pre-registrations")
  async createPreRegistration(
    @Body()
    body: {
      visitorName: string;
      visitorCompany?: string;
      visitorPhone: string;
      visitorEmail?: string;
      hostId: string;
      purpose: string;
      location: string;
      expectedDate?: string;
    },
  ) {
    const sessionId = crypto.randomUUID();

    const visit = await this.prisma.visit.create({
      data: {
        sessionId,
        visitorName: body.visitorName,
        visitorCompany: body.visitorCompany || "",
        visitorPhone: body.visitorPhone,
        visitorEmail: body.visitorEmail,
        hostId: BigInt(body.hostId),
        purpose: body.purpose,
        location: body.location as "BARWA_TOWERS" | "MARINA_50" | "ELEMENT_MARIOTT",
        status: "PENDING_APPROVAL",
        expectedDate: body.expectedDate ? new Date(body.expectedDate) : null,
      },
      include: { host: true },
    });

    return visit;
  }

  @Put("pre-registrations/:id")
  async updatePreRegistration(
    @Param("id") id: string,
    @Body()
    body: {
      visitorName?: string;
      visitorCompany?: string;
      visitorPhone?: string;
      visitorEmail?: string;
      hostId?: string;
      purpose?: string;
      location?: string;
      expectedDate?: string;
    },
  ) {
    const existing = await this.prisma.visit.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpException("Pre-registration not found", HttpStatus.NOT_FOUND);
    }

    const updateData: Prisma.VisitUpdateInput = {};
    if (body.visitorName !== undefined) updateData.visitorName = body.visitorName;
    if (body.visitorCompany !== undefined) updateData.visitorCompany = body.visitorCompany;
    if (body.visitorPhone !== undefined) updateData.visitorPhone = body.visitorPhone;
    if (body.visitorEmail !== undefined) updateData.visitorEmail = body.visitorEmail;
    if (body.purpose !== undefined) updateData.purpose = body.purpose;
    if (body.location !== undefined)
      updateData.location = body.location as "BARWA_TOWERS" | "MARINA_50" | "ELEMENT_MARIOTT";
    if (body.expectedDate !== undefined)
      updateData.expectedDate = body.expectedDate ? new Date(body.expectedDate) : null;
    if (body.hostId !== undefined) {
      updateData.host = { connect: { id: BigInt(body.hostId) } };
    }

    const visit = await this.prisma.visit.update({
      where: { id },
      data: updateData,
      include: { host: true },
    });

    return visit;
  }

  @Delete("pre-registrations/:id")
  async deletePreRegistration(@Param("id") id: string) {
    const existing = await this.prisma.visit.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpException("Pre-registration not found", HttpStatus.NOT_FOUND);
    }

    await this.prisma.visit.delete({ where: { id } });
    return { success: true, message: "Pre-registration deleted" };
  }

  @Post("pre-registrations/:id/approve")
  async approvePreRegistration(@Param("id") id: string) {
    const visit = await this.prisma.visit.findUnique({ where: { id } });
    if (!visit) {
      throw new HttpException("Pre-registration not found", HttpStatus.NOT_FOUND);
    }

    await this.prisma.visit.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        rejectedAt: null,
        rejectionReason: null,
      },
    });

    return { success: true, message: "Pre-registration approved" };
  }

  @Post("pre-registrations/:id/reject")
  async rejectPreRegistration(
    @Param("id") id: string,
    @Body() body: { reason?: string },
  ) {
    const visit = await this.prisma.visit.findUnique({ where: { id } });
    if (!visit) {
      throw new HttpException("Pre-registration not found", HttpStatus.NOT_FOUND);
    }

    await this.prisma.visit.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
        rejectionReason: body.reason,
      },
    });

    return { success: true, message: "Pre-registration rejected" };
  }

  @Post("pre-registrations/:id/re-approve")
  async reApprovePreRegistration(@Param("id") id: string) {
    const visit = await this.prisma.visit.findUnique({ where: { id } });
    if (!visit) {
      throw new HttpException("Pre-registration not found", HttpStatus.NOT_FOUND);
    }

    if (visit.status !== "REJECTED") {
      throw new HttpException("Only rejected pre-registrations can be re-approved", HttpStatus.BAD_REQUEST);
    }

    await this.prisma.visit.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        rejectedAt: null,
        rejectionReason: null,
      },
    });

    return { success: true, message: "Pre-registration re-approved" };
  }

  // ============ USERS CRUD ============

  @Get("users")
  async getUsers(
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Query("search") search?: string,
    @Query("role") role?: string,
    @Query("sortBy") sortBy = "createdAt",
    @Query("sortOrder") sortOrder: "asc" | "desc" = "desc",
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.role = role as Prisma.EnumRoleFilter;
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          hostId: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  @Get("users/:id")
  async getUser(@Param("id") id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(id, 10) },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        hostId: true,
        host: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }

    return user;
  }

  @Post("users")
  async createUser(
    @Body()
    body: {
      email: string;
      name: string;
      password: string;
      role: string;
      hostId?: string;
    },
  ) {
    // Check if email already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existing) {
      throw new HttpException("Email already exists", HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(body.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        password: hashedPassword,
        role: body.role as "ADMIN" | "RECEPTION" | "HOST",
        hostId: body.hostId ? BigInt(body.hostId) : null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        hostId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  @Put("users/:id")
  async updateUser(
    @Param("id") id: string,
    @Body()
    body: {
      email?: string;
      name?: string;
      password?: string;
      role?: string;
      hostId?: string;
    },
  ) {
    const userId = parseInt(id, 10);
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existing) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }

    // Check if new email already exists
    if (body.email && body.email !== existing.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: body.email },
      });
      if (emailExists) {
        throw new HttpException("Email already exists", HttpStatus.BAD_REQUEST);
      }
    }

    const updateData: Prisma.UserUpdateInput = {};
    if (body.email !== undefined) updateData.email = body.email;
    if (body.name !== undefined) updateData.name = body.name;
    if (body.role !== undefined) updateData.role = body.role as "ADMIN" | "RECEPTION" | "HOST";
    if (body.password !== undefined) {
      updateData.password = await bcrypt.hash(body.password, 12);
    }
    if (body.hostId !== undefined) {
      updateData.host = body.hostId ? { connect: { id: BigInt(body.hostId) } } : { disconnect: true };
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        hostId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  @Delete("users/:id")
  async deleteUser(@Param("id") id: string) {
    const userId = parseInt(id, 10);
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existing) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }

    await this.prisma.user.delete({ where: { id: userId } });
    return { success: true, message: "User deleted" };
  }

  @Post("users/:id/change-password")
  async changeUserPassword(
    @Param("id") id: string,
    @Body() body: { password: string },
  ) {
    const userId = parseInt(id, 10);
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existing) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }

    const hashedPassword = await bcrypt.hash(body.password, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { success: true, message: "Password changed" };
  }

  // ============ HELPER METHODS ============

  private generateCsv<T extends Record<string, unknown>>(
    data: T[],
    columns: (keyof T & string)[],
  ): string {
    const header = columns.join(",");
    const rows = data.map((item) =>
      columns
        .map((col) => {
          const value = item[col];
          if (value === null || value === undefined) return "";
          if (typeof value === "string" && value.includes(",")) {
            return `"${value}"`;
          }
          return String(value);
        })
        .join(","),
    );
    return [header, ...rows].join("\n");
  }
}
