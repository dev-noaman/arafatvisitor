import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('visits')
  getVisits(
    @Query('location') location?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reportsService.getVisitsReport(location, from, to);
  }

  @Get('deliveries')
  getDeliveries(
    @Query('location') location?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reportsService.getDeliveriesReport(location, from, to);
  }

  @Get('hosts')
  getHosts(@Query('location') location?: string) {
    return this.reportsService.getHostsReport(location);
  }
}
