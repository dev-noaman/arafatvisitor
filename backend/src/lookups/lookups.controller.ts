import { Controller, Get } from "@nestjs/common";
import { Public } from "../common/decorators/public.decorator";
import { PrismaService } from "../prisma/prisma.service";

@Controller("lookups")
export class LookupsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("purposes")
  @Public()
  async getPurposes() {
    return this.prisma.lookupPurpose.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  @Get("delivery-types")
  @Public()
  async getDeliveryTypes() {
    return this.prisma.lookupDeliveryType.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
  }
}
