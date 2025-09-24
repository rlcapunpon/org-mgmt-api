import { IsOptional, IsDateString, IsArray, IsString, IsBoolean, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateOrganizationOperationDto {
  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  fy_start?: Date;

  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  fy_end?: Date;

  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  vat_reg_effectivity?: Date;

  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  registration_effectivity?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  payroll_cut_off?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  payment_cut_off?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  quarter_closing?: string[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  has_foreign?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  has_employees?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  is_ewt?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  is_fwt?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  is_bir_withholding_agent?: boolean;

  @IsOptional()
  @IsEnum(['ACCRUAL', 'CASH'])
  accounting_method?: 'ACCRUAL' | 'CASH';
}