import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import {
  TicketType,
  TicketStatus,
  Role,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "../notifications/email.service";
import { WhatsAppService } from "../notifications/whatsapp.service";
import { CreateTicketDto } from "./dto/create-ticket.dto";
import { UpdateTicketDto } from "./dto/update-ticket.dto";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { ReopenTicketDto } from "./dto/reopen-ticket.dto";
import * as path from "path";
import * as fs from "fs";

// Shared select for nested user info
const userSelect = { id: true, name: true, role: true };
const userSelectNoRole = { id: true, name: true };

// Valid status transitions for complaints
const COMPLAINT_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  OPEN: [TicketStatus.IN_PROGRESS, TicketStatus.REJECTED],
  IN_PROGRESS: [TicketStatus.RESOLVED, TicketStatus.REJECTED],
  RESOLVED: [TicketStatus.CLOSED, TicketStatus.OPEN],
  CLOSED: [],
  REJECTED: [],
  // Suggestion statuses (not valid for complaints)
  SUBMITTED: [],
  REVIEWED: [],
  DISMISSED: [],
};

// Valid status transitions for suggestions
const SUGGESTION_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  SUBMITTED: [TicketStatus.REVIEWED, TicketStatus.DISMISSED],
  REVIEWED: [],
  DISMISSED: [],
  // Complaint statuses (not valid for suggestions)
  OPEN: [],
  IN_PROGRESS: [],
  RESOLVED: [],
  CLOSED: [],
  REJECTED: [],
};

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private whatsAppService: WhatsAppService,
  ) {}

  // ========== CREATE ==========
  async create(dto: CreateTicketDto, userId: number) {
    // Auto-fetch hostId from creator's User for visitor-system context (HOST/STAFF users)
    const creator = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { hostId: true },
    });
    const hostId = creator?.hostId ? BigInt(creator.hostId.toString()) : null;

    // Generate ticket number in a transaction
    const ticket = await this.prisma.$transaction(async (tx) => {
      const ticketNumber = await this.generateTicketNumber(
        tx,
        dto.type,
      );

      const initialStatus =
        dto.type === TicketType.SUGGESTION
          ? TicketStatus.SUBMITTED
          : TicketStatus.OPEN;

      return tx.ticket.create({
        data: {
          ticketNumber,
          type: dto.type,
          subject: dto.subject,
          description: dto.description,
          status: initialStatus,
          createdById: userId,
          hostId,
        },
        include: {
          createdBy: { select: userSelect },
          assignedTo: { select: userSelectNoRole },
          host: {
            select: { id: true, name: true, company: true },
          },
          attachments: {
            include: { uploadedBy: { select: userSelectNoRole } },
          },
        },
      });
    });

    // Fire-and-forget: notify admins of new ticket
    this.notifyNewTicket(ticket).catch(() => {});

    return ticket;
  }

  // ========== FIND ALL (LIST) ==========
  async findAll(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      type?: TicketType;
      status?: TicketStatus;
      assignedToId?: number;
      dateFrom?: string;
      dateTo?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    },
    userId: number,
    userRole: Role,
  ) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Non-admin users only see their own tickets
    if (userRole !== Role.ADMIN) {
      where.createdById = userId;
    }

    if (params.type) where.type = params.type;
    if (params.status) where.status = params.status;
    if (params.assignedToId)
      where.assignedToId = params.assignedToId;

    if (params.dateFrom || params.dateTo) {
      where.createdAt = {};
      if (params.dateFrom)
        where.createdAt.gte = new Date(params.dateFrom);
      if (params.dateTo)
        where.createdAt.lte = new Date(params.dateTo);
    }

    if (params.search) {
      where.OR = [
        { subject: { contains: params.search, mode: "insensitive" } },
        {
          ticketNumber: {
            contains: params.search,
            mode: "insensitive",
          },
        },
      ];
    }

    // Build orderBy
    let orderBy: any;
    const sortOrder = params.sortOrder || "desc";

    orderBy = { [params.sortBy || "createdAt"]: sortOrder };

    const [data, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          createdBy: { select: userSelect },
          assignedTo: { select: userSelectNoRole },
          host: { select: { id: true, name: true, company: true } },
          _count: { select: { comments: true, attachments: true } },
        },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ========== FIND ONE (DETAIL) ==========
  async findOne(id: number, userId: number, userRole: Role) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        createdBy: { select: userSelect },
        assignedTo: { select: userSelect },
        host: { select: { id: true, name: true, company: true } },
        comments: {
          include: { user: { select: userSelect } },
          orderBy: { createdAt: "asc" },
        },
        attachments: {
          include: { uploadedBy: { select: userSelectNoRole } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException("Ticket not found");
    }

    // Non-admin can only see own tickets
    if (userRole !== Role.ADMIN && ticket.createdById !== userId) {
      throw new ForbiddenException(
        "You can only view your own tickets",
      );
    }

    // Filter out internal comments for non-admin users
    if (userRole !== Role.ADMIN) {
      ticket.comments = ticket.comments.filter((c) => !c.isInternal);
    }

    return ticket;
  }

  // ========== UPDATE ==========
  async update(id: number, dto: UpdateTicketDto) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        createdBy: { select: { ...userSelect, email: true } },
      },
    });

    if (!ticket) {
      throw new NotFoundException("Ticket not found");
    }

    // Optimistic concurrency check
    if (dto.updatedAt) {
      const clientUpdatedAt = new Date(dto.updatedAt).getTime();
      const dbUpdatedAt = ticket.updatedAt.getTime();
      if (clientUpdatedAt !== dbUpdatedAt) {
        throw new ConflictException(
          "This ticket was modified by another user. Please refresh.",
        );
      }
    }

    const updateData: any = {};

    // Status transition validation
    if (dto.status) {
      const transitions =
        ticket.type === TicketType.SUGGESTION
          ? SUGGESTION_TRANSITIONS
          : COMPLAINT_TRANSITIONS;

      const validNext = transitions[ticket.status] || [];
      if (!validNext.includes(dto.status)) {
        throw new BadRequestException(
          `Cannot transition from ${ticket.status} to ${dto.status}`,
        );
      }

      // Resolution required for RESOLVED
      if (dto.status === TicketStatus.RESOLVED) {
        if (!dto.resolution) {
          throw new BadRequestException(
            "Resolution text is required when setting status to RESOLVED",
          );
        }
        updateData.resolvedAt = new Date();
      }

      // Rejection reason required for REJECTED
      if (dto.status === TicketStatus.REJECTED) {
        if (!dto.rejectionReason) {
          throw new BadRequestException(
            "Rejection reason is required when setting status to REJECTED",
          );
        }
      }

      // Set closedAt for CLOSED
      if (dto.status === TicketStatus.CLOSED) {
        updateData.closedAt = new Date();
      }

      // Prevent assigning/resolving suggestions
      if (ticket.type === TicketType.SUGGESTION) {
        if (dto.assignedToId !== undefined) {
          throw new BadRequestException(
            "Cannot assign suggestions",
          );
        }
      }

      updateData.status = dto.status;
    }

    // Validate assignedToId references ADMIN user
    if (dto.assignedToId !== undefined) {
      if (dto.assignedToId !== null) {
        const assignee = await this.prisma.user.findUnique({
          where: { id: dto.assignedToId },
        });
        if (!assignee || assignee.role !== Role.ADMIN) {
          throw new BadRequestException(
            "Assigned user must be an ADMIN",
          );
        }
        updateData.assignedToId = dto.assignedToId;
      } else {
        updateData.assignedToId = null;
      }
    }

    if (dto.resolution !== undefined)
      updateData.resolution = dto.resolution;
    if (dto.rejectionReason !== undefined)
      updateData.rejectionReason = dto.rejectionReason;

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: { select: userSelect },
        assignedTo: { select: userSelect },
        host: { select: { id: true, name: true, company: true } },
        comments: {
          include: { user: { select: userSelect } },
          orderBy: { createdAt: "asc" },
        },
        attachments: {
          include: { uploadedBy: { select: userSelectNoRole } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    // Fire-and-forget: notify creator of status change
    if (dto.status) {
      this.notifyStatusChange(updated, ticket.status).catch(() => {});
    }
    // Notify assigned admin
    if (dto.assignedToId && dto.assignedToId !== ticket.assignedToId) {
      this.notifyAssignment(updated).catch(() => {});
    }

    return updated;
  }

  // ========== ADD COMMENT ==========
  async addComment(
    ticketId: number,
    dto: CreateCommentDto,
    userId: number,
    userRole: Role,
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException("Ticket not found");
    }

    // Non-admin can only comment on own tickets
    if (userRole !== Role.ADMIN && ticket.createdById !== userId) {
      throw new ForbiddenException(
        "You can only comment on your own tickets",
      );
    }

    // Only ADMIN can set isInternal
    const isInternal =
      userRole === Role.ADMIN ? (dto.isInternal ?? false) : false;

    const comment = await this.prisma.ticketComment.create({
      data: {
        ticketId,
        userId,
        message: dto.message,
        isInternal,
      },
      include: {
        user: { select: userSelect },
      },
    });

    // Fire-and-forget: notify creator of new public reply
    if (!isInternal && userId !== ticket.createdById) {
      this.notifyNewComment(ticket, comment).catch(() => {});
    }

    return comment;
  }

  // ========== ADD ATTACHMENT ==========
  async addAttachment(
    ticketId: number,
    file: Express.Multer.File,
    userId: number,
    userRole: Role,
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { _count: { select: { attachments: true } } },
    });

    if (!ticket) {
      throw new NotFoundException("Ticket not found");
    }

    // Only ADMIN or creator can attach
    if (userRole !== Role.ADMIN && ticket.createdById !== userId) {
      throw new ForbiddenException(
        "Only the ticket creator or admin can add attachments",
      );
    }

    // Max 3 attachments
    if (ticket._count.attachments >= 3) {
      throw new BadRequestException(
        "Maximum 3 attachments per ticket",
      );
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException("File size must not exceed 5MB");
    }

    // Validate MIME type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        "Only JPEG, PNG, and PDF files are allowed",
      );
    }

    // Save file to disk
    const uploadDir = path.join(
      process.cwd(),
      "uploads",
      "tickets",
      String(ticketId),
    );
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadDir, uniqueName);

    // Atomic: write file, then create DB record. If DB fails, clean up file.
    try {
      fs.writeFileSync(filePath, file.buffer);

      const attachment = await this.prisma.ticketAttachment.create({
        data: {
          ticketId,
          fileName: file.originalname,
          filePath: `uploads/tickets/${ticketId}/${uniqueName}`,
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedById: userId,
        },
        include: {
          uploadedBy: { select: userSelectNoRole },
        },
      });

      return attachment;
    } catch (error) {
      // Clean up orphaned file if DB insert fails
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw error;
    }
  }

  // ========== DOWNLOAD ATTACHMENT ==========
  async downloadAttachment(
    ticketId: number,
    attachId: number,
    userId: number,
    userRole: Role,
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException("Ticket not found");
    }

    // Non-admin can only download from own ticket
    if (userRole !== Role.ADMIN && ticket.createdById !== userId) {
      throw new ForbiddenException(
        "You can only download attachments from your own tickets",
      );
    }

    const attachment = await this.prisma.ticketAttachment.findFirst({
      where: { id: attachId, ticketId },
    });

    if (!attachment) {
      throw new NotFoundException("Attachment not found");
    }

    const filePath = path.join(process.cwd(), attachment.filePath);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException("Attachment file not found on disk");
    }

    return {
      filePath,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
    };
  }

  // ========== REOPEN ==========
  async reopen(
    id: number,
    dto: ReopenTicketDto,
    userId: number,
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { ...userSelect, email: true } },
      },
    });

    if (!ticket) {
      throw new NotFoundException("Ticket not found");
    }

    if (ticket.type !== TicketType.COMPLAINT) {
      throw new BadRequestException("Only complaints can be reopened");
    }

    if (ticket.status !== TicketStatus.RESOLVED) {
      throw new BadRequestException(
        "Only resolved complaints can be reopened",
      );
    }

    if (ticket.createdById !== userId) {
      throw new ForbiddenException(
        "Only the ticket creator can reopen",
      );
    }

    // Reopen: set status to OPEN, preserve assignee, add comment
    const [updated] = await this.prisma.$transaction([
      this.prisma.ticket.update({
        where: { id },
        data: {
          status: TicketStatus.OPEN,
          resolvedAt: null,
        },
        include: {
          createdBy: { select: userSelect },
          assignedTo: { select: userSelect },
          host: { select: { id: true, name: true, company: true } },
          comments: {
            include: { user: { select: userSelect } },
            orderBy: { createdAt: "asc" },
          },
          attachments: {
            include: {
              uploadedBy: { select: userSelectNoRole },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      }),
      this.prisma.ticketComment.create({
        data: {
          ticketId: id,
          userId,
          message: dto.comment,
          isInternal: false,
        },
      }),
    ]);

    // Fire-and-forget: notify assigned admin of reopen
    if (ticket.assignedTo) {
      this.emailService
        .send({
          to: (ticket.assignedTo as any).email,
          subject: `Ticket ${ticket.ticketNumber} Reopened`,
          html: `<p>Ticket <strong>${ticket.ticketNumber}</strong> has been reopened by the creator.</p><p>Comment: ${dto.comment}</p>`,
        })
        .catch(() => {});
    }

    // Refetch to include the new comment
    return this.findOne(id, userId, Role.ADMIN);
  }

  // ========== BADGE COUNT ==========
  async getBadgeCount(userId: number, userRole: Role) {
    const terminalStatuses = [
      TicketStatus.CLOSED,
      TicketStatus.REJECTED,
      TicketStatus.REVIEWED,
      TicketStatus.DISMISSED,
    ];

    const where: any = {
      status: { notIn: terminalStatuses },
    };

    // Non-admin users only see their own tickets
    if (userRole !== Role.ADMIN) {
      where.createdById = userId;
    }

    const count = await this.prisma.ticket.count({ where });
    return { count };
  }

  // ========== STATS ==========
  async getStats() {
    const now = new Date();
    const weekAgo = new Date(
      now.getTime() - 7 * 24 * 60 * 60 * 1000,
    );

    const [
      openComplaints,
      inProgressComplaints,
      unassignedComplaints,
      pendingSuggestions,
      resolvedThisWeek,
      avgResolution,
    ] = await Promise.all([
      this.prisma.ticket.count({
        where: {
          type: TicketType.COMPLAINT,
          status: TicketStatus.OPEN,
        },
      }),
      this.prisma.ticket.count({
        where: {
          type: TicketType.COMPLAINT,
          status: TicketStatus.IN_PROGRESS,
        },
      }),
      this.prisma.ticket.count({
        where: {
          type: TicketType.COMPLAINT,
          assignedToId: null,
          status: {
            in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS],
          },
        },
      }),
      this.prisma.ticket.count({
        where: {
          type: TicketType.SUGGESTION,
          status: TicketStatus.SUBMITTED,
        },
      }),
      this.prisma.ticket.count({
        where: {
          resolvedAt: { gte: weekAgo },
        },
      }),
      this.prisma.ticket.aggregate({
        where: {
          resolvedAt: { not: null },
        },
        _avg: {
          id: true, // placeholder — we'll compute manually
        },
      }),
    ]);

    // Compute average resolution hours manually
    const resolvedTickets = await this.prisma.ticket.findMany({
      where: { resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true },
      take: 1000,
    });

    let averageResolutionHours = 0;
    if (resolvedTickets.length > 0) {
      const totalHours = resolvedTickets.reduce((sum, t) => {
        const diff =
          t.resolvedAt!.getTime() - t.createdAt.getTime();
        return sum + diff / (1000 * 60 * 60);
      }, 0);
      averageResolutionHours = Math.round(
        (totalHours / resolvedTickets.length) * 10,
      ) / 10;
    }

    return {
      openComplaints,
      inProgressComplaints,
      unassignedComplaints,
      pendingSuggestions,
      resolvedThisWeek,
      averageResolutionHours,
    };
  }

  // ========== AUTO-CLOSE CRON ==========
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async autoCloseResolved() {
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000,
    );

    const result = await this.prisma.ticket.updateMany({
      where: {
        type: TicketType.COMPLAINT,
        status: TicketStatus.RESOLVED,
        resolvedAt: { lte: sevenDaysAgo },
      },
      data: {
        status: TicketStatus.CLOSED,
        closedAt: new Date(),
      },
    });

    if (result.count > 0) {
      this.logger.log(
        `Auto-closed ${result.count} resolved complaint(s)`,
      );
    }
  }

  // ========== PRIVATE HELPERS ==========

  private async generateTicketNumber(
    tx: any,
    type: TicketType,
  ): Promise<string> {
    const prefix =
      type === TicketType.SUGGESTION ? "SGT" : "CMP";

    const lastTicket = await tx.ticket.findFirst({
      where: {
        ticketNumber: { startsWith: prefix },
      },
      orderBy: { ticketNumber: "desc" },
      select: { ticketNumber: true },
    });

    let nextNum = 1;
    if (lastTicket) {
      const numPart = lastTicket.ticketNumber.replace(
        `${prefix}-`,
        "",
      );
      nextNum = parseInt(numPart, 10) + 1;
    }

    const padLength = nextNum > 9999 ? String(nextNum).length : 4;
    return `${prefix}-${String(nextNum).padStart(padLength, "0")}`;
  }

  private async getAdminEmails(): Promise<string[]> {
    const admins = await this.prisma.user.findMany({
      where: { role: Role.ADMIN, status: "ACTIVE" },
      select: { email: true },
    });
    return admins.map((a) => a.email);
  }

  /** Modern HTML email wrapper — card style, works in Gmail/Outlook */
  private emailCard(
    title: string,
    badgeColor: string,
    badgeBg: string,
    content: string,
  ): string {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#f1f5f9;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07)">
    <div style="background:linear-gradient(135deg,#1e40af 0%,#3b82f6 100%);padding:24px;text-align:center">
      <span style="display:inline-block;background:${badgeBg};color:${badgeColor};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;padding:6px 12px;border-radius:6px">${title}</span>
    </div>
    <div style="padding:24px 28px;color:#334155;line-height:1.6">
      ${content}
    </div>
    <div style="padding:16px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b">
      Arafat Visitor Management System
    </div>
  </div>
</body>
</html>`;
  }

  private async notifyNewTicket(ticket: any) {
    const adminEmails = await this.getAdminEmails();
    const typeLabel =
      ticket.type === TicketType.SUGGESTION
        ? "Suggestion"
        : "Complaint";
    const badgeColor =
      ticket.type === TicketType.SUGGESTION ? "#6d28d9" : "#c2410c";
    const badgeBg =
      ticket.type === TicketType.SUGGESTION ? "#ede9fe" : "#ffedd5";

    const content = `
      <p style="margin:0 0 20px;font-size:16px;color:#1e293b">
        A new <strong>${typeLabel}</strong> has been submitted and needs your attention.
      </p>
      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:0 0 16px;border:1px solid #e2e8f0">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 0;font-size:12px;color:#64748b;width:90px">Ticket</td><td style="padding:6px 0;font-weight:600;color:#1e293b">${ticket.ticketNumber}</td></tr>
          <tr><td style="padding:6px 0;font-size:12px;color:#64748b">Subject</td><td style="padding:6px 0;color:#1e293b">${this.escapeHtml(ticket.subject)}</td></tr>
          <tr><td style="padding:6px 0;font-size:12px;color:#64748b">Submitted by</td><td style="padding:6px 0;color:#1e293b">${this.escapeHtml(ticket.createdBy?.name || "Unknown")}</td></tr>
        </table>
      </div>
      <p style="margin:0;font-size:14px;color:#64748b">
        Log in to the admin panel to view and respond.
      </p>`;

    const html = this.emailCard(
      `New ${typeLabel}`,
      badgeColor,
      badgeBg,
      content,
    );

    for (const email of adminEmails) {
      this.emailService
        .send({
          to: email,
          subject: `New ${typeLabel}: ${ticket.ticketNumber} — ${ticket.subject}`,
          html,
        })
        .catch(() => {});
    }
  }

  private escapeHtml(text: string): string {
    if (!text) return "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  private async notifyStatusChange(
    ticket: any,
    previousStatus: TicketStatus,
  ) {
    const creator = await this.prisma.user.findUnique({
      where: { id: ticket.createdById },
      select: { email: true, name: true },
    });
    if (!creator) return;

    const subject = `Ticket ${ticket.ticketNumber} — Status updated to ${ticket.status}`;
    let content = `
      <p style="margin:0 0 20px;font-size:16px;color:#1e293b">
        Your ticket status has been updated.
      </p>
      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:0 0 16px;border:1px solid #e2e8f0">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 0;font-size:12px;color:#64748b;width:90px">Ticket</td><td style="padding:6px 0;font-weight:600">${ticket.ticketNumber}</td></tr>
          <tr><td style="padding:6px 0;font-size:12px;color:#64748b">Previous</td><td style="padding:6px 0;color:#64748b">${previousStatus}</td></tr>
          <tr><td style="padding:6px 0;font-size:12px;color:#64748b">New status</td><td style="padding:6px 0;font-weight:600;color:#059669">${ticket.status}</td></tr>
        </table>
      </div>`;

    if (
      ticket.status === TicketStatus.RESOLVED &&
      ticket.resolution
    ) {
      content += `
      <div style="background:#ecfdf5;border-radius:8px;padding:16px;border:1px solid #a7f3d0;margin:0 0 16px">
        <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#047857">Resolution</p>
        <p style="margin:0;font-size:14px;color:#065f46;white-space:pre-wrap">${this.escapeHtml(ticket.resolution)}</p>
      </div>`;
    }

    const html = this.emailCard(
      "Status Updated",
      "#059669",
      "#d1fae5",
      content,
    );

    this.emailService.send({ to: creator.email, subject, html }).catch(() => {});
  }

  private async notifyAssignment(ticket: any) {
    if (!ticket.assignedTo) return;
    const assignee = await this.prisma.user.findUnique({
      where: { id: ticket.assignedToId },
      select: { email: true },
    });
    if (!assignee) return;

    const content = `
      <p style="margin:0 0 20px;font-size:16px;color:#1e293b">
        A ticket has been assigned to you.
      </p>
      <div style="background:#f8fafc;border-radius:8px;padding:16px;border:1px solid #e2e8f0">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 0;font-size:12px;color:#64748b;width:90px">Ticket</td><td style="padding:6px 0;font-weight:600">${ticket.ticketNumber}</td></tr>
          <tr><td style="padding:6px 0;font-size:12px;color:#64748b">Subject</td><td style="padding:6px 0;color:#1e293b">${this.escapeHtml(ticket.subject)}</td></tr>
        </table>
      </div>
      <p style="margin:0;font-size:14px;color:#64748b">
        Log in to the admin panel to view and respond.
      </p>`;

    const html = this.emailCard(
      "Assigned to You",
      "#4f46e5",
      "#e0e7ff",
      content,
    );

    this.emailService
      .send({
        to: assignee.email,
        subject: `Ticket ${ticket.ticketNumber} assigned to you`,
        html,
      })
      .catch(() => {});
  }

  private async notifyNewComment(ticket: any, comment: any) {
    const creator = await this.prisma.user.findUnique({
      where: { id: ticket.createdById },
      select: { email: true },
    });
    if (!creator) return;

    const content = `
      <p style="margin:0 0 20px;font-size:16px;color:#1e293b">
        A new reply has been added to your ticket.
      </p>
      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:0 0 16px;border:1px solid #e2e8f0">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 0;font-size:12px;color:#64748b;width:90px">Ticket</td><td style="padding:6px 0;font-weight:600">${ticket.ticketNumber}</td></tr>
        </table>
      </div>
      <div style="background:#f1f5f9;border-radius:8px;padding:16px;border-left:4px solid #3b82f6">
        <p style="margin:0;font-size:14px;color:#334155;white-space:pre-wrap">${this.escapeHtml(comment.message)}</p>
      </div>
      <p style="margin:16px 0 0;font-size:14px;color:#64748b">
        Log in to the admin panel to view the full conversation.
      </p>`;

    const html = this.emailCard(
      "New Reply",
      "#2563eb",
      "#dbeafe",
      content,
    );

    this.emailService
      .send({
        to: creator.email,
        subject: `New reply on ticket ${ticket.ticketNumber}`,
        html,
      })
      .catch(() => {});
  }
}
