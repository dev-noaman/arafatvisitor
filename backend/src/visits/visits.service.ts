import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QrTokenService } from './qr-token.service';
import { EmailService } from '../notifications/email.service';
import { WhatsAppService } from '../notifications/whatsapp.service';
import { Location, VisitStatus, Role } from '@prisma/client';
import { CreateVisitDto } from './dto/create-visit.dto';
import { PreRegisterVisitDto } from './dto/pre-register.dto';

@Injectable()
export class VisitsService {
  constructor(
    private prisma: PrismaService,
    private qrTokenService: QrTokenService,
    private emailService: EmailService,
    private whatsappService: WhatsAppService,
  ) {}

  private normalizeLocation(loc: string): Location {
    const s = loc.toLowerCase();
    if (s.includes('barwa')) return 'BARWA_TOWERS';
    if (s.includes('marina') && s.includes('50')) return 'MARINA_50';
    if (s.includes('element') || s.includes('mariott')) return 'ELEMENT_MARIOTT';
    return 'BARWA_TOWERS';
  }

  async create(dto: CreateVisitDto, userId?: number) {
    const hostId = BigInt(dto.hostId);
    const host = await this.prisma.host.findFirst({
      where: { id: hostId, status: 1, deletedAt: null },
    });
    if (!host) throw new BadRequestException('Invalid host');

    let sessionId = this.qrTokenService.generateSessionId();
    while (await this.prisma.visit.findUnique({ where: { sessionId } })) {
      sessionId = this.qrTokenService.generateSessionId();
    }

    const location = this.normalizeLocation(dto.location);
    const visit = await this.prisma.visit.create({
      data: {
        sessionId,
        visitorName: dto.visitorName,
        visitorCompany: dto.visitorCompany,
        visitorPhone: dto.visitorPhone,
        visitorEmail: dto.visitorEmail,
        hostId,
        purpose: dto.purpose,
        location,
        status: 'CHECKED_IN',
        checkInAt: new Date(),
      },
      include: { host: true },
    });

    await this.prisma.checkEvent.create({
      data: {
        visitId: visit.id,
        type: 'CHECK_IN',
        userId: userId ?? null,
      },
    });

    await this.qrTokenService.createForVisit(visit.id, sessionId);

    if (host.email) {
      this.emailService
        .sendVisitorArrival(host.email, visit.visitorName, visit.visitorCompany, visit.purpose)
        .catch(() => {});
    }
    if (host.phone) {
      this.whatsappService
        .sendVisitorArrival(host.phone, visit.visitorName, visit.visitorCompany)
        .catch(() => {});
    }

    return {
      id: visit.id,
      sessionId: visit.sessionId,
      visitor: {
        name: visit.visitorName,
        company: visit.visitorCompany,
        phone: visit.visitorPhone,
        email: visit.visitorEmail,
      },
      hostId: visit.hostId.toString(),
      host: visit.host,
      purpose: visit.purpose,
      location: visit.location,
      status: visit.status,
      checkInTimestamp: visit.checkInAt,
      checkOutTimestamp: visit.checkOutAt,
    };
  }

