import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  IsDateString,
} from "class-validator";
import { TicketStatus } from "@prisma/client";

export class UpdateTicketDto {
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsInt()
  assignedToId?: number;

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
