import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Res,
  Req,
  HttpException,
  HttpStatus,
  UseInterceptors,
  Logger,
  ForbiddenException,
} from "@nestjs/common";
import { CacheInterceptor, CacheKey, CacheTTL } from "@nestjs/cache-manager";
import { SkipThrottle, Throttle } from "@nestjs/throttler";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "../notifications/email.service";
import { WhatsAppService } from "../notifications/whatsapp.service";
import { Public } from "../common/decorators/public.decorator";
import * as bcrypt from "bcrypt";
import * as QRCode from "qrcode";
import * as crypto from "crypto";
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";
import { Prisma, Role, Location } from "@prisma/client";
import { Roles } from "../common/decorators/roles.decorator";
import { DashboardGateway } from "../dashboard/dashboard.gateway";
import { AuditInterceptor } from "../audit/audit.interceptor";
import { CreateSubMemberDto } from "../hosts/dto/create-sub-member.dto";
// csv-parse import moved to dynamic import inside method for ESM compatibility

// Type for visit with host relation
type VisitWithHost = Prisma.VisitGetPayload<{ include: { host: true } }>;

// Type for delivery with host relation
type DeliveryWithHost = Prisma.DeliveryGetPayload<{ include: { host: true } }>;

// Note: These endpoints are meant to be accessed through the AdminJS session
// They use JWT auth with Bearer token or httpOnly cookie
// Individual endpoints have specific rate limiting applied

@SkipThrottle({ default: true, "login-account": true, "login-ip": true })
@Controller("admin/api")
export class AdminApiController {
  private readonly logger = new Logger(AdminApiController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly whatsappService: WhatsAppService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly dashboardGateway: DashboardGateway,
  ) {}

  /**
   * Returns host scope for HOST users (hostId + company). Null for ADMIN/RECEPTION.
   */
  private async getHostScope(
    req: any,
  ): Promise<{ hostId: bigint; company: string } | null> {
    if (
      (req.user?.role !== "HOST" && req.user?.role !== "STAFF") ||
      !req.user?.hostId
    )
      return null;
    const host = await this.prisma.host.findUnique({
      where: { id: req.user.hostId },
      select: { id: true, company: true },
    });
    return host ? { hostId: host.id, company: host.company } : null;
  }

  // ============ AUTHENTICATION ============

  @Public()
  @Post("login")
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
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

    if (user.status === "INACTIVE") {
      throw new HttpException(
        "Account is deactivated. Contact your administrator.",
        HttpStatus.FORBIDDEN,
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    const token = this.jwtService.sign(payload, {
      expiresIn: this.configService.get("JWT_EXPIRES_IN") || "24h",
    });

    // Set httpOnly cookie for secure authentication
    const isProduction = this.configService.get("NODE_ENV") === "production";
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
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

  @Public()
  @Post("token-login")
  async tokenLogin(
    @Body() body: { token: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token: incomingToken } = body;

    if (!incomingToken) {
      throw new HttpException("Token is required", HttpStatus.BAD_REQUEST);
    }

    // Verify the incoming JWT
    let decoded: { sub: number; email: string; role: string };
    try {
      decoded = this.jwtService.verify(incomingToken);
    } catch {
      throw new HttpException(
        "Invalid or expired token",
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Look up the user
    const user = await this.prisma.user.findUnique({
      where: { id: decoded.sub },
      include: { host: true },
    });

    if (!user) {
      throw new HttpException("User not found", HttpStatus.UNAUTHORIZED);
    }

    if (user.status === "INACTIVE") {
      throw new HttpException("Account is deactivated.", HttpStatus.FORBIDDEN);
    }

    // Issue a new 24h admin token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    const newToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get("JWT_EXPIRES_IN") || "24h",
    });

    // Set httpOnly cookie
    const isProduction = this.configService.get("NODE_ENV") === "production";
    res.cookie("access_token", newToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return {
      token: newToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hostId: user.hostId,
      },
    };
  }

  @Public()
  @Post("forgot-password")
  async forgotPassword(@Body() body: { email: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: body.email?.toLowerCase() },
    });
    if (!user) {
      return { message: "If an account exists, a reset link has been sent." };
    }
    const resetToken = this.jwtService.sign(
      { sub: user.id, purpose: "reset" },
      { expiresIn: "1h" },
    );
    const adminUrl =
      this.configService.get("ADMIN_URL") ||
      "https://arafatvisitor.cloud/admin";
    const resetUrl = `${adminUrl}/reset-password?token=${resetToken}`;
    await this.emailService
      .sendPasswordReset(user.email, resetUrl)
      .catch(() => {});
    return { message: "If an account exists, a reset link has been sent." };
  }

