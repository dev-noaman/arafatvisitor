import { Module } from '@nestjs/common';
import { AdminApiController } from './admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [AdminApiController],
})
export class AdminModule {}
