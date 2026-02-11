import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CleanupService } from './cleanup.service';
import { OfficeRndSyncService } from './officernd-sync.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret:
          config.get<string>('JWT_SECRET') || 'fallback-secret-min-32-chars',
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN') || '24h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [CleanupService, OfficeRndSyncService],
  exports: [CleanupService, OfficeRndSyncService],
})
export class TasksModule {}
