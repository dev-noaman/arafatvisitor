import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { randomBytes } from "crypto";

@Injectable()
export class QrTokenService {
  constructor(private prisma: PrismaService) {}

  generateSessionId(): string {
    const n = Math.floor(100000 + Math.random() * 900000);
    return `VMS-${n}`;
  }

  generateToken(): string {
    return randomBytes(32).toString("hex");
  }

  async createForVisit(
    visitId: string,
    sessionId: string,
  ): Promise<{ token: string; expiresAt: Date }> {
    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    await this.prisma.qrToken.create({
      data: {
        visitId,
        token,
        expiresAt,
      },
    });
    return { token, expiresAt };
  }

  async findBySessionId(sessionId: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { sessionId },
      include: { host: true, qrToken: true },
    });
    return visit;
  }
}
