import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "../notifications/email.service";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";

@Injectable()
export class OfficeRndSyncService {
  private readonly logger = new Logger(OfficeRndSyncService.name);
  private isSyncing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Sync new companies from OfficeRND every hour.
   * Skips if a sync is already in progress.
   */
  @Cron("0 * * * *") // Every hour at :00
  async syncOnSchedule() {
    if (this.isSyncing) {
      this.logger.warn("OfficeRND sync already in progress, skipping");
      return;
    }
    try {
      this.isSyncing = true;
      await this.sync();
    } finally {
      this.isSyncing = false;
    }
  }

  async sync() {
    const CLIENT_ID =
      this.configService.get("OFFICERND_CLIENT_ID") || "ZvJWSI3v6hBZyGnS";
    const CLIENT_SECRET =
      this.configService.get("OFFICERND_CLIENT_SECRET") ||
      "Be4GtOyNcl4BcWFZPiBQlwH71KO7QP3l";
    const ORG_SLUG =
      this.configService.get("OFFICERND_ORG_SLUG") ||
      "arafat-business-centers";
    const BASE = `https://app.officernd.com/api/v2/organizations/${ORG_SLUG}`;
    const TOKEN_SCOPE =
      "flex.community.companies.read flex.community.members.read flex.space.locations.read";

    try {
      // 1. Get OAuth token
      const tokenRes = await fetch(
        "https://identity.officernd.com/oauth/token",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials&scope=${encodeURIComponent(TOKEN_SCOPE)}`,
        },
      );
      if (!tokenRes.ok) {
        this.logger.error(`OfficeRND auth failed: ${tokenRes.status}`);
        return;
      }
      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;

      // 2. Fetch locations for name mapping
      let locationById = new Map<string, string>();
      try {
        const locations = await this.fetchAll(
          `${BASE}/locations?$limit=50`,
          accessToken,
        );
        locationById = new Map(
          locations.map((loc: any) => [loc._id, loc.name || null]),
        );
      } catch (_) {}

      // 3. Fetch all active companies
      const companies = await this.fetchAll(
        `${BASE}/companies?status=active&$limit=50`,
        accessToken,
      );

      // 4. Get all existing externalIds from DB in one query
      const existingHosts = await this.prisma.host.findMany({
        where: {
          externalId: { in: companies.map((c: any) => c._id) },
        },
        select: { externalId: true },
      });
      const existingIds = new Set(
        existingHosts.map((h) => h.externalId),
      );

      // 5. Filter to only new companies
      const newCompanies = companies.filter(
        (c: any) => !existingIds.has(c._id),
      );

      if (newCompanies.length === 0) {
        this.logger.log(
          `OfficeRND sync: ${companies.length} companies checked, all exist — nothing to do`,
        );
        return;
      }

      this.logger.log(
        `OfficeRND sync: ${newCompanies.length} new companies out of ${companies.length} total`,
      );

      // 6. Process new companies
      let inserted = 0;
      let usersCreated = 0;
      let rejected = 0;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

      for (const c of newCompanies) {
        const name = (c.name || "").trim();
        if (!name) {
          rejected++;
          continue;
        }

        const email = c.email ? c.email.toLowerCase().trim() : null;
        if (email && !emailRegex.test(email)) {
          rejected++;
          continue;
        }

        // Fetch first member for contact person details (name, email, phone)
        let memberName: string | null = null;
        let memberEmail: string | null = null;
        let phone = this.extractPhone(c);
        try {
          const members = await this.fetchAll(
            `${BASE}/members?company=${encodeURIComponent(c._id)}&$limit=1`,
            accessToken,
          );
          if (members.length > 0) {
            const m = members[0];
            memberName = m.name || null;
            memberEmail = m.email ? m.email.toLowerCase().trim() : null;
            if (!phone && m.phone) {
              phone = m.phone;
            }
          }
        } catch (_) {}

        if (!phone) {
          try {
            const res = await fetch(
              `${BASE}/companies/${encodeURIComponent(c._id)}`,
              { headers: { Authorization: `Bearer ${accessToken}` } },
            );
            if (res.ok) {
              const full = await res.json();
              if (full.properties?.["Phone Number"] != null) {
                phone = String(full.properties["Phone Number"]);
              }
            }
          } catch (_) {}
        }

        // Host name = member name (contact person), fallback to company name
        const hostName = memberName || name;
        // Host email = member email (contact person), fallback to company email
        const hostEmail = memberEmail || email;

        const cleanedPhone = this.cleanPhone(phone);
        const locName = c.location
          ? locationById.get(c.location)
          : null;
        const location = this.mapLocation(locName);

        // Validate resolved email
        if (hostEmail && !emailRegex.test(hostEmail)) {
          rejected++;
          continue;
        }

        try {
          const createdHost = await this.prisma.host.create({
            data: {
              externalId: c._id,
              name: hostName,
              company: name,
              email: hostEmail,
              phone: cleanedPhone || null,
              location: location as
                | "BARWA_TOWERS"
                | "ELEMENT_MARIOTT"
                | "MARINA_50"
                | null,
              status: 1,
            },
          });
          inserted++;

          // Auto-create HOST user
          const userEmail =
            hostEmail || `host_${createdHost.id}@system.local`;
          const existingUser = await this.prisma.user.findUnique({
            where: { email: userEmail },
          });
          if (!existingUser) {
            const existingByHostId = await this.prisma.user.findFirst({
              where: { hostId: createdHost.id },
            });
            if (!existingByHostId) {
              const randomPassword = crypto
                .randomBytes(16)
                .toString("hex");
              const hashedPassword = await bcrypt.hash(randomPassword, 12);
              const newUser = await this.prisma.user.create({
                data: {
                  email: userEmail,
                  password: hashedPassword,
                  name: hostName,
                  role: "HOST",
                  hostId: createdHost.id,
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
                  .sendHostWelcome(userEmail, hostName, resetUrl)
                  .catch(() => {});
              }
            }
          }
        } catch (e) {
          this.logger.error(
            `Failed to create host ${name}: ${e instanceof Error ? e.message : e}`,
          );
          rejected++;
        }
      }

      this.logger.log(
        `OfficeRND sync done: ${inserted} inserted, ${usersCreated} users created, ${rejected} rejected`,
      );
    } catch (error) {
      this.logger.error(
        `OfficeRND sync failed: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  private async fetchAll(url: string, token: string): Promise<any[]> {
    const results: any[] = [];
    let cursor: string | null = null;
    do {
      let u = url;
      if (cursor)
        u +=
          (url.includes("?") ? "&" : "?") +
          `$cursorNext=${encodeURIComponent(cursor)}`;
      const res = await fetch(u, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok)
        throw new Error(`OfficeRND API ${res.status}: ${await res.text()}`);
      const data = await res.json();
      results.push(...(data.results || []));
      cursor = data.cursorNext || null;
    } while (cursor);
    return results;
  }

  private extractPhone(company: any): string | null {
    if (company.properties?.["Phone Number"] != null) {
      return String(company.properties["Phone Number"]);
    }
    return company.phone ?? null;
  }

  private cleanPhone(value?: string | null): string {
    if (!value) return "";
    // Dual numbers "xxx/xxx" → take left part before "/"
    let v = value.includes("/") ? value.split("/")[0].trim() : value;
    v = v.replace(/[\s\-()]/g, "");
    if (v.startsWith("+")) v = v.slice(1);
    // Already has 974 prefix → keep as-is
    if (v.startsWith("974")) return v;
    if (/^\d{6}$/.test(v)) {
      // 6 digits → prefix 974 (Qatar)
      v = `974${v}`;
    } else if (/^\d{8}$/.test(v) && /^[34567]/.test(v)) {
      // 8 digits starting with 3/4/5/6/7 → prefix 974 (Qatar mobile/landline)
      v = `974${v}`;
    } else if (/^\d{11}$/.test(v) && /^(010|011|012)/.test(v)) {
      // 11 digits starting with 010/011/012 → prefix 2 (Egypt)
      v = `2${v}`;
    }
    return v;
  }

  private mapLocation(locName?: string | null): string | null {
    if (!locName) return null;
    const v = locName.toLowerCase();
    if (v.includes("barwa")) return "BARWA_TOWERS";
    if (v.includes("element") || v.includes("mariott") || v.includes("marriott"))
      return "ELEMENT_MARIOTT";
    if (v.includes("marina")) return "MARINA_50";
    return null;
  }
}
