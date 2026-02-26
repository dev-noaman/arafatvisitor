import {
  IsString,
  IsEnum,
  MinLength,
  MaxLength,
} from "class-validator";
import { TicketType } from "@prisma/client";

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
}
