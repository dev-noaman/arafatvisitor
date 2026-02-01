import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(params: {
    userId?: number;
    action: string;
    entity: string;
    entityId?: string;
    oldValue?: object;
    newValue?: object;
    ip?: string;
    userAgent?: string;
  }) {
    await this.prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        oldValue: params.oldValue as object | undefined,
        newValue: params.newValue as object | undefined,
        ip: params.ip,
        userAgent: params.userAgent,
      },
    });
  }
}
