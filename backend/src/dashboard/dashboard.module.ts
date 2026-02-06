import { Module } from '@nestjs/common';
import { DashboardGateway } from './dashboard.gateway';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DashboardGateway],
  exports: [DashboardGateway],
})
export class DashboardModule {}
