import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { VisitsService } from "./visits.service";
import { CreateVisitDto } from "./dto/create-visit.dto";
import { PreRegisterVisitDto } from "./dto/pre-register.dto";
import { RejectVisitDto } from "./dto/reject-visit.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { Public } from "../common/decorators/public.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Role } from "@prisma/client";

@Controller("visits")
@UseGuards(JwtAuthGuard)
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.RECEPTION)
  create(@Body() dto: CreateVisitDto, @CurrentUser("sub") userId?: number) {
    return this.visitsService.create(dto, userId);
  }

  @Post("pre-register")
  @UseGuards(RolesGuard)
  @Roles(Role.HOST)
  preRegister(
    @Body() dto: PreRegisterVisitDto,
    @CurrentUser("sub") userId: number,
  ) {
    return this.visitsService.preRegister(dto, userId);
  }

  @Get("pending")
  @UseGuards(RolesGuard)
  @Roles(Role.HOST)
  getPending(@CurrentUser("sub") userId: number) {
    return this.visitsService.getPending(userId);
  }

  @Post(":id/approve")
  @UseGuards(RolesGuard)
  @Roles(Role.HOST)
  approve(@Param("id") id: string, @CurrentUser("sub") userId: number) {
    return this.visitsService.approve(id, userId);
  }

  @Post(":id/reject")
  @UseGuards(RolesGuard)
  @Roles(Role.HOST)
  reject(
    @Param("id") id: string,
    @CurrentUser("sub") userId: number,
    @Body() dto: RejectVisitDto,
  ) {
    return this.visitsService.reject(id, userId, dto.reason);
  }

  @Get("active")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.RECEPTION)
  getActive(@Query("location") location?: string) {
    return this.visitsService.getActive(location);
  }

  @Get("history")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getHistory(
    @Query("location") location?: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    return this.visitsService.getHistory({ location, from, to });
  }

  @Get("pass/:sessionId")
  @Public()
  getPass(@Param("sessionId") sessionId: string) {
    return this.visitsService.findBySessionId(sessionId);
  }

  @Get(":sessionId")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.RECEPTION)
  findBySessionId(@Param("sessionId") sessionId: string) {
    return this.visitsService.findBySessionId(sessionId);
  }

  @Post(":sessionId/checkin")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.RECEPTION)
  checkin(
    @Param("sessionId") sessionId: string,
    @CurrentUser("sub") userId?: number,
  ) {
    return this.visitsService.checkin(sessionId, userId);
  }

  @Post(":sessionId/checkout")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.RECEPTION)
  checkout(
    @Param("sessionId") sessionId: string,
    @CurrentUser("sub") userId?: number,
  ) {
    return this.visitsService.checkout(sessionId, userId);
  }
}
