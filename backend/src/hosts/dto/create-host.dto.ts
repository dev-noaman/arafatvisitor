import { IsString, IsOptional, IsInt, Min, Max, MaxLength } from 'class-validator';

export class CreateHostDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(100)
  company: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;

  @IsString()
  @MaxLength(191)
  phone: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  status?: number;

  @IsOptional()
  @IsString()
  externalId?: string;
}
