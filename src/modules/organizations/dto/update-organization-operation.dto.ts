import { IsOptional, IsDateString, IsArray, IsString, IsBoolean, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AccountingMethod } from '../../../../generated/prisma';

export class UpdateOrganizationOperationDto {
  @ApiPropertyOptional({
    description: 'Fiscal year start date',
    example: '2025-01-01'
  })
  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  fy_start?: Date;

  @ApiPropertyOptional({
    description: 'Fiscal year end date',
    example: '2025-12-31'
  })
  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  fy_end?: Date;

  @ApiPropertyOptional({
    description: 'VAT registration effectivity date',
    example: '2025-01-01'
  })
  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  vat_reg_effectivity?: Date;

  @ApiPropertyOptional({
    description: 'Registration effectivity date',
    example: '2025-01-01'
  })
  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  registration_effectivity?: Date;

  @ApiPropertyOptional({
    description: 'Payroll cut-off dates',
    example: ['15/30'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  payroll_cut_off?: string[];

  @ApiPropertyOptional({
    description: 'Payment cut-off dates',
    example: ['15/30'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  payment_cut_off?: string[];

  @ApiPropertyOptional({
    description: 'Quarter closing dates',
    example: ['03/31', '06/30', '09/30', '12/31'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  quarter_closing?: string[];

  @ApiPropertyOptional({
    description: 'Has foreign operations',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  has_foreign?: boolean;

  @ApiPropertyOptional({
    description: 'Has employees',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  has_employees?: boolean;

  @ApiPropertyOptional({
    description: 'Is Expanded Withholding Tax agent',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  is_ewt?: boolean;

  @ApiPropertyOptional({
    description: 'Is Final Withholding Tax agent',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  is_fwt?: boolean;

  @ApiPropertyOptional({
    description: 'Is BIR withholding agent',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  is_bir_withholding_agent?: boolean;

  @ApiPropertyOptional({
    description: 'Accounting method',
    enum: AccountingMethod,
    example: AccountingMethod.ACCRUAL
  })
  @IsOptional()
  @IsEnum(AccountingMethod)
  accounting_method?: AccountingMethod;
}