import { Injectable } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
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
}