  async preRegister(dto: PreRegisterVisitDto, hostUserId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: hostUserId },
      include: { host: true },
    });
    if (!user?.hostId) throw new ForbiddenException('Host account required');
    const host = await this.prisma.host.findFirst({
      where: { id: user.hostId, status: 1, deletedAt: null },
    });
    if (!host) throw new ForbiddenException('Invalid host');

    let sessionId = this.qrTokenService.generateSessionId();
    while (await this.prisma.visit.findUnique({ where: { sessionId } })) {
      sessionId = this.qrTokenService.generateSessionId();
    }

    const visit = await this.prisma.visit.create({
      data: {
        sessionId,
        visitorName: dto.visitorName,
        visitorCompany: dto.visitorCompany,
        visitorPhone: dto.visitorPhone,
        visitorEmail: dto.visitorEmail,
        hostId: host.id,
        purpose: dto.purpose,
        location: host.location ?? 'BARWA_TOWERS',
        status: 'PENDING_APPROVAL',
        preRegisteredById: hostUserId.toString(),
        expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : undefined,
      },
      include: { host: true },
    });

    return {
      id: visit.id,
      sessionId: visit.sessionId,
      visitor: {
        name: visit.visitorName,
        company: visit.visitorCompany,
        phone: visit.visitorPhone,
        email: visit.visitorEmail,
      },
      hostId: visit.hostId.toString(),
      purpose: visit.purpose,
      location: visit.location,
      status: visit.status,
      expectedDate: visit.expectedDate,
    };
  }

  async getPending(hostUserId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: hostUserId },
    });
    if (!user?.hostId) return [];
    return this.prisma.visit.findMany({
      where: {
        hostId: user.hostId,
        status: 'PENDING_APPROVAL',
      },
      include: { host: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(visitId: string, hostUserId: number) {
    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId },
      include: { host: true },
    });
    if (!visit) throw new NotFoundException('Visit not found');
    const user = await this.prisma.user.findUnique({
      where: { id: hostUserId },
    });
    if (!user?.hostId || user.hostId !== visit.hostId) {
      throw new ForbiddenException('Not your visit');
    }
    if (visit.status !== 'PENDING_APPROVAL') {
      throw new BadRequestException('Visit is not pending approval');
    }
    await this.prisma.visit.update({
      where: { id: visitId },
      data: { status: 'APPROVED', approvedAt: new Date() },
    });
    if (visit.visitorEmail) {
      this.emailService
        .send({
          to: visit.visitorEmail,
          subject: 'Visit Approved',
          html: `Your visit to ${visit.host.company} has been approved. Session ID: ${visit.sessionId}`,
        })
        .catch(() => {});
    }
    return this.findBySessionId(visit.sessionId);
  }

  async reject(visitId: string, hostUserId: number, reason?: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId },
    });
    if (!visit) throw new NotFoundException('Visit not found');
    const user = await this.prisma.user.findUnique({
      where: { id: hostUserId },
    });
    if (!user?.hostId || user.hostId !== visit.hostId) {
      throw new ForbiddenException('Not your visit');
    }
    if (visit.status !== 'PENDING_APPROVAL') {
      throw new BadRequestException('Visit is not pending approval');
    }
    await this.prisma.visit.update({
      where: { id: visitId },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectionReason: reason ?? undefined,
      },
    });
    return { message: 'Visit rejected' };
  }

  async findBySessionId(sessionId: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { sessionId },
      include: { host: true },
    });
    if (!visit) throw new NotFoundException('Visit not found');
    return {
      id: visit.id,
      sessionId: visit.sessionId,
      visitor: {
        name: visit.visitorName,
        company: visit.visitorCompany,
        phone: visit.visitorPhone,
        email: visit.visitorEmail,
      },
      hostId: visit.hostId.toString(),
      host: visit.host,
      purpose: visit.purpose,
      location: visit.location,
      status: visit.status,
      checkInTimestamp: visit.checkInAt,
      checkOutTimestamp: visit.checkOutAt,
    };
  }

  async checkout(sessionId: string, userId?: number) {
    const visit = await this.prisma.visit.findUnique({
      where: { sessionId },
    });
    if (!visit) throw new NotFoundException('Visit not found');
    if (visit.status === 'CHECKED_OUT') {
      throw new BadRequestException('Visitor already checked out');
    }
    if (visit.status !== 'CHECKED_IN') {
      throw new BadRequestException('Visit must be checked in to check out');
    }
    const now = new Date();
    await this.prisma.visit.update({
      where: { id: visit.id },
      data: { status: 'CHECKED_OUT', checkOutAt: now },
    });
    await this.prisma.checkEvent.create({
      data: {
        visitId: visit.id,
        type: 'CHECK_OUT',
        userId: userId ?? null,
      },
    });
    return this.findBySessionId(sessionId);
  }

  async getActive(location?: string) {
    const where: { status: 'CHECKED_IN'; location?: Location } = { status: 'CHECKED_IN' };
    if (location) {
      where.location = this.normalizeLocation(location);
    }
    const visits = await this.prisma.visit.findMany({
      where,
      include: { host: true },
      orderBy: { checkInAt: 'desc' },
    });
    return visits.map((v) => ({
      id: v.id,
      sessionId: v.sessionId,
      visitorName: v.visitorName,
      visitorCompany: v.visitorCompany,
      host: v.host,
      checkInAt: v.checkInAt,
    }));
  }

  async getHistory(filters?: { location?: string; from?: string; to?: string }) {
    const where: { location?: Location; checkInAt?: { gte?: Date; lte?: Date } } = {};
    if (filters?.location) where.location = this.normalizeLocation(filters.location);
    if (filters?.from || filters?.to) {
      where.checkInAt = {};
      if (filters.from) where.checkInAt.gte = new Date(filters.from);
      if (filters.to) where.checkInAt.lte = new Date(filters.to);
    }
    return this.prisma.visit.findMany({
      where,
      include: { host: true },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }
}
