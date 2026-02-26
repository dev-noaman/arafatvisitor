import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  IsDateString,
} from "class-validator";
import { TicketStatus, TicketPriority } from "@prisma/client";

export class UpdateTicketDto {
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsInt()
  assignedToId?: number;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsString()
  resolution?: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsDateString()
  updatedAt?: string;
}
