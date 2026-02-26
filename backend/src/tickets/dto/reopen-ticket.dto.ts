import { IsString, MinLength } from "class-validator";

export class ReopenTicketDto {
  @IsString()
  @MinLength(1)
  comment: string;
}
