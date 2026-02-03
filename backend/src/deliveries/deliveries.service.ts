import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Location, Role } from "@prisma/client";
import { CreateDeliveryDto } from "./dto/create-delivery.dto";

@Injectable()
export class DeliveriesService {
  constructor(private prisma: PrismaService) {}

  private normalizeLocation(loc: string): Location {
    const s = loc.toLowerCase();
    if (s.includes("barwa")) return "BARWA_TOWERS";
    if (s.includes("marina") && s.includes("50")) return "MARINA_50";
    if (s.includes("element") || s.includes("mariott"))
      return "ELEMENT_MARIOTT";
    return "BARWA_TOWERS";
  }

  async findAll(location: string, search?: string) {
    const loc = this.normalizeLocation(location);
    const where: {
      location: Location;
      OR?: Array<{
        recipient?: { contains: string; mode: "insensitive" };
        id?: { contains: string; mode: "insensitive" };
      }>;
    } = {
      location: loc,
    };
    if (search?.trim()) {
      const s = search.trim();
      where.OR = [
        { recipient: { contains: s, mode: "insensitive" } },
        { id: { contains: s, mode: "insensitive" } },
      ];
    }
    return this.prisma.delivery.findMany({
      where,
      include: { host: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findMy(hostUserId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: hostUserId },
    });
    if (!user?.hostId) return [];
    return this.prisma.delivery.findMany({
      where: { hostId: user.hostId },
      include: { host: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(dto: CreateDeliveryDto, location: string, userId?: number) {
    const loc = this.normalizeLocation(location);
    const hostId = dto.hostId ? BigInt(dto.hostId) : undefined;
    return this.prisma.delivery.create({
      data: {
        recipient: dto.recipient,
        courier: dto.courier,
        location: loc,
        hostId,
        notes: dto.notes,
      },
      include: { host: true },
    });
  }

  async receive(id: string, userId?: number) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id },
    });
    if (!delivery) throw new NotFoundException("Delivery not found");
    if (delivery.status === "RECEIVED") {
      throw new BadRequestException("Delivery already received");
    }
    return this.prisma.delivery.update({
      where: { id },
      data: {
        status: "RECEIVED",
        receivedAt: new Date(),
        receivedById: userId?.toString(),
      },
      include: { host: true },
    });
  }
}
