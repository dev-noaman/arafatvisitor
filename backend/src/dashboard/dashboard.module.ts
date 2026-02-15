import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DashboardGateway } from "./dashboard.gateway";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret:
          config.get<string>("JWT_SECRET") || "fallback-secret-min-32-chars",
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [DashboardGateway],
  exports: [DashboardGateway],
})
export class DashboardModule {}
