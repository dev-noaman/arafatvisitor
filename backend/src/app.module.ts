import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";

// Login rate limits: configurable via env to avoid blocking legitimate users
// Defaults: 15 attempts per account per 15min, 60 per IP per 15min
const LOGIN_ACCOUNT_LIMIT = parseInt(process.env.THROTTLE_LOGIN_ACCOUNT_LIMIT || "15", 10);
const LOGIN_IP_LIMIT = parseInt(process.env.THROTTLE_LOGIN_IP_LIMIT || "60", 10);
import { CacheModule } from "@nestjs/cache-manager";
import { TerminusModule } from "@nestjs/terminus";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { HostsModule } from "./hosts/hosts.module";
import { VisitsModule } from "./visits/visits.module";
import { DeliveriesModule } from "./deliveries/deliveries.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { ReportsModule } from "./reports/reports.module";
import { AuditModule } from "./audit/audit.module";
import { AdminModule } from "./admin/admin.module";
import { LookupsModule } from "./lookups/lookups.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { HealthModule } from "./health/health.module";
import { TasksModule } from "./tasks/tasks.module";
import { TicketsModule } from "./tickets/tickets.module";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: "default",
        ttl: 60000,
        limit: 60,
      },
      {
        name: "login-account",
        ttl: 15 * 60 * 1000, // 15 minutes
        limit: LOGIN_ACCOUNT_LIMIT,
      },
      {
        name: "login-ip",
        ttl: 15 * 60 * 1000, // 15 minutes
        limit: LOGIN_IP_LIMIT,
      },
    ]),
    CacheModule.register({ isGlobal: true }),
    TerminusModule,
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    HostsModule,
    VisitsModule,
    DeliveriesModule,
    NotificationsModule,
    ReportsModule,
    AuditModule,
    AdminModule,
    LookupsModule,
    DashboardModule,
    HealthModule,
    TasksModule,
    TicketsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
