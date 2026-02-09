import { Controller, Get, UseInterceptors } from "@nestjs/common";
import { CacheInterceptor, CacheKey, CacheTTL } from "@nestjs/cache-manager";
import { SkipThrottle } from "@nestjs/throttler";
import { Public } from "../common/decorators/public.decorator";
import { PrismaService } from "../prisma/prisma.service";

@SkipThrottle({ default: true, 'login-account': true, 'login-ip': true })
@Controller("lookups")
export class LookupsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("purposes")
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheKey("lookups:purposes")
  @CacheTTL(3600) // Cache for 1 hour
  async getPurposes() {
    return this.prisma.lookupPurpose.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  @Get("delivery-types")
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheKey("lookups:delivery-types")
  @CacheTTL(3600) // Cache for 1 hour
  async getDeliveryTypes() {
    return this.prisma.lookupDeliveryType.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  @Get("couriers")
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheKey("lookups:couriers")
  @CacheTTL(3600) // Cache for 1 hour
  async getCouriers() {
    return this.prisma.lookupCourier.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  @Get("locations")
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheKey("lookups:locations")
  @CacheTTL(3600) // Cache for 1 hour
  async getLocations() {
    return this.prisma.lookupLocation.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
  }
}
