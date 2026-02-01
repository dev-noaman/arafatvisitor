import { IsString, IsOptional, IsInt, Min, Max, MaxLength } from 'class-validator';

export class UpdateHostDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  company?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(191)
  phone?: string;

  @IsOptional()
  @IsString()
  location?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  status?: number;
}
