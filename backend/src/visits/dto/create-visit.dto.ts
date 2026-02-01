import { IsString, IsOptional, IsEmail, MinLength, MaxLength } from 'class-validator';

export class CreateVisitDto {
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
  hostId: string;

  @IsString()
  purpose: string;

  @IsString()
  location: string;
}
