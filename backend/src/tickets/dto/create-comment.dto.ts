import { IsString, IsOptional, IsBoolean, MinLength } from "class-validator";

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  message: string;

  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;
}
