import { IsString, MinLength, IsOptional, IsDateString } from 'class-validator';

export class CreateProcessDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;
}
