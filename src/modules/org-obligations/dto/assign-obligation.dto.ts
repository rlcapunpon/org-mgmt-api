import { IsNotEmpty, IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { OrganizationTaxObligationStatus } from '@prisma/client';

export class AssignObligationRequestDto {
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

export class UpdateObligationStatusRequestDto {
  @IsNotEmpty()
  @IsEnum(OrganizationTaxObligationStatus)
  status: OrganizationTaxObligationStatus;
}
