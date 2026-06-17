import { IsDateString, IsString } from 'class-validator';

export class SetScaleDto {
  @IsDateString()
  date: string; // YYYY-MM-DD

  @IsString()
  defenderId: string;

  @IsString()
  codename: string;
}
