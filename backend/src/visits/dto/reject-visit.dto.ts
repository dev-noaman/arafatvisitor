import { IsString, IsOptional } from 'class-validator';

export class RejectVisitDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
