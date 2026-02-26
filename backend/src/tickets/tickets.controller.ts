import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Req,
  Res,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { SkipThrottle } from "@nestjs/throttler";
import { Roles } from "../common/decorators/roles.decorator";
import { Role, TicketType, TicketStatus, TicketPriority } from "@prisma/client";
import { AuditInterceptor } from "../audit/audit.interceptor";
import { TicketsService } from "./tickets.service";
import { CreateTicketDto } from "./dto/create-ticket.dto";
import { UpdateTicketDto } from "./dto/update-ticket.dto";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { ReopenTicketDto } from "./dto/reopen-ticket.dto";
import { Response } from "express";
import * as fs from "fs";

@Controller("admin/api/tickets")
@SkipThrottle({
  default: true,
  "login-account": true,
  "login-ip": true,
})
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
  @UseInterceptors(AuditInterceptor)
  async create(@Body() dto: CreateTicketDto, @Req() req: any) {
    return this.ticketsService.create(dto, req.user.sub);
  }

  // Stats must be before :id to avoid route conflict
  @Get("stats")
  @Roles(Role.ADMIN)
  async getStats() {
    return this.ticketsService.getStats();
  }

  @Get("badge-count")
  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
  async getBadgeCount(@Req() req: any) {
    return this.ticketsService.getBadgeCount(
      req.user.sub,
      req.user.role,
    );
  }

  @Get()
  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
  async findAll(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("search") search?: string,
    @Query("type") type?: TicketType,
    @Query("status") status?: TicketStatus,
    @Query("priority") priority?: TicketPriority,
    @Query("category") category?: string,
    @Query("assignedToId") assignedToId?: string,
    @Query("dateFrom") dateFrom?: string,
    @Query("dateTo") dateTo?: string,
    @Query("sortBy") sortBy?: string,
    @Query("sortOrder") sortOrder?: "asc" | "desc",
    @Req() req?: any,
  ) {
    return this.ticketsService.findAll(
      {
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        search,
        type,
        status,
        priority,
        category,
        assignedToId: assignedToId
          ? parseInt(assignedToId)
          : undefined,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder,
      },
      req.user.sub,
      req.user.role,
    );
  }

  @Get(":id")
  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
  async findOne(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.ticketsService.findOne(id, req.user.sub, req.user.role);
  }

  @Patch(":id")
  @Roles(Role.ADMIN)
  @UseInterceptors(AuditInterceptor)
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateTicketDto,
  ) {
    return this.ticketsService.update(id, dto);
  }

  @Post(":id/comments")
  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
  @UseInterceptors(AuditInterceptor)
  async addComment(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: CreateCommentDto,
    @Req() req: any,
  ) {
    return this.ticketsService.addComment(
      id,
      dto,
      req.user.sub,
      req.user.role,
    );
  }

  @Post(":id/attachments")
  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
  @UseInterceptors(AuditInterceptor)
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async addAttachment(
    @Param("id", ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new Error("No file uploaded");
    }
    return this.ticketsService.addAttachment(
      id,
      file,
      req.user.sub,
      req.user.role,
    );
  }

  @Get(":id/attachments/:attachId")
  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
  async downloadAttachment(
    @Param("id", ParseIntPipe) id: number,
    @Param("attachId", ParseIntPipe) attachId: number,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const { filePath, fileName, mimeType } =
      await this.ticketsService.downloadAttachment(
        id,
        attachId,
        req.user.sub,
        req.user.role,
      );

    res.setHeader("Content-Type", mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`,
    );

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  }

  @Post(":id/reopen")
  @Roles(Role.ADMIN, Role.RECEPTION, Role.HOST, Role.STAFF)
  @UseInterceptors(AuditInterceptor)
  async reopen(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: ReopenTicketDto,
    @Req() req: any,
  ) {
    return this.ticketsService.reopen(id, dto, req.user.sub);
  }
}
