import { IsNotEmpty, IsString, IsEnum, IsObject, IsOptional } from 'class-validator';
import { TaxObligationStatus } from '@prisma/client';

export class CreateTaxObligationDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(['MONTHLY', 'QUARTERLY', 'ANNUAL', 'ONE_TIME'])
  frequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'ONE_TIME';

  @IsNotEmpty()
  @IsObject()
  due_rule: any; // JSON object

  @IsOptional()
  @IsEnum(TaxObligationStatus)
  status?: TaxObligationStatus;
}
