import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AdminApiController } from "./admin.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { DashboardModule } from "../dashboard/dashboard.module";

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    DashboardModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret:
          config.get<string>("JWT_SECRET") || "fallback-secret-min-32-chars",
        signOptions: {
          expiresIn: config.get<string>("JWT_EXPIRES_IN") || "24h",
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AdminApiController],
})
export class AdminModule {}
