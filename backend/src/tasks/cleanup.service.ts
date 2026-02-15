import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Scheduled task to clean up expired QR tokens
   * Runs daily at 2:00 AM
   * Deletes tokens that expired more than 30 days ago
   */
  @Cron("0 2 * * *") // 2:00 AM every day
  async cleanupExpiredQrTokens() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await this.prisma.qrToken.deleteMany({
        where: {
          expiresAt: {
            lt: thirtyDaysAgo,
          },
        },
      });

      this.logger.log(
        `Cleanup job completed: Deleted ${result.count} expired QR tokens`,
      );
    } catch (error) {
      this.logger.error("QR token cleanup failed:", error);
    }
  }

  /**
   * Scheduled task to clean up expired refresh tokens
   * Runs daily at 2:15 AM
   * Deletes tokens that have been revoked or expired for more than 7 days
   */
  @Cron("15 2 * * *") // 2:15 AM every day
  async cleanupExpiredRefreshTokens() {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const result = await this.prisma.refreshToken.deleteMany({
        where: {
          OR: [
            {
              // Delete revoked tokens older than 7 days
              revokedAt: {
                lt: sevenDaysAgo,
              },
            },
            {
              // Delete expired tokens
              expiresAt: {
                lt: new Date(),
              },
            },
          ],
        },
      });

      this.logger.log(
        `Cleanup job completed: Deleted ${result.count} expired/revoked refresh tokens`,
      );
    } catch (error) {
      this.logger.error("Refresh token cleanup failed:", error);
    }
  }
}
