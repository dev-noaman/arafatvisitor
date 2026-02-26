import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  MinLength,
  MaxLength,
} from "class-validator";
import { TicketType, TicketPriority, TicketCategory } from "@prisma/client";

export class CreateTicketDto {
  @IsEnum(TicketType)
  type: TicketType;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  subject: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsOptional()
  @IsEnum(TicketCategory)
  category?: TicketCategory;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsString()
  relatedVisitId?: string;

  @IsOptional()
  @IsString()
  relatedDeliveryId?: string;
}
