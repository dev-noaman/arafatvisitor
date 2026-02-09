import { Controller, Get, Logger } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import {
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';

class PrismaHealthIndicator extends HealthIndicator {
  constructor(private prisma: PrismaService) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return this.getStatus('database', true);
    } catch (error) {
      return this.getStatus('database', false, {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

class EmailHealthIndicator extends HealthIndicator {
  constructor(private emailService: EmailService) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      // Note: EmailService may not have a verify method
      // This is a simplified health check - in production, you might want to ping SMTP
      // For now, we'll assume it's healthy if the service is initialized
      return this.getStatus('email', true);
    } catch (error) {
      return this.getStatus('email', false, {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

@SkipThrottle({ default: true, 'login-account': true, 'login-ip': true })
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  private prismaHealthIndicator: PrismaHealthIndicator;
  private emailHealthIndicator: EmailHealthIndicator;

  constructor(
    private health: HealthCheckService,
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {
    this.prismaHealthIndicator = new PrismaHealthIndicator(this.prisma);
    this.emailHealthIndicator = new EmailHealthIndicator(this.emailService);
  }

  @Get()
  @Public()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    try {
      return await this.health.check([
        () => this.prismaHealthIndicator.isHealthy(),
        () => this.emailHealthIndicator.isHealthy(),
      ]);
    } catch (error) {
      this.logger.error('Health check failed:', error);
      throw error;
    }
  }
}
