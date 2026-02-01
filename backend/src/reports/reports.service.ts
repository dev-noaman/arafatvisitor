import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Location } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  private normalizeLocation(loc: string): Location {
    const s = loc.toLowerCase();
    if (s.includes('barwa')) return 'BARWA_TOWERS';
    if (s.includes('marina') && s.includes('50')) return 'MARINA_50';
    if (s.includes('element') || s.includes('mariott')) return 'ELEMENT_MARIOTT';
    return 'BARWA_TOWERS';
  }

  async getVisitsReport(location?: string, from?: string, to?: string) {
    const where: { location?: Location; checkInAt?: { gte?: Date; lte?: Date } } = {};
    if (location) where.location = this.normalizeLocation(location);
    if (from || to) {
      where.checkInAt = {};
      if (from) where.checkInAt.gte = new Date(from);
      if (to) where.checkInAt.lte = new Date(to);
    }
    const [total, checkedIn, checkedOut] = await Promise.all([
      this.prisma.visit.count({ where }),
      this.prisma.visit.count({ where: { ...where, status: 'CHECKED_IN' } }),
      this.prisma.visit.count({ where: { ...where, status: 'CHECKED_OUT' } }),
    ]);
    return { total, checkedIn, checkedOut };
  }

  async getDeliveriesReport(location?: string, from?: string, to?: string) {
    const where: { location?: Location; createdAt?: { gte?: Date; lte?: Date } } = {};
    if (location) where.location = this.normalizeLocation(location);
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }
    const [total, received, pickedUp] = await Promise.all([
      this.prisma.delivery.count({ where }),
      this.prisma.delivery.count({ where: { ...where, status: 'RECEIVED' } }),
      this.prisma.delivery.count({ where: { ...where, status: 'PICKED_UP' } }),
    ]);
    return { total, received, pickedUp };
  }

  async getHostsReport(location?: string) {
    const where: { status: number; deletedAt: null; location?: Location } = {
      status: 1,
      deletedAt: null,
    };
    if (location) where.location = this.normalizeLocation(location);
    const total = await this.prisma.host.count({ where });
    const withVisits = await this.prisma.host.count({
      where: { ...where, visits: { some: {} } },
    });
    return { total, withVisits };
  }
}
