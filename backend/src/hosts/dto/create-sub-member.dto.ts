import {
  IsString,
  IsOptional,
  IsEmail,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateSubMemberDto {
  @IsString()
  @MinLength(2, { message: "Name must be at least 2 characters" })
  @MaxLength(100)
  name: string;

  @IsEmail({}, { message: "Please provide a valid email address" })
  @MaxLength(100)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(191)
  phone?: string;

  /**
   * Host ID for RECEPTION/ADMIN users to specify which company's team to add the member to.
   * Required when the request comes from RECEPTION or ADMIN role.
   * Ignored for HOST users (uses their own company automatically).
   */
  @IsOptional()
  @IsString()
  hostId?: string;
}
