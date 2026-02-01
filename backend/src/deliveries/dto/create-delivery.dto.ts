import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateDeliveryDto {
  @IsString()
  @MinLength(1)
  recipient: string;

  @IsString()
  @MinLength(1)
  courier: string;

  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  hostId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
