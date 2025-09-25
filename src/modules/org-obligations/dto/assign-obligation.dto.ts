import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class AssignObligationDto {
  @IsNotEmpty()
  @IsString()
  obligation_id: string;

  @IsNotEmpty()
  @IsDateString()
  start_date: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateObligationStatusDto {
  @IsNotEmpty()
  @IsString()
  status: 'ACTIVE' | 'INACTIVE' | 'EXEMPT';
}
