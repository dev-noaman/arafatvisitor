import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Location } from "@prisma/client";
import { CreateHostDto } from "./dto/create-host.dto";
import { UpdateHostDto } from "./dto/update-host.dto";

@Injectable()
export class HostsService {
  constructor(private prisma: PrismaService) {}

  async findAll(location?: string) {
    const where: { status?: number; deletedAt?: null; location?: Location } = {
      status: 1,
      deletedAt: null,
    };
    if (location) {
      const loc = this.normalizeLocation(location);
      if (loc) where.location = loc;
    }
    return this.prisma.host.findMany({
      where,
      orderBy: [{ company: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        company: true,
        email: true,
        phone: true,
        location: true,
        status: true,
        type: true,
      },
    });
  }

  async findOne(id: bigint) {
    const host = await this.prisma.host.findFirst({
      where: { id, deletedAt: null },
    });
    if (!host) throw new NotFoundException("Host not found");
    return host;
  }

  async create(dto: CreateHostDto) {
    return this.prisma.host.create({
      data: {
        name: dto.name,
        company: dto.company,
        email: dto.email ?? undefined,
        phone: dto.phone,
        location: dto.location ? (dto.location as Location) : undefined,
        status: dto.status ?? 1,
        externalId: dto.externalId ?? undefined,
      },
    });
  }

  async update(id: bigint, dto: UpdateHostDto) {
    await this.findOne(id);
    return this.prisma.host.update({
      where: { id },
      data: {
        name: dto.name,
        company: dto.company,
        email: dto.email,
        phone: dto.phone,
        location: dto.location as Location | undefined,
        status: dto.status,
      },
    });
  }

  async remove(id: bigint) {
    await this.findOne(id);
    return this.prisma.host.update({
      where: { id },
      data: { deletedAt: new Date(), status: 0 },
    });
  }

  normalizeLocation(location: string): Location | null {
    const s = location.toLowerCase();
    if (s.includes("barwa")) return "BARWA_TOWERS";
    if (s.includes("marina") && s.includes("50")) return "MARINA_50";
    if (s.includes("element") || s.includes("mariott"))
      return "ELEMENT_MARIOTT";
    return null;
  }
}