  @Public()
  @Post("reset-password")
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    try {
      const payload = this.jwtService.verify<{ sub: number; purpose: string }>(
        body.token,
      );
      if (payload.purpose !== "reset") {
        throw new HttpException("Invalid token", HttpStatus.BAD_REQUEST);
      }
      const hash = await bcrypt.hash(body.newPassword, 12);
      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { password: hash },
      });
      return { message: "Password reset successfully" };
    } catch {
      throw new HttpException(
        "Invalid or expired reset token",
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ============ DASHBOARD KPIs ============

  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
  @Get("dashboard/kpis")
  @UseInterceptors(CacheInterceptor)
  @CacheKey("dashboard:kpis")
  @CacheTTL(60) // Cache for 60 seconds
  async getDashboardKpis() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalHosts, visitsToday, deliveriesToday] = await Promise.all([
      this.prisma.host.count({ where: { status: 1, type: "EXTERNAL" } }),
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

  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
  @Get("profile")
  async getProfile(@Req() req: any, @Query("email") email?: string) {
    // DEBUG LOGGING
    console.log("[DEBUG] /admin/api/profile called");
    console.log("[DEBUG] Query params:", { email });
    console.log("[DEBUG] Headers:", {
      authorization: req.headers?.authorization
        ? "Bearer [REDACTED]"
        : "MISSING",
      contentType: req.headers?.["content-type"],
      origin: req.headers?.origin,
      referer: req.headers?.referer,
    });
    console.log("[DEBUG] Request URL:", req.url);
    console.log("[DEBUG] Request method:", req.method);

    // Try to get email from query param, JWT token, or session
    let userEmail = email;

    if (!userEmail) {
      // Try to get from Authorization header (JWT)
      const authHeader = req.headers?.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        try {
          const token = authHeader.substring(7);
          const decoded = this.jwtService.verify(token) as { email: string };
          userEmail = decoded.email;
          console.log(
            "[DEBUG] Successfully decoded JWT token for email:",
            userEmail,
          );
        } catch (err) {
          console.log("[DEBUG] Failed to decode JWT token:", err);
          // Token invalid or expired
        }
      }
    }

    if (!userEmail) {
      console.log("[DEBUG] No user email found - throwing UNAUTHORIZED");
      throw new HttpException(
        "Authentication required",
        HttpStatus.UNAUTHORIZED,
      );
    }

    console.log("[DEBUG] Looking up user with email:", userEmail);
    const user = await this.prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!user) {
      console.log("[DEBUG] User not found - throwing NOT_FOUND");
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }
    console.log("[DEBUG] User found:", {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
  @Get("profile/preferences")
  async getPreferences(@Req() req: any) {
    // DEBUG LOGGING
    console.log("[DEBUG] /admin/api/profile/preferences called");
    console.log("[DEBUG] Headers:", {
      authorization: req.headers?.authorization
        ? "Bearer [REDACTED]"
        : "MISSING",
      contentType: req.headers?.["content-type"],
      origin: req.headers?.origin,
      referer: req.headers?.referer,
    });
    console.log("[DEBUG] Request URL:", req.url);
    console.log("[DEBUG] Request method:", req.method);

    // Get user from JWT token
    const authHeader = req.headers?.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      console.log(
        "[DEBUG] No Authorization header found - throwing UNAUTHORIZED",
      );
      throw new HttpException(
        "Authentication required",
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const token = authHeader.substring(7);
      const decoded = this.jwtService.verify(token) as { email: string };
      console.log(
        "[DEBUG] Successfully decoded JWT token for email:",
        decoded.email,
      );

      // Return default preferences (can be extended to store in DB)
      return {
        notifications: true,
        emailAlerts: true,
        theme: "light",
        language: "en",
      };
    } catch (err) {
      console.log("[DEBUG] Failed to decode JWT token:", err);
      throw new HttpException(
        "Invalid or expired token",
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
  @Put("profile/preferences")
  async updatePreferences(@Req() req: any, @Body() body: any) {
    // Get user from JWT token
    const authHeader = req.headers?.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new HttpException(
        "Authentication required",
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      this.jwtService.verify(authHeader.substring(7));
      // For now, just return the submitted preferences (can be stored in DB later)
      return body;
    } catch {
      throw new HttpException(
        "Invalid or expired token",
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
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

  @Roles(Role.ADMIN)
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

  @Roles(Role.ADMIN)
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
        // Dual numbers "xxx/xxx" → take left part before "/"
        let v = value.includes("/") ? value.split("/")[0].trim() : value;
        v = v.replace(/[\s\-()]/g, "");
        if (v.startsWith("+")) {
          v = v.slice(1);
        }
        // Already has 974 prefix → keep as-is
        if (v.startsWith("974")) return v;
        if (/^\d{8}$/.test(v) && /^[34567]/.test(v)) {
          // 8 digits starting with 3/4/5/6/7 → prefix 974 (Qatar mobile/landline)
          v = `974${v}`;
        } else if (/^\d{11}$/.test(v) && /^(010|011|012)/.test(v)) {
          // 11 digits starting with 010/011/012 → prefix 2 (Egypt)
          v = `2${v}`;
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
              const newUser = await this.prisma.user.create({
                data: {
                  email: userEmail,
                  password: hashedPassword,
                  name: name,
                  role: "HOST",
                  hostId: createdHost.id,
                },
              });
              usersCreated += 1;

              // Send welcome email (skip system.local addresses)
              if (!userEmail.endsWith("@system.local")) {
                const resetToken = this.jwtService.sign(
                  { sub: Number(newUser.id), purpose: "reset" },
                  { expiresIn: "72h" },
                );
                const adminUrl =
                  this.configService.get("ADMIN_URL") ||
                  "https://arafatvisitor.cloud/admin";
                const resetUrl = `${adminUrl}/reset-password?token=${resetToken}`;
                this.emailService
                  .sendHostWelcome(userEmail, name, resetUrl)
                  .catch(() => {});
              }
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
            const newUser = await this.prisma.user.create({
              data: {
                email: userEmail,
                password: hashedPassword,
                name: name,
                role: "HOST",
                hostId: createdHost.id,
              },
            });
            usersCreated++;

            // Send welcome email (skip system.local addresses)
            if (!userEmail.endsWith("@system.local")) {
              const resetToken = this.jwtService.sign(
                { sub: Number(newUser.id), purpose: "reset" },
                { expiresIn: "72h" },
              );
              const adminUrl =
                this.configService.get("ADMIN_URL") ||
                "https://arafatvisitor.cloud/admin";
              const resetUrl = `${adminUrl}/reset-password?token=${resetToken}`;
              this.emailService
                .sendHostWelcome(userEmail, name, resetUrl)
                .catch(() => {});
            }
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

  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
  @Get("dashboard/pending-approvals")
  async getPendingApprovals(@Req() req: any) {
    // Dashboard only shows PENDING_APPROVAL (clean view)
    // Rejected visits are managed in PreRegister resource page
    const where: Prisma.VisitWhereInput = { status: "PENDING_APPROVAL" };
    const hostScope = await this.getHostScope(req);
    if (hostScope) {
      where.host = { company: hostScope.company };
    }
    const visits = await this.prisma.visit.findMany({
      where,
      include: { host: true },
      orderBy: { expectedDate: "asc" },
      take: 10,
    });

    return visits.map((v) => ({
      id: v.id,
      sessionId: v.sessionId,
      visitorName: v.visitorName,
      visitorPhone: v.visitorPhone,
      hostName: v.host?.name || "Unknown",
      hostCompany: v.host?.company || "Unknown",
      expectedDate: v.expectedDate?.toISOString() || v.createdAt.toISOString(),
    }));
  }

  // ============ RECEIVED DELIVERIES ============

  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
  @Get("dashboard/received-deliveries")
  async getReceivedDeliveries(@Req() req: any) {
    const where: Prisma.DeliveryWhereInput = { status: "RECEIVED" };
    const hostScope = await this.getHostScope(req);
    if (hostScope) {
      where.host = { company: hostScope.company };
    }
    const deliveries = await this.prisma.delivery.findMany({
      where,
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

  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
  @Get("dashboard/charts")
  @UseInterceptors(CacheInterceptor)
  @CacheKey("dashboard:charts")
  @CacheTTL(60) // Cache for 60 seconds
  async getChartData() {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Parallelize all date range queries using Promise.all
    const visitsPerDayPromises: Promise<{ date: string; count: number }>[] = [];
    const deliveriesPerDayPromises: Promise<{ date: string; count: number }>[] =
      [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      // Parallel query for visits
      visitsPerDayPromises.push(
        this.prisma.visit
          .count({
            where: {
              checkInAt: {
                gte: date,
                lt: nextDate,
              },
            },
          })
          .then((count) => ({ date: date.toISOString(), count })),
      );

      // Parallel query for deliveries
      deliveriesPerDayPromises.push(
        this.prisma.delivery
          .count({
            where: {
              receivedAt: {
                gte: date,
                lt: nextDate,
              },
            },
          })
          .then((count) => ({ date: date.toISOString(), count })),
      );
    }

    // Wait for all queries to complete in parallel
    const [visitsPerDay, deliveriesPerDay, statusCounts] = await Promise.all([
      Promise.all(visitsPerDayPromises),
      Promise.all(deliveriesPerDayPromises),
      // Status distribution - include all statuses
      this.prisma.visit.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    const statusDistribution = statusCounts.map((s) => ({
      status: s.status,
      count: s._count.status,
    }));

    return { visitsPerDay, statusDistribution, deliveriesPerDay };
  }

  // ============ CURRENT VISITORS (for card view) ============

  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
  @Get("dashboard/current-visitors")
  async getCurrentVisitors(@Req() req: any) {
    const where: Prisma.VisitWhereInput = { status: "CHECKED_IN" };
    const hostScope = await this.getHostScope(req);
    if (hostScope) {
      where.host = { company: hostScope.company };
    }
    const visitors = await this.prisma.visit.findMany({
      where,
      include: {
        host: true,
        qrToken: true,
      },
      orderBy: { checkInAt: "desc" },
      take: 50, // Limit to 50 results for performance
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

  @Roles(Role.ADMIN, Role.HOST, Role.STAFF)
  @Post("dashboard/approve/:id")
  async approveVisit(@Param("id") id: string, @Req() req: any) {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
      include: { host: true },
    });
    if (!visit) {
      throw new HttpException("Visit not found", HttpStatus.NOT_FOUND);
    }

    // HOST can only approve visits to their own company
    const hostScope = await this.getHostScope(req);
    if (hostScope && visit.host?.company !== hostScope.company) {
      throw new ForbiddenException(
        "You can only approve visits to your company",
      );
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

    // Emit WebSocket event
    this.dashboardGateway.emitVisitorApproved({
      visitId: visit.id,
      visitorName: visit.visitorName,
      hostName: visit.host?.name || "Unknown",
    });
    this.dashboardGateway.emitDashboardRefresh();

    // TODO: Generate QR token and send notifications

    return { success: true, message: "Visit approved" };
  }

  @Roles(Role.ADMIN, Role.HOST, Role.STAFF)
  @Post("dashboard/reject/:id")
  async rejectVisit(@Param("id") id: string, @Req() req: any) {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
      include: { host: true },
    });
    if (!visit) {
      throw new HttpException("Visit not found", HttpStatus.NOT_FOUND);
    }

    // HOST can only reject visits to their own company
    const hostScope = await this.getHostScope(req);
    if (hostScope && visit.host?.company !== hostScope.company) {
      throw new ForbiddenException(
        "You can only reject visits to your company",
      );
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

    // Emit WebSocket event
    this.dashboardGateway.emitVisitorRejected({
      visitId: visit.id,
      visitorName: visit.visitorName,
    });
    this.dashboardGateway.emitDashboardRefresh();

    // TODO: Send rejection notification

    return { success: true, message: "Visit rejected" };
  }

  // ============ CHECKOUT ============

  @Roles(Role.ADMIN, Role.RECEPTION)
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

    // Emit WebSocket event
    this.dashboardGateway.emitVisitorCheckout({
      visitId: visit.id,
      sessionId: visit.sessionId,
      visitorName: visit.visitorName,
    });
    this.dashboardGateway.emitDashboardRefresh();

    return { success: true, message: "Visitor checked out" };
  }

  // ============ QR CODE GENERATION ============

  @Roles(Role.ADMIN, Role.RECEPTION)
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

  @Roles(Role.ADMIN, Role.RECEPTION)
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
        console.log("[send-qr] Generating QR code image for WhatsApp...");

        // Generate QR code as data URL and extract base64
        const qrDataUrl = await QRCode.toDataURL(token, {
          width: 400,
          margin: 2,
          color: {
            dark: "#1E3A8A",
            light: "#FFFFFF",
          },
        });
        // Remove the data URL prefix to get pure base64
        const qrBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, "");

        // Caption with visitor info
        const caption = `*VISITOR PASS*\n\n*${visit.visitorName}*${visit.visitorCompany ? `\n${visit.visitorCompany}` : ""}\n\n*Host:* ${visit.host?.name || "N/A"}\n*Company:* ${visit.host?.company || "N/A"}\n*Purpose:* ${visit.purpose || "Visit"}\n\nShow this QR code at reception for check-in.\n\n───────────────────\n_Powered by Arafat Visitor Management System_`;

        console.log("[send-qr] Sending QR image to:", visit.visitorPhone);
        const sent = await this.whatsappService.sendImage(
          visit.visitorPhone,
          qrBase64,
          caption,
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
          message: "QR code image sent via WhatsApp",
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

        // Extract base64 from data URL for attachment
        const qrBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, "");
        const qrBuffer = Buffer.from(qrBase64, "base64");

        const sent = await this.emailService.send({
          to: visit.visitorEmail,
          subject: `Your Visit QR Code - ${visit.host?.company || "Office Visit"}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #1E3A8A, #3B82F6); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">VISITOR PASS</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Arafat Group</p>
              </div>
              <div style="padding: 30px; background: #f9fafb;">
                <h2 style="color: #1E3A8A; margin-top: 0;">Hello ${visit.visitorName}!</h2>
                <p>Your QR code for visiting <strong>${visit.host?.company || "our office"}</strong> is ready.</p>
                <p>Please show this QR code at reception for check-in:</p>
                <div style="text-align: center; padding: 20px; background: white; border-radius: 10px; margin: 20px 0;">
                  <img src="cid:qrcode" alt="QR Code" style="width: 200px; height: 200px;" />
                </div>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Host:</strong></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${visit.host?.name || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Company:</strong></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${visit.host?.company || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0;"><strong>Purpose:</strong></td>
                    <td style="padding: 10px 0;">${visit.purpose || "Visit"}</td>
                  </tr>
                </table>
                <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">Thank you for visiting!</p>
              </div>
              <div style="padding: 15px; text-align: center; background: #1E3A8A; color: rgba(255,255,255,0.7); font-size: 12px;">
                Powered by Arafat Visitor Management System
              </div>
            </div>
          `,
          attachments: [
            {
              filename: "qrcode.png",
              content: qrBuffer,
              contentType: "image/png",
              cid: "qrcode", // Content-ID for inline reference
            },
          ],
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

  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
  @Post("change-password")
  async changePassword(
    @Req() req: any,
    @Body()
    body: {
      currentPassword: string;
      newPassword: string;
      userEmail?: string; // Kept for backward compatibility with admin panel
    },
  ) {
    // Use JWT token sub (userId) as primary auth; fall back to body email for admin panel
    const userId: number | undefined = req.user?.sub;
    const { currentPassword, newPassword, userEmail } = body;

    let user: { id: number; email: string; password: string } | null = null;

    if (userId) {
      user = await this.prisma.user.findUnique({ where: { id: userId } });
    } else if (userEmail) {
      user = await this.prisma.user.findUnique({ where: { email: userEmail } });
    }

    if (!user) {
      throw new HttpException(
        "User not authenticated",
        HttpStatus.UNAUTHORIZED,
      );
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
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { success: true, message: "Password changed successfully" };
  }

  // ============ REPORTS ============

  @Roles(Role.ADMIN, Role.HOST, Role.STAFF)
  @Get("reports")
  async getReportsSummary(
    @Req() req: any,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    // HOST scoping
    const hostScope = await this.getHostScope(req);
    const visitHostFilter: Prisma.VisitWhereInput = hostScope
      ? { host: { company: hostScope.company } }
      : {};
    const deliveryHostFilter: Prisma.DeliveryWhereInput = hostScope
      ? { host: { company: hostScope.company } }
      : {};
    const hostFilter: Prisma.HostWhereInput = hostScope
      ? { company: hostScope.company }
      : {};

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
        where: { createdAt: { gte: start, lte: end }, ...visitHostFilter },
      }),
      this.prisma.visit.count({
        where: {
          status: "APPROVED",
          createdAt: { gte: start, lte: end },
          ...visitHostFilter,
        },
      }),
      this.prisma.visit.count({
        where: {
          status: "CHECKED_IN",
          createdAt: { gte: start, lte: end },
          ...visitHostFilter,
        },
      }),
      this.prisma.delivery.count({
        where: { createdAt: { gte: start, lte: end }, ...deliveryHostFilter },
      }),
      this.prisma.delivery.count({
        where: {
          status: "PICKED_UP",
          createdAt: { gte: start, lte: end },
          ...deliveryHostFilter,
        },
      }),
      this.prisma.host.count({ where: { status: 1, ...hostFilter } }),
    ]);

    // Get visit reports grouped by date
    const visits = await this.prisma.visit.findMany({
      where: { createdAt: { gte: start, lte: end }, ...visitHostFilter },
      select: { createdAt: true, status: true },
    });

    const visitsByDate = new Map<
      string,
      {
        total: number;
        approved: number;
        checkedIn: number;
        checkedOut: number;
        pending: number;
        rejected: number;
      }
    >();
    visits.forEach((v) => {
      const dateKey = v.createdAt.toISOString().split("T")[0];
      if (!visitsByDate.has(dateKey)) {
        visitsByDate.set(dateKey, {
          total: 0,
          approved: 0,
          checkedIn: 0,
          checkedOut: 0,
          pending: 0,
          rejected: 0,
        });
      }
      const entry = visitsByDate.get(dateKey)!;
      entry.total++;
      if (v.status === "APPROVED") entry.approved++;
      else if (v.status === "CHECKED_IN") entry.checkedIn++;
      else if (v.status === "CHECKED_OUT") entry.checkedOut++;
      else if (v.status === "PENDING_APPROVAL" || v.status === "PRE_REGISTERED")
        entry.pending++;
      else if (v.status === "REJECTED") entry.rejected++;
    });

    const visitReports = Array.from(visitsByDate.entries()).map(
      ([date, data]) => ({
        date,
        totalVisits: data.total,
        checkedIn: data.checkedIn,
        checkedOut: data.checkedOut,
        pending: data.pending,
        approved: data.approved,
        rejected: data.rejected,
      }),
    );

    // Get delivery reports grouped by date
    const deliveries = await this.prisma.delivery.findMany({
      where: { createdAt: { gte: start, lte: end }, ...deliveryHostFilter },
      select: { createdAt: true, status: true },
    });

    const deliveriesByDate = new Map<
      string,
      { total: number; pickedUp: number; pending: number }
    >();
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

    const deliveryReports = Array.from(deliveriesByDate.entries()).map(
      ([date, data]) => ({
        date,
        totalDeliveries: data.total,
        pickedUp: data.pickedUp,
        pending: data.pending,
      }),
    );

    // Get host reports
    const hostsWithVisits = await this.prisma.host.findMany({
      where: { status: 1, ...hostFilter },
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

  @Roles(Role.ADMIN, Role.HOST, Role.STAFF)
  @Get("reports/visitors")
  async getVisitorsReport(
    @Req() req: any,
    @Query("dateFrom") dateFrom?: string,
    @Query("dateTo") dateTo?: string,
    @Query("location") location?: string,
    @Query("company") company?: string,
    @Query("status") status?: string,
  ): Promise<VisitWithHost[]> {
    const where: Prisma.VisitWhereInput = {};
    const hostScope = await this.getHostScope(req);
    if (hostScope) {
      where.host = { company: hostScope.company };
    }

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

  @Roles(Role.ADMIN, Role.HOST, Role.STAFF)
  @Get("reports/visitors/export")
  async exportVisitorsReport(
    @Req() req: any,
    @Res() res: Response,
    @Query("dateFrom") dateFrom?: string,
    @Query("dateTo") dateTo?: string,
    @Query("location") location?: string,
    @Query("company") company?: string,
    @Query("status") status?: string,
    @Query("format") format: "csv" | "excel" = "csv",
  ) {
    const data = await this.getVisitorsReport(
      req,
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

  @Roles(Role.ADMIN, Role.HOST, Role.STAFF)
  @Get("reports/deliveries")
  async getDeliveriesReport(
    @Req() req: any,
    @Query("dateFrom") dateFrom?: string,
    @Query("dateTo") dateTo?: string,
    @Query("location") location?: string,
    @Query("company") company?: string,
    @Query("status") status?: string,
  ): Promise<DeliveryWithHost[]> {
    const where: Prisma.DeliveryWhereInput = {};
    const hostScope = await this.getHostScope(req);
    if (hostScope) {
      where.host = { company: hostScope.company };
    }

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

  @Roles(Role.ADMIN, Role.HOST, Role.STAFF)
  @Get("reports/deliveries/export")
  async exportDeliveriesReport(
    @Req() req: any,
    @Res() res: Response,
    @Query("dateFrom") dateFrom?: string,
    @Query("dateTo") dateTo?: string,
    @Query("location") location?: string,
    @Query("company") company?: string,
    @Query("status") status?: string,
    @Query("format") format: "csv" | "excel" = "csv",
  ) {
    const data = await this.getDeliveriesReport(
      req,
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

  @Roles(Role.ADMIN)
  @Get("settings")
  async getSettings() {
    // Return settings in the format expected by the frontend
    return {
      id: "settings",
      smtpHost: process.env.SMTP_HOST || "",
      smtpPort: process.env.SMTP_PORT
        ? parseInt(process.env.SMTP_PORT, 10)
        : 587,
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
        enabled: !!(
          process.env.WHATSAPP_ENDPOINT && process.env.WHATSAPP_API_KEY
        ),
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

  @Roles(Role.ADMIN)
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
      if (body.smtpSecure !== undefined)
        updateEnvVar("SMTP_SECURE", body.smtpSecure);
      if (body.smtpUser !== undefined) updateEnvVar("SMTP_USER", body.smtpUser);
      if (body.smtpPassword !== undefined)
        updateEnvVar("SMTP_PASS", body.smtpPassword);
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

  @Roles(Role.ADMIN)
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

      if (body.whatsappApiKey !== undefined)
        updateEnvVar("WHATSAPP_API_KEY", body.whatsappApiKey);
      if (body.whatsappPhoneNumber !== undefined)
        updateEnvVar("WHATSAPP_CLIENT", body.whatsappPhoneNumber);
      if (body.whatsappEndpoint !== undefined)
        updateEnvVar("WHATSAPP_ENDPOINT", body.whatsappEndpoint);
      if (body.whatsappClientId !== undefined)
        updateEnvVar("WHATSAPP_CLIENT_ID", body.whatsappClientId);

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

  @Roles(Role.ADMIN)
  @Post("settings/test-whatsapp")
  async testWhatsapp(
    @Body() body: { phone?: string; recipientPhone?: string },
  ) {
    const phone = body.phone || body.recipientPhone;

    if (!phone) {
      throw new HttpException(
        "Phone number is required",
        HttpStatus.BAD_REQUEST,
      );
    }

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

  @Roles(Role.ADMIN)
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

  @Roles(Role.ADMIN)
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

  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
  @Get("visitors")
  async getVisitors(
    @Req() req: any,
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

    const hostScope = await this.getHostScope(req);
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

    if (hostScope) {
      where.host = { company: hostScope.company };
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

  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
  @Get("visitors/:id")
  async getVisitor(@Param("id") id: string, @Req() req: any) {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
      include: { host: true, qrToken: true },
    });

    if (!visit) {
      throw new HttpException("Visitor not found", HttpStatus.NOT_FOUND);
    }

    // HOST can only view visits to their company
    const hostScope = await this.getHostScope(req);
    if (hostScope && visit.host?.company !== hostScope.company) {
      throw new ForbiddenException("Access denied");
    }

    return visit;
  }

  @Roles(Role.ADMIN, Role.RECEPTION, Role.STAFF, Role.HOST)
  @Post("visitors")
  async createVisitor(
    @Req() req: any,
    @Body()
    body: {
      visitorName: string;
      visitorCompany?: string;
      visitorPhone: string;
      visitorEmail?: string;
      hostId: string;
      purpose?: string;
      location?: string;
      expectedDate?: string;
      visitDate?: string;
      notes?: string;
    },
  ) {
    // HOST/STAFF auto-sets hostId from their user account
    if (
      (req.user?.role === "STAFF" || req.user?.role === "HOST") &&
      req.user?.hostId
    ) {
      body.hostId = String(req.user.hostId);
    }

    // Resolve location from host if not provided
    let location = body.location;
    if (!location) {
      const host = await this.prisma.host.findUnique({
        where: { id: BigInt(body.hostId) },
      });
      location = host?.location || "BARWA_TOWERS";
    }

    const sessionId = crypto.randomUUID();
    const expectedDate = body.expectedDate || body.visitDate;

    const visit = await this.prisma.visit.create({
      data: {
        sessionId,
        visitorName: body.visitorName,
        visitorCompany: body.visitorCompany || "",
        visitorPhone: body.visitorPhone,
        visitorEmail: body.visitorEmail,
        hostId: BigInt(body.hostId),
        purpose: body.purpose || "",
        location: location as "BARWA_TOWERS" | "MARINA_50" | "ELEMENT_MARIOTT",
        status: "APPROVED",
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        approvedAt: new Date(),
      },
      include: { host: true },
    });

    return visit;
  }

  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
  @Put("visitors/:id")
  async updateVisitor(
    @Param("id") id: string,
    @Req() req: any,
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
    const existing = await this.prisma.visit.findUnique({
      where: { id },
      include: { host: true },
    });
    if (!existing) {
      throw new HttpException("Visitor not found", HttpStatus.NOT_FOUND);
    }

    // HOST can only update visitors belonging to their company
    const hostScope = await this.getHostScope(req);
    if (hostScope && existing.host?.company !== hostScope.company) {
      throw new ForbiddenException("Access denied");
    }

    const updateData: Prisma.VisitUpdateInput = {};
    if (body.visitorName !== undefined)
      updateData.visitorName = body.visitorName;
    if (body.visitorCompany !== undefined)
      updateData.visitorCompany = body.visitorCompany;
    if (body.visitorPhone !== undefined)
      updateData.visitorPhone = body.visitorPhone;
    if (body.visitorEmail !== undefined)
      updateData.visitorEmail = body.visitorEmail;
    if (body.purpose !== undefined) updateData.purpose = body.purpose;
    if (body.location !== undefined)
      updateData.location = body.location as
        | "BARWA_TOWERS"
        | "MARINA_50"
        | "ELEMENT_MARIOTT";
    if (body.status !== undefined)
      updateData.status =
        body.status as Prisma.EnumVisitStatusFieldUpdateOperationsInput["set"];
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

  @Roles(Role.ADMIN)
  @Delete("visitors/:id")
  async deleteVisitor(@Param("id") id: string) {
    const existing = await this.prisma.visit.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpException("Visitor not found", HttpStatus.NOT_FOUND);
    }

    await this.prisma.visit.delete({ where: { id } });
    return { success: true, message: "Visitor deleted" };
  }

  @Roles(Role.ADMIN, Role.RECEPTION)
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

  @Roles(Role.ADMIN, Role.RECEPTION)
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

  @Roles(Role.ADMIN, Role.RECEPTION)
  @Post("visitors/:id/checkin")
  async checkinVisitor(@Param("id") id: string) {
    const visit = await this.prisma.visit.findUnique({ where: { id } });
    if (!visit) {
      throw new HttpException("Visit not found", HttpStatus.NOT_FOUND);
    }

    if (visit.status !== "APPROVED") {
      throw new HttpException(
        "Visit must be approved to check in",
        HttpStatus.BAD_REQUEST,
      );
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

  @Roles(Role.ADMIN, Role.RECEPTION)
  @Post("visitors/:id/checkout")
  async checkoutVisitorById(@Param("id") id: string) {
    const visit = await this.prisma.visit.findUnique({ where: { id } });
    if (!visit) {
      throw new HttpException("Visit not found", HttpStatus.NOT_FOUND);
    }

    if (visit.status !== "CHECKED_IN") {
      throw new HttpException(
        "Visit must be checked in to check out",
        HttpStatus.BAD_REQUEST,
      );
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

  @Roles(Role.ADMIN, Role.RECEPTION)
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

  @Roles(Role.ADMIN, Role.RECEPTION)
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

  @Roles(Role.ADMIN, Role.RECEPTION)
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

  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
  @Get("hosts")
  async getHosts(
    @Req() req: any,
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Query("search") search?: string,
    @Query("location") location?: string,
    @Query("status") status?: string,
    @Query("type") type?: string,
    @Query("sortBy") sortBy = "createdAt",
    @Query("sortOrder") sortOrder: "asc" | "desc" = "desc",
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const hostScope = await this.getHostScope(req);
    const where: Prisma.HostWhereInput = {
      deletedAt: null,
    };

    if (type) {
      where.type = type as "EXTERNAL" | "STAFF";
    }

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

    if (hostScope) {
      where.company = hostScope.company;
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

  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
  @Get("hosts/:id")
  async getHost(@Param("id") id: string, @Req() req: any) {
    const host = await this.prisma.host.findUnique({
      where: { id: BigInt(id) },
    });

    if (!host) {
      throw new HttpException("Host not found", HttpStatus.NOT_FOUND);
    }

    // HOST can only view hosts in their company
    const hostScope = await this.getHostScope(req);
    if (hostScope && host.company !== hostScope.company) {
      throw new ForbiddenException("Access denied");
    }

    return host;
  }

  @Roles(Role.ADMIN)
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
        location: body.location as
          | "BARWA_TOWERS"
          | "MARINA_50"
          | "ELEMENT_MARIOTT"
          | undefined,
        status: body.status ?? 1,
        externalId: body.externalId,
      },
    });

    // Auto-create User account for the new Host
    const userEmail = body.email || `host_${host.id}@system.local`;
    let userCreated = false;

    const existingUserByEmail = await this.prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!existingUserByEmail) {
      const existingUserByHostId = await this.prisma.user.findFirst({
        where: { hostId: host.id },
      });
      if (!existingUserByHostId) {
        const randomPassword = crypto.randomBytes(16).toString("hex");
        const hashedPassword = await bcrypt.hash(randomPassword, 12);
        const newUser = await this.prisma.user.create({
          data: {
            email: userEmail,
            password: hashedPassword,
            name: body.name,
            role: "HOST",
            hostId: host.id,
          },
        });
        userCreated = true;

        // Send welcome email with password reset link (skip system.local addresses)
        if (!userEmail.endsWith("@system.local")) {
          const resetToken = this.jwtService.sign(
            { sub: Number(newUser.id), purpose: "reset" },
            { expiresIn: "72h" },
          );
          const adminUrl =
            this.configService.get("ADMIN_URL") ||
            "https://arafatvisitor.cloud/admin";
          const resetUrl = `${adminUrl}/reset-password?token=${resetToken}`;
          this.emailService
            .sendHostWelcome(userEmail, body.name, resetUrl)
            .catch(() => {});
        }
      }
    }

    return { ...host, userCreated };
  }

  @Roles(Role.ADMIN)
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
        location: body.location as
          | "BARWA_TOWERS"
          | "MARINA_50"
          | "ELEMENT_MARIOTT"
          | undefined,
        status: body.status,
      },
    });

    return host;
  }

  @Roles(Role.ADMIN)
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

  @Roles(Role.ADMIN)
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

  // ============ STAFF CRUD ============

  @Roles(Role.ADMIN)
  @Get("staff")
  async getStaff(
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
      type: "STAFF",
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

  @Roles(Role.ADMIN)
  @Post("staff")
  async createStaff(
    @Body()
    body: {
      name: string;
      company?: string;
      email?: string;
      phone?: string;
      location?: string;
      status?: number;
      externalId?: string;
    },
  ) {
    const staff = await this.prisma.host.create({
      data: {
        name: body.name,
        company: body.company || "Arafat Group",
        email: body.email,
        phone: body.phone,
        location: body.location as
          | "BARWA_TOWERS"
          | "MARINA_50"
          | "ELEMENT_MARIOTT"
          | undefined,
        status: body.status ?? 1,
        externalId: body.externalId,
        type: "STAFF",
      },
    });

    // Auto-create User account for the new Staff member
    const userEmail = body.email || `staff_${staff.id}@system.local`;
    let userCreated = false;

    const existingUserByEmail = await this.prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!existingUserByEmail) {
      const existingUserByHostId = await this.prisma.user.findFirst({
        where: { hostId: staff.id },
      });
      if (!existingUserByHostId) {
        const randomPassword = crypto.randomBytes(16).toString("hex");
        const hashedPassword = await bcrypt.hash(randomPassword, 12);
        const newUser = await this.prisma.user.create({
          data: {
            email: userEmail,
            password: hashedPassword,
            name: body.name,
            role: "STAFF",
            hostId: staff.id,
          },
        });
        userCreated = true;

        // Send welcome email with password reset link (skip system.local addresses)
        if (!userEmail.endsWith("@system.local")) {
          const resetToken = this.jwtService.sign(
            { sub: Number(newUser.id), purpose: "reset" },
            { expiresIn: "72h" },
          );
          const adminUrl =
            this.configService.get("ADMIN_URL") ||
            "https://arafatvisitor.cloud/admin";
          const resetUrl = `${adminUrl}/reset-password?token=${resetToken}`;
          this.emailService
            .sendHostWelcome(userEmail, body.name, resetUrl)
            .catch(() => {});
        }
      }
    }

    return { ...staff, userCreated };
  }

  @Roles(Role.ADMIN)
  @Put("staff/:id")
  async updateStaff(
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

    if (!existing || existing.type !== "STAFF") {
      throw new HttpException("Staff member not found", HttpStatus.NOT_FOUND);
    }

    const staff = await this.prisma.host.update({
      where: { id: BigInt(id) },
      data: {
        name: body.name,
        company: body.company,
        email: body.email,
        phone: body.phone,
        location: body.location as
          | "BARWA_TOWERS"
          | "MARINA_50"
          | "ELEMENT_MARIOTT"
          | undefined,
        status: body.status,
      },
    });

    return staff;
  }

  @Roles(Role.ADMIN)
  @Delete("staff/:id")
  async deleteStaff(@Param("id") id: string) {
    const existing = await this.prisma.host.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existing || existing.type !== "STAFF") {
      throw new HttpException("Staff member not found", HttpStatus.NOT_FOUND);
    }

    // Soft delete
    await this.prisma.host.update({
      where: { id: BigInt(id) },
      data: { deletedAt: new Date(), status: 0 },
    });

    return { success: true, message: "Staff member deleted" };
  }

  @Roles(Role.ADMIN)
  @Post("staff/import")
  async importStaff(
    @Body() body: { csvContent?: string; xlsxContent?: string },
  ) {
    const { csvContent, xlsxContent } = body || {};

    if (!csvContent && !xlsxContent) {
      throw new HttpException(
        "csvContent or xlsxContent is required",
        HttpStatus.BAD_REQUEST,
      );
    }

    // Handle XLSX content
    if (xlsxContent) {
      return this.importStaffFromXlsx(xlsxContent);
    }

    // Handle CSV content
    if (!csvContent || typeof csvContent !== "string" || !csvContent.trim()) {
      throw new HttpException("csvContent is required", HttpStatus.BAD_REQUEST);
    }

    let records: Record<string, unknown>[];
    try {
      const csvParseModule = await import("csv-parse/sync");
      const parse = (
        csvParseModule as {
          parse: (input: string, options: unknown) => Record<string, unknown>[];
        }
      ).parse;
      records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (e) {
      throw new HttpException(
        `Failed to parse CSV: ${e instanceof Error ? e.message : "Unknown error"}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.processStaffRecords(records);
  }

  private async importStaffFromXlsx(base64: string) {
    const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;
    const buffer = Buffer.from(base64Data, "base64");
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const records = XLSX.utils.sheet_to_json(worksheet, {
      defval: "",
    }) as Record<string, unknown>[];
    return this.processStaffRecords(records);
  }

  private async processStaffRecords(records: Record<string, unknown>[]) {
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
      if (v.startsWith("+")) v = v.slice(1);
      const isQatar = v.startsWith("974");
      if (!isQatar && /^\d{6}$/.test(v)) v = `974${v}`;
      else if (isQatar) {
        const rest = v.slice(3);
        if (rest.length === 6) v = `974${rest}`;
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
      if (!name) reasons.push("Missing name");

      const company = companyRaw || null;
      const email = emailRaw ? emailRaw.toLowerCase() : null;
      if (email && !emailRegex.test(email))
        reasons.push("Invalid email format");

      const phone = cleanPhone(phoneRaw);
      if (!phone) reasons.push("Invalid or missing phone");
      else if (/[a-zA-Z]/.test(phone))
        reasons.push("Invalid phone (contains letters)");

      const location = mapLocation(locationRaw || null);
      const status = mapStatus(statusRaw || null);
      if (status === undefined) reasons.push("Invalid status");

      if (reasons.length > 0) {
        rejectedRows.push({ rowNumber, reason: reasons.join("; ") });
        continue;
      }

      const externalId = externalIdRaw || null;

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
        const createdStaff = await this.prisma.host.create({
          data: {
            externalId,
            name,
            company: company || "Arafat Group",
            email,
            phone,
            location: location as
              | "BARWA_TOWERS"
              | "ELEMENT_MARIOTT"
              | "MARINA_50"
              | null,
            status: status ?? 1,
            type: "STAFF",
          },
        });
        inserted++;

        // Auto-create User account for new Staff member
        const userEmail = email || `staff_${createdStaff.id}@system.local`;
        const existingUserByEmail = await this.prisma.user.findUnique({
          where: { email: userEmail },
        });
        if (existingUserByEmail) {
          usersSkipped++;
        } else {
          const existingUserByHostId = await this.prisma.user.findFirst({
            where: { hostId: createdStaff.id },
          });
          if (existingUserByHostId) {
            usersSkipped++;
          } else {
            const randomPassword = crypto.randomBytes(16).toString("hex");
            const hashedPassword = await bcrypt.hash(randomPassword, 12);
            const newUser = await this.prisma.user.create({
              data: {
                email: userEmail,
                password: hashedPassword,
                name,
                role: "STAFF",
                hostId: createdStaff.id,
              },
            });
            usersCreated++;

            if (!userEmail.endsWith("@system.local")) {
              const resetToken = this.jwtService.sign(
                { sub: Number(newUser.id), purpose: "reset" },
                { expiresIn: "72h" },
              );
              const adminUrl =
                this.configService.get("ADMIN_URL") ||
                "https://arafatvisitor.cloud/admin";
              const resetUrl = `${adminUrl}/reset-password?token=${resetToken}`;
              this.emailService
                .sendHostWelcome(userEmail, name, resetUrl)
                .catch(() => {});
            }
          }
        }
      } catch (e) {
        const errorMsg =
          e instanceof Error ? e.message : "Unknown database error";
        rejectedRows.push({ rowNumber, reason: `Database error: ${errorMsg}` });
      }
    }

    return {
      totalProcessed,
      inserted,
      skipped,
      rejected: rejectedRows.length,
      rejectedRows,
      usersCreated,
      usersSkipped,
    };
  }

  // ============ DELIVERIES CRUD ============

  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
  @Get("deliveries")
  async getDeliveries(
    @Req() req: any,
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

    const hostScope = await this.getHostScope(req);
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

    if (hostScope) {
      where.host = { company: hostScope.company };
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

  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
  @Get("deliveries/:id")
  async getDelivery(@Param("id") id: string, @Req() req: any) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id },
      include: { host: true },
    });

    if (!delivery) {
      throw new HttpException("Delivery not found", HttpStatus.NOT_FOUND);
    }

    // HOST can only view deliveries for their company
    const hostScope = await this.getHostScope(req);
    if (hostScope && delivery.host?.company !== hostScope.company) {
      throw new ForbiddenException("Access denied");
    }

    return delivery;
  }

  @Roles(Role.ADMIN, Role.RECEPTION)
  @Post("deliveries")
  async createDelivery(
    @Body()
    body: {
      deliveryType: string;
      hostId: string;
      courier: string;
    },
  ) {
    // Fetch the host to get recipient name and location
    const host = await this.prisma.host.findUnique({
      where: { id: BigInt(body.hostId) },
    });

    if (!host) {
      throw new HttpException("Host not found", HttpStatus.NOT_FOUND);
    }

    const delivery = await this.prisma.delivery.create({
      data: {
        deliveryType: body.deliveryType,
        recipient: host.name,
        hostId: BigInt(body.hostId),
        courier: body.courier,
        location: host.location || "BARWA_TOWERS",
        status: "RECEIVED",
        receivedAt: new Date(),
      },
      include: { host: true },
    });

    return delivery;
  }

  @Roles(Role.ADMIN, Role.RECEPTION)
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
      updateData.location = body.location as
        | "BARWA_TOWERS"
        | "MARINA_50"
        | "ELEMENT_MARIOTT";
    if (body.status !== undefined) {
      updateData.status = body.status as "RECEIVED" | "PICKED_UP";
      if (body.status === "PICKED_UP") {
        updateData.pickedUpAt = new Date();
      }
    }
    if (body.hostId !== undefined) {
      updateData.host = body.hostId
        ? { connect: { id: BigInt(body.hostId) } }
        : { disconnect: true };
    }

    const delivery = await this.prisma.delivery.update({
      where: { id },
      data: updateData,
      include: { host: true },
    });

    return delivery;
  }

  @Roles(Role.ADMIN)
  @Delete("deliveries/:id")
  async deleteDelivery(@Param("id") id: string) {
    const existing = await this.prisma.delivery.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpException("Delivery not found", HttpStatus.NOT_FOUND);
    }

    await this.prisma.delivery.delete({ where: { id } });
    return { success: true, message: "Delivery deleted" };
  }

  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
  @Post("deliveries/:id/mark-picked-up")
  async markDeliveryPickedUp(@Param("id") id: string, @Req() req: any) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id },
      include: { host: true },
    });
    if (!delivery) {
      throw new HttpException("Delivery not found", HttpStatus.NOT_FOUND);
    }

    // HOST/STAFF can only mark deliveries for their company
    const hostScope = await this.getHostScope(req);
    if (hostScope && delivery.host?.company !== hostScope.company) {
      throw new ForbiddenException("Access denied");
    }

    if (delivery.status === "PICKED_UP") {
      throw new HttpException(
        "Delivery already picked up",
        HttpStatus.BAD_REQUEST,
      );
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

  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
  @Get("pre-registrations")
  async getPreRegistrations(
    @Req() req: any,
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

    const hostScope = await this.getHostScope(req);
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

    if (hostScope) {
      where.host = { company: hostScope.company };
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

  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
  @Get("pre-registrations/:id")
  async getPreRegistration(@Param("id") id: string, @Req() req: any) {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
      include: { host: true, qrToken: true },
    });

    if (!visit) {
      throw new HttpException(
        "Pre-registration not found",
        HttpStatus.NOT_FOUND,
      );
    }

    // HOST can only view pre-registrations for their company
    const hostScope = await this.getHostScope(req);
    if (hostScope && visit.host?.company !== hostScope.company) {
      throw new ForbiddenException("Access denied");
    }

    return visit;
  }

  @Roles(Role.ADMIN, Role.RECEPTION)
  @Post("pre-registrations")
  async createPreRegistration(
    @Req() req: any,
    @Body()
    body: {
      visitorName: string;
      visitorCompany?: string;
      visitorPhone: string;
      visitorEmail?: string;
      hostId: string;
      purpose: string;
      location?: string;
      expectedDate?: string;
      scheduledDate?: string;
      notes?: string;
    },
  ) {
    // Resolve location from host if not provided
    let location = body.location;
    if (!location) {
      const host = await this.prisma.host.findUnique({
        where: { id: BigInt(body.hostId) },
      });
      location = host?.location || "BARWA_TOWERS";
    }

    const sessionId = crypto.randomUUID();
    const expectedDate = body.expectedDate || body.scheduledDate;

    const visit = await this.prisma.visit.create({
      data: {
        sessionId,
        visitorName: body.visitorName,
        visitorCompany: body.visitorCompany || "",
        visitorPhone: body.visitorPhone,
        visitorEmail: body.visitorEmail,
        hostId: BigInt(body.hostId),
        purpose: body.purpose || "",
        location: location as "BARWA_TOWERS" | "MARINA_50" | "ELEMENT_MARIOTT",
        status: "PENDING_APPROVAL",
        expectedDate: expectedDate ? new Date(expectedDate) : null,
      },
      include: { host: true },
    });

    // Notify host about new pre-registration
    if (visit.host?.email) {
      this.emailService
        .sendVisitorArrival(
          visit.host.email,
          visit.visitorName,
          visit.visitorCompany,
          visit.purpose,
        )
        .catch(() => {});
    }
    if (visit.host?.phone) {
      this.whatsappService
        .sendVisitorArrival(
          visit.host.phone,
          visit.visitorName,
          visit.visitorCompany,
        )
        .catch(() => {});
    }

    return visit;
  }

  @Roles(Role.ADMIN, Role.RECEPTION)
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
      throw new HttpException(
        "Pre-registration not found",
        HttpStatus.NOT_FOUND,
      );
    }

    const updateData: Prisma.VisitUpdateInput = {};
    if (body.visitorName !== undefined)
      updateData.visitorName = body.visitorName;
    if (body.visitorCompany !== undefined)
      updateData.visitorCompany = body.visitorCompany;
    if (body.visitorPhone !== undefined)
      updateData.visitorPhone = body.visitorPhone;
    if (body.visitorEmail !== undefined)
      updateData.visitorEmail = body.visitorEmail;
    if (body.purpose !== undefined) updateData.purpose = body.purpose;
    if (body.location !== undefined)
      updateData.location = body.location as
        | "BARWA_TOWERS"
        | "MARINA_50"
        | "ELEMENT_MARIOTT";
    if (body.expectedDate !== undefined)
      updateData.expectedDate = body.expectedDate
        ? new Date(body.expectedDate)
        : null;
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

  @Roles(Role.ADMIN)
  @Delete("pre-registrations/:id")
  async deletePreRegistration(@Param("id") id: string) {
    const existing = await this.prisma.visit.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpException(
        "Pre-registration not found",
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prisma.visit.delete({ where: { id } });
    return { success: true, message: "Pre-registration deleted" };
  }

  @Roles(Role.ADMIN, Role.HOST, Role.STAFF)
  @Post("pre-registrations/:id/approve")
  async approvePreRegistration(@Param("id") id: string, @Req() req: any) {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
      include: { host: true },
    });
    if (!visit) {
      throw new HttpException(
        "Pre-registration not found",
        HttpStatus.NOT_FOUND,
      );
    }

    // HOST can only approve pre-registrations for their company
    const hostScope = await this.getHostScope(req);
    if (hostScope && visit.host?.company !== hostScope.company) {
      throw new ForbiddenException(
        "You can only approve pre-registrations for your company",
      );
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

  @Roles(Role.ADMIN, Role.HOST, Role.STAFF)
  @Post("pre-registrations/:id/reject")
  async rejectPreRegistration(
    @Param("id") id: string,
    @Req() req: any,
    @Body() body: { reason?: string },
  ) {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
      include: { host: true },
    });
    if (!visit) {
      throw new HttpException(
        "Pre-registration not found",
        HttpStatus.NOT_FOUND,
      );
    }

    // HOST can only reject pre-registrations for their company
    const hostScope = await this.getHostScope(req);
    if (hostScope && visit.host?.company !== hostScope.company) {
      throw new ForbiddenException(
        "You can only reject pre-registrations for your company",
      );
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

  @Roles(Role.ADMIN, Role.HOST, Role.STAFF)
  @Post("pre-registrations/:id/re-approve")
  async reApprovePreRegistration(@Param("id") id: string, @Req() req: any) {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
      include: { host: true },
    });
    if (!visit) {
      throw new HttpException(
        "Pre-registration not found",
        HttpStatus.NOT_FOUND,
      );
    }

    // HOST can only re-approve pre-registrations for their company
    const hostScope = await this.getHostScope(req);
    if (hostScope && visit.host?.company !== hostScope.company) {
      throw new ForbiddenException(
        "You can only re-approve pre-registrations for your company",
      );
    }

    if (visit.status !== "REJECTED") {
      throw new HttpException(
        "Only rejected pre-registrations can be re-approved",
        HttpStatus.BAD_REQUEST,
      );
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

  @Roles(Role.ADMIN)
  @Get("users")
  async getUsers(
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Query("search") search?: string,
    @Query("role") role?: string,
    @Query("status") status?: string,
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

    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
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

  @Roles(Role.ADMIN)
  @Get("users/:id")
  async getUser(@Param("id") id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(id, 10) },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
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

  @Roles(Role.ADMIN)
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

    let hostId: bigint | null = body.hostId ? BigInt(body.hostId) : null;

    // For STAFF role, auto-create a Host record (type=STAFF, company="Arafat Group")
    if (body.role === "STAFF" && !hostId) {
      const existingHost = await this.prisma.host.findFirst({
        where: { email: body.email, type: "STAFF" },
      });
      if (existingHost) {
        hostId = existingHost.id;
      } else {
        const createdHost = await this.prisma.host.create({
          data: {
            name: body.name || body.email,
            company: "Arafat Group",
            email: body.email,
            phone: "",
            location: "BARWA_TOWERS",
            status: 1,
            type: "STAFF",
          },
        });
        hostId = createdHost.id;
      }
    }

    const user = await this.prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        password: hashedPassword,
        role: body.role as "ADMIN" | "RECEPTION" | "HOST" | "STAFF",
        status: "ACTIVE",
        hostId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        hostId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  @Roles(Role.ADMIN)
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
    if (body.role !== undefined)
      updateData.role = body.role as "ADMIN" | "RECEPTION" | "HOST";
    if (body.password && body.password.trim() !== "") {
      updateData.password = await bcrypt.hash(body.password, 12);
    }
    if (body.hostId !== undefined) {
      updateData.host = body.hostId
        ? { connect: { id: BigInt(body.hostId) } }
        : { disconnect: true };
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        hostId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  @Roles(Role.ADMIN)
  @Post("users/:id/activate")
  async activateUser(@Param("id") id: string) {
    const userId = parseInt(id, 10);
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { status: "ACTIVE" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        hostId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }

  @Roles(Role.ADMIN)
  @Post("users/:id/deactivate")
  async deactivateUser(@Param("id") id: string) {
    const userId = parseInt(id, 10);
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { status: "INACTIVE" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        hostId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }

  @Roles(Role.ADMIN)
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

  @Roles(Role.ADMIN)
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

  // ============ USERS BULK IMPORT ============

  @Roles(Role.ADMIN)
  @Post("users/import")
  async importUsers(
    @Body() body: { csvContent?: string; xlsxContent?: string },
  ) {
    const { csvContent, xlsxContent } = body || {};

    if (!csvContent && !xlsxContent) {
      throw new HttpException(
        "csvContent or xlsxContent is required",
        HttpStatus.BAD_REQUEST,
      );
    }

    // Handle XLSX content
    if (xlsxContent) {
      return this.importUsersFromXlsx(xlsxContent);
    }

    // Handle CSV content
    if (!csvContent || typeof csvContent !== "string" || !csvContent.trim()) {
      throw new HttpException("csvContent is required", HttpStatus.BAD_REQUEST);
    }

    let records: Record<string, unknown>[];
    try {
      const csvParseModule = await import("csv-parse/sync");
      const parse = (
        csvParseModule as {
          parse: (input: string, options: unknown) => Record<string, unknown>[];
        }
      ).parse;
      records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (e) {
      throw new HttpException(
        `Failed to parse CSV: ${e instanceof Error ? e.message : "Unknown error"}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.processUserRecords(records);
  }

  private async importUsersFromXlsx(base64: string) {
    const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;
    const buffer = Buffer.from(base64Data, "base64");
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const records = XLSX.utils.sheet_to_json(worksheet, {
      defval: "",
    }) as Record<string, unknown>[];
    return this.processUserRecords(records);
  }

  private async processUserRecords(records: Record<string, unknown>[]) {
    let totalProcessed = 0;
    let inserted = 0;
    let skipped = 0;
    const rejectedRows: Array<{ rowNumber: number; reason: string }> = [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
    const validRoles = ["ADMIN", "RECEPTION", "STAFF", "HOST"];

    const cleanPhone = (value?: string | null) => {
      if (!value) return "";
      let v = value.replace(/[\s\-()]/g, "");
      if (v.startsWith("+")) v = v.slice(1);
      const isQatar = v.startsWith("974");
      if (!isQatar && /^\d{6,8}$/.test(v)) v = `974${v}`;
      return v;
    };

    for (let index = 0; index < records.length; index++) {
      const row = records[index];
      const rowNumber = index + 2;
      totalProcessed += 1;

      const reasons: string[] = [];
      const nameRaw = (row["Name"] || row["name"] || "").toString().trim();
      const emailRaw = (
        row["Email"] ||
        row["email"] ||
        row["Email Address"] ||
        ""
      )
        .toString()
        .trim();
      const phoneRaw = (
        row["Phone"] ||
        row["phone"] ||
        row["Phone Number"] ||
        ""
      )
        .toString()
        .trim();
      const roleRaw = (row["Role"] || row["role"] || "")
        .toString()
        .trim()
        .toUpperCase();

      const name = nameRaw || "";
      if (!name) reasons.push("Missing name");

      const email = emailRaw ? emailRaw.toLowerCase() : "";
      if (!email) reasons.push("Missing email");
      else if (!emailRegex.test(email)) reasons.push("Invalid email format");

      const phone = cleanPhone(phoneRaw);

      if (!validRoles.includes(roleRaw))
        reasons.push(
          `Invalid role: ${roleRaw || "(empty)"}. Must be ADMIN, RECEPTION, STAFF, or HOST`,
        );

      if (reasons.length > 0) {
        rejectedRows.push({ rowNumber, reason: reasons.join("; ") });
        continue;
      }

      // Skip demo/system accounts
      if (
        email.endsWith("@arafatvisitor.cloud") ||
        email.endsWith("@system.local")
      ) {
        skipped++;
        continue;
      }

      // Check for duplicate email
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        skipped++;
        continue;
      }

      try {
        let hostId: bigint | null = null;

        // For STAFF role, find existing or create Host record (type=STAFF)
        if (roleRaw === "STAFF") {
          const existingHost = await this.prisma.host.findFirst({
            where: { email, type: "STAFF" },
          });
          if (existingHost) {
            hostId = existingHost.id;
          } else {
            const createdHost = await this.prisma.host.create({
              data: {
                name,
                company: "Arafat Group",
                email,
                phone,
                location: "BARWA_TOWERS",
                status: 1,
                type: "STAFF",
              },
            });
            hostId = createdHost.id;
          }
        }

        // For HOST role, find existing or create Host record (type=EXTERNAL)
        if (roleRaw === "HOST") {
          const existingHost = await this.prisma.host.findFirst({
            where: { email, type: "EXTERNAL" },
          });
          if (existingHost) {
            hostId = existingHost.id;
          } else {
            const createdHost = await this.prisma.host.create({
              data: {
                name,
                company: "",
                email,
                phone,
                location: "BARWA_TOWERS",
                status: 1,
                type: "EXTERNAL",
              },
            });
            hostId = createdHost.id;
          }
        }

        const randomPassword = crypto.randomBytes(16).toString("hex");
        const hashedPassword = await bcrypt.hash(randomPassword, 12);

        const newUser = await this.prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name,
            role: roleRaw as "ADMIN" | "RECEPTION" | "STAFF" | "HOST",
            status: "ACTIVE",
            hostId,
          },
        });
        inserted++;

        // Send welcome email with password reset link
        const resetToken = this.jwtService.sign(
          { sub: Number(newUser.id), purpose: "reset" },
          { expiresIn: "72h" },
        );
        const adminUrl =
          this.configService.get("ADMIN_URL") ||
          "https://arafatvisitor.cloud/admin";
        const resetUrl = `${adminUrl}/reset-password?token=${resetToken}`;
        this.emailService
          .sendHostWelcome(email, name, resetUrl)
          .catch(() => {});
      } catch (e) {
        const errorMsg =
          e instanceof Error ? e.message : "Unknown database error";
        rejectedRows.push({ rowNumber, reason: `Database error: ${errorMsg}` });
      }
    }

    return {
      totalProcessed,
      inserted,
      skipped,
      rejected: rejectedRows.length,
      rejectedRows,
    };
  }

  // ============ LOOKUP TABLES ============

  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
  @Get("lookups/purposes")
  async getPurposeLookups() {
    const purposes = await this.prisma.lookupPurpose.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
    return purposes;
  }

  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
  @Get("lookups/delivery-types")
  async getDeliveryTypeLookups() {
    const deliveryTypes = await this.prisma.lookupDeliveryType.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
    return deliveryTypes;
  }

  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
  @Get("lookups/couriers")
  async getCourierLookups() {
    const couriers = await this.prisma.lookupCourier.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
    return couriers;
  }

  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
  @Get("lookups/locations")
  async getLocationLookups() {
    const locations = await this.prisma.lookupLocation.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
    return locations;
  }

  // ============ MY TEAM (Host Sub-Members) ============

  @Roles(Role.ADMIN, Role.HOST, Role.RECEPTION)
  @UseInterceptors(AuditInterceptor)
  @Post("my-team")
  async createTeamMember(
    @Req() req: any,
    @Body() body: CreateSubMemberDto,
  ) {
    let targetCompany: string;
    let targetLocation: Location | null | undefined = undefined;

    // For HOST users: use their own company via getHostScope
    if (req.user?.role === "HOST") {
      const hostScope = await this.getHostScope(req);
      if (!hostScope) {
        throw new ForbiddenException(
          "Only HOST users with an active host record can create team members",
        );
      }

      // Verify the host's own record is active
      const hostRecord = await this.prisma.host.findUnique({
        where: { id: hostScope.hostId },
        select: { status: true, location: true },
      });
      if (!hostRecord || hostRecord.status !== 1) {
        throw new ForbiddenException(
          "Your host record is not active. Cannot create team members.",
        );
      }

      targetCompany = hostScope.company;
      targetLocation = hostRecord.location;
    }
    // For RECEPTION/ADMIN: require hostId to determine company
    else if (req.user?.role === "RECEPTION" || req.user?.role === "ADMIN") {
      if (!body.hostId) {
        throw new HttpException(
          "hostId is required for RECEPTION/ADMIN users",
          HttpStatus.BAD_REQUEST,
        );
      }

      const targetHost = await this.prisma.host.findUnique({
        where: { id: BigInt(body.hostId) },
        select: { company: true, location: true, status: true },
      });
      if (!targetHost || targetHost.status !== 1) {
        throw new HttpException(
          "Host not found or inactive",
          HttpStatus.NOT_FOUND,
        );
      }

      targetCompany = targetHost.company;
      targetLocation = targetHost.location;
    } else {
      throw new ForbiddenException("Insufficient permissions");
    }

    // Check for duplicate email (case-insensitive)
    const existingHost = await this.prisma.host.findFirst({
      where: {
        email: { equals: body.email.toLowerCase(), mode: "insensitive" },
        deletedAt: null,
      },
    });
    if (existingHost) {
      throw new HttpException(
        "Email already exists as a host contact",
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check company member count (50 max)
    const memberCount = await this.prisma.host.count({
      where: {
        company: targetCompany,
        status: 1,
        deletedAt: null,
      },
    });
    if (memberCount >= 50) {
      throw new HttpException(
        "Company member limit reached (50 maximum)",
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create the sub-member host record
    const subMember = await this.prisma.host.create({
      data: {
        name: body.name.trim(),
        email: body.email.toLowerCase().trim(),
        phone: body.phone?.trim() || null,
        company: targetCompany,
        location: targetLocation,
        type: "EXTERNAL",
        status: 1,
        createdById: req.user?.sub ?? undefined,
      },
    });

    return subMember;
  }

  @Roles(Role.ADMIN, Role.HOST, Role.RECEPTION)
  @Get("my-team")
  async getMyTeam(
    @Req() req: any,
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Query("search") search?: string,
    @Query("status") status?: string,
    @Query("hostId") hostId?: string,
  ) {
    let targetCompany: string;

    // For HOST users: use their own company via getHostScope
    if (req.user?.role === "HOST") {
      const hostScope = await this.getHostScope(req);
      if (!hostScope) {
        throw new ForbiddenException(
          "Only HOST users with an active host record can view team members",
        );
      }
      targetCompany = hostScope.company;
    }
    // For RECEPTION/ADMIN: require hostId to determine company
    else if (req.user?.role === "RECEPTION" || req.user?.role === "ADMIN") {
      if (!hostId) {
        throw new HttpException(
          "hostId query parameter is required",
          HttpStatus.BAD_REQUEST,
        );
      }
      const targetHost = await this.prisma.host.findUnique({
        where: { id: BigInt(hostId) },
        select: { company: true, status: true, deletedAt: true },
      });
      if (!targetHost || targetHost.deletedAt) {
        throw new HttpException("Host not found", HttpStatus.NOT_FOUND);
      }
      if (targetHost.status !== 1) {
        throw new HttpException(
          "Host not found or inactive",
          HttpStatus.NOT_FOUND,
        );
      }
      targetCompany = targetHost.company;
    } else {
      throw new ForbiddenException("Insufficient permissions");
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.HostWhereInput = {
      company: targetCompany,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status !== undefined) {
      where.status = parseInt(status, 10);
    }

    const [data, total] = await Promise.all([
      this.prisma.host.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          company: true,
          location: true,
          status: true,
          type: true,
          createdAt: true,
          updatedAt: true,
        },
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

  @Roles(Role.ADMIN, Role.HOST, Role.RECEPTION)
  @UseInterceptors(AuditInterceptor)
  @Patch("my-team/:id")
  async updateTeamMember(
    @Param("id") id: string,
    @Req() req: any,
    @Body()
    body: {
      name?: string;
      email?: string;
      phone?: string;
    },
  ) {
    // Verify target host exists and is not soft-deleted
    const targetHost = await this.prisma.host.findUnique({
      where: { id: BigInt(id) },
    });
    if (!targetHost || targetHost.deletedAt) {
      throw new HttpException("Team member not found", HttpStatus.NOT_FOUND);
    }

    // For HOST users: verify same company restriction
    if (req.user?.role === "HOST") {
      const hostScope = await this.getHostScope(req);
      if (!hostScope) {
        throw new ForbiddenException(
          "Only HOST users with an active host record can update team members",
        );
      }
      if (targetHost.company !== hostScope.company) {
        throw new ForbiddenException(
          "You can only update team members in your company",
        );
      }
    }
    // For RECEPTION/ADMIN: no company restriction (already have target host)

    // If email is being changed, check uniqueness
    if (body.email && body.email.toLowerCase() !== targetHost.email?.toLowerCase()) {
      const existingHost = await this.prisma.host.findFirst({
        where: {
          email: { equals: body.email.toLowerCase(), mode: "insensitive" },
          deletedAt: null,
          id: { not: BigInt(id) },
        },
      });
      if (existingHost) {
        throw new HttpException(
          "Email already exists as a host contact",
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const updateData: Prisma.HostUpdateInput = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.email !== undefined) updateData.email = body.email.toLowerCase().trim();
    if (body.phone !== undefined) updateData.phone = body.phone?.trim() || null;

    const updated = await this.prisma.host.update({
      where: { id: BigInt(id) },
      data: updateData,
    });

    return updated;
  }

  @Roles(Role.ADMIN, Role.HOST, Role.RECEPTION)
  @UseInterceptors(AuditInterceptor)
  @Patch("my-team/:id/status")
  async toggleTeamMemberStatus(
    @Param("id") id: string,
    @Req() req: any,
    @Body() body: { status: 0 | 1 },
  ) {
    // Verify target host exists
    const targetHost = await this.prisma.host.findUnique({
      where: { id: BigInt(id) },
    });
    if (!targetHost) {
      throw new HttpException("Team member not found", HttpStatus.NOT_FOUND);
    }

    // For HOST users: verify same company restriction and prevent self-deactivation
    if (req.user?.role === "HOST") {
      const hostScope = await this.getHostScope(req);
      if (!hostScope) {
        throw new ForbiddenException(
          "Only HOST users with an active host record can toggle team member status",
        );
      }
      if (targetHost.company !== hostScope.company) {
        throw new ForbiddenException(
          "You can only update team members in your company",
        );
      }
      // Prevent self-deactivation for HOST users
      if (BigInt(id) === hostScope.hostId) {
        throw new HttpException(
          "Cannot deactivate your own host record",
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    // For RECEPTION/ADMIN: no company restriction or self-deactivation check (no host record)

    const newStatus = body.status;
    await this.prisma.host.update({
      where: { id: BigInt(id) },
      data: { status: newStatus },
    });

    return {
      id,
      name: targetHost.name,
      status: newStatus,
      message: newStatus === 0 ? "Team member deactivated" : "Team member reactivated",
    };
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
