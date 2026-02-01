import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('deliveries')
@UseGuards(JwtAuthGuard)
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.RECEPTION)
  findAll(@Query('location') location: string, @Query('search') search?: string) {
    if (!location) {
      return this.deliveriesService.findAll('Barwa Towers', search);
    }
    return this.deliveriesService.findAll(location, search);
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(Role.HOST)
  findMy(@CurrentUser('sub') userId: number) {
    return this.deliveriesService.findMy(userId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.RECEPTION)
  create(
    @Body() dto: CreateDeliveryDto,
    @Query('location') location: string,
    @CurrentUser('sub') userId?: number,
  ) {
    const loc = location || 'Barwa Towers';
    return this.deliveriesService.create(dto, loc, userId);
  }

  @Patch(':id/receive')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.RECEPTION)
  receive(@Param('id') id: string, @CurrentUser('sub') userId?: number) {
    return this.deliveriesService.receive(id, userId);
  }
}
