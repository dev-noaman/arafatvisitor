import { IsString, IsOptional, IsEmail, MinLength, IsDateString } from 'class-validator';

export class PreRegisterVisitDto {
  @IsString()
  @MinLength(2)
  visitorName: string;

  @IsString()
  @MinLength(2)
  visitorCompany: string;

  @IsString()
  @MinLength(6)
  visitorPhone: string;

  @IsOptional()
  @IsEmail()
  visitorEmail?: string;

  @IsString()
  purpose: string;

  @IsOptional()
  @IsDateString()
  expectedDate?: string;
}
