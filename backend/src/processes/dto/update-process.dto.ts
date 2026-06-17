import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ProcessStatus } from '@prisma/client';

export class UpdateProcessDto {
  @IsOptional()
  @IsEnum(ProcessStatus)
  status?: ProcessStatus;

  @IsOptional()
  @IsDateString()
  deadline?: string;
}
