import { IsNotEmpty, IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { OrganizationTaxObligationStatus } from '@prisma/client';

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
  @IsEnum(OrganizationTaxObligationStatus)
  status: OrganizationTaxObligationStatus;
}
