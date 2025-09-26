import { IsNotEmpty, IsString, IsEnum, IsObject, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { TaxObligationStatus } from '@prisma/client';

export class CreateTaxObligationRequestDto {
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
  @Transform(({ value }) => typeof value === 'string' ? JSON.parse(value) : value)
  due_rule: any; // JSON object

  @IsOptional()
  @IsEnum(TaxObligationStatus)
  status?: TaxObligationStatus;
}
