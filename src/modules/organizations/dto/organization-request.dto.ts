/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsEmail,
  Length,
  IsBoolean,
  IsArray,
  IsIn,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BusinessStatus } from '@prisma/client';
import {
  Category,
  SubCategory,
  TaxClassification,
  AccountingMethod,
} from '@prisma/client';

// Create Organization Request DTO
export class CreateOrganizationRequestDto {
  @ApiPropertyOptional({
    description: 'Registered name of the business (required for NON_INDIVIDUAL category)',
    example: 'ABC Corporation Inc.',
  })
  @ValidateIf(
    (obj: { category?: Category }) => obj.category === Category.NON_INDIVIDUAL,
  )
  @IsNotEmpty()
  @IsString()
  registered_name?: string;

  @ApiProperty({
    description: 'Tax Identification Number',
    example: '001234567890',
  })
  @IsNotEmpty()
  @IsString()
  tin: string;

  @ApiProperty({
    description: 'Organization category',
    enum: Category,
    example: Category.INDIVIDUAL,
  })
  @IsNotEmpty()
  @IsEnum(Category)
  category: Category;

  @ApiPropertyOptional({
    description: 'Organization subcategory',
    enum: SubCategory,
    example: SubCategory.SELF_EMPLOYED,
  })
  @IsOptional()
  @IsEnum(SubCategory)
  subcategory?: SubCategory;

  @ApiProperty({
    description: 'Tax classification',
    enum: TaxClassification,
    example: TaxClassification.VAT,
  })
  @IsNotEmpty()
  @IsEnum(TaxClassification)
  tax_classification: TaxClassification;

  @ApiProperty({
    description: 'Registration date',
    example: '2024-01-01',
  })
  @IsNotEmpty()
  @Transform(({ value }): Date => new Date(value))
  registration_date: Date;

  // OrganizationRegistration fields
  @ApiProperty({
    description:
      'First name of the registrant (required for INDIVIDUAL category)',
    example: 'John',
  })
  @ValidateIf(
    (obj: { category?: Category }) => obj.category === Category.INDIVIDUAL,
  )
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @ApiPropertyOptional({
    description: 'Middle name of the registrant',
    example: 'Michael',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }): string | null => value ?? null)
  middle_name: string | null;

  @ApiProperty({
    description:
      'Last name of the registrant (required for INDIVIDUAL category)',
    example: 'Doe',
  })
  @ValidateIf(
    (obj: { category?: Category }) => obj.category === Category.INDIVIDUAL,
  )
  @IsNotEmpty()
  @IsString()
  last_name: string;

  @ApiPropertyOptional({
    description: 'Trade name of the business',
    example: 'ABC Trading',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }): string | null => value ?? null)
  trade_name: string | null;

  @ApiProperty({
    description: 'Line of business (PSIC code)',
    example: '6201',
  })
  @IsNotEmpty()
  @IsString()
  line_of_business: string;

  @ApiProperty({
    description: 'Address line',
    example: '123 Main Street',
  })
  @IsNotEmpty()
  @IsString()
  address_line: string;

  @ApiProperty({
    description: 'Region',
    example: 'NCR',
  })
  @IsNotEmpty()
  @IsString()
  region: string;

  @ApiProperty({
    description: 'City',
    example: 'Makati',
  })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({
    description: 'ZIP code',
    example: '1223',
  })
  @IsNotEmpty()
  @IsString()
  zip_code: string;

  @ApiProperty({
    description: 'RDO code',
    example: '001',
  })
  @IsNotEmpty()
  @IsString()
  rdo_code: string;

  @ApiProperty({
    description: 'Contact number',
    example: '+639123456789',
  })
  @IsNotEmpty()
  @IsString()
  contact_number: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email_address: string;

  @ApiProperty({
    description: 'Start date',
    example: '2024-01-01',
  })
  @IsNotEmpty()
  @Transform(({ value }): Date => new Date(value))
  start_date: Date;

  // OrganizationOperation fields (optional)
  @ApiPropertyOptional({
    description: 'Fiscal year start date',
    example: '2024-01-01',
  })
  @IsOptional()
  @Transform(({ value }): Date | undefined =>
    value ? new Date(value) : undefined,
  )
  fy_start?: Date;

  @ApiPropertyOptional({
    description: 'Fiscal year end date',
    example: '2024-12-31',
  })
  @IsOptional()
  @Transform(({ value }): Date | undefined =>
    value ? new Date(value) : undefined,
  )
  fy_end?: Date;

  @ApiPropertyOptional({
    description: 'VAT registration effectivity date',
    example: '2024-01-01',
  })
  @IsOptional()
  @Transform(({ value }): Date | undefined =>
    value ? new Date(value) : undefined,
  )
  vat_reg_effectivity?: Date;

  @ApiPropertyOptional({
    description: 'Registration effectivity date',
    example: '2024-01-01',
  })
  @IsOptional()
  @Transform(({ value }): Date | undefined =>
    value ? new Date(value) : undefined,
  )
  registration_effectivity?: Date;

  @ApiPropertyOptional({
    description: 'Payroll cut-off dates',
    example: ['15', '30'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  payroll_cut_off?: string[];

  @ApiPropertyOptional({
    description: 'Payment cut-off dates',
    example: ['10', '25'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  payment_cut_off?: string[];

  @ApiPropertyOptional({
    description: 'Quarter closing dates',
    example: ['03-31', '06-30', '09-30', '12-31'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  quarter_closing?: string[];

  @ApiPropertyOptional({
    description: 'Has foreign transactions',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  has_foreign?: boolean;

  @ApiPropertyOptional({
    description: 'Has employees',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  has_employees?: boolean;

  @ApiPropertyOptional({
    description: 'Is expanded withholding tax',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  is_ewt?: boolean;

  @ApiPropertyOptional({
    description: 'Is final withholding tax',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  is_fwt?: boolean;

  @ApiPropertyOptional({
    description: 'Is BIR withholding agent',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  is_bir_withholding_agent?: boolean;

  @ApiPropertyOptional({
    description: 'Accounting method',
    enum: AccountingMethod,
    example: AccountingMethod.ACCRUAL,
  })
  @IsOptional()
  @IsEnum(AccountingMethod)
  accounting_method?: AccountingMethod;
}

// Update Organization Request DTO
export class UpdateOrganizationRequestDto {
  @ApiPropertyOptional({
    description: 'Organization name',
    example: 'ABC Corporation',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Tax Identification Number',
    example: '123-456-789-000',
  })
  @IsOptional()
  @IsString()
  tin?: string;

  @ApiPropertyOptional({
    description: 'Organization category',
    enum: Category,
    example: Category.NON_INDIVIDUAL,
  })
  @IsOptional()
  @IsEnum(Category)
  category?: Category;

  @ApiPropertyOptional({
    description: 'Organization subcategory',
    enum: SubCategory,
    example: SubCategory.CORPORATION,
  })
  @IsOptional()
  @IsEnum(SubCategory)
  subcategory?: SubCategory;

  @ApiPropertyOptional({
    description: 'Tax classification',
    enum: TaxClassification,
    example: TaxClassification.VAT,
  })
  @IsOptional()
  @IsEnum(TaxClassification)
  tax_classification?: TaxClassification;

  @ApiPropertyOptional({
    description: 'Registration date',
    example: '2025-01-01',
  })
  @IsOptional()
  @Transform(({ value }): Date | null => (value ? new Date(value) : null))
  registration_date?: Date;

  @ApiPropertyOptional({
    description: 'Organization address',
    example: '123 Main Street, City, Province 1234',
  })
  @IsOptional()
  @IsString()
  address?: string;
}

// Update Organization Operation Request DTO
export class UpdateOrganizationOperationRequestDto {
  @ApiPropertyOptional({
    description: 'Fiscal year start date',
    example: '2025-01-01',
  })
  @IsOptional()
  @Transform(({ value }): Date | undefined =>
    value ? new Date(value) : undefined,
  )
  fy_start?: Date;

  @ApiPropertyOptional({
    description: 'Fiscal year end date',
    example: '2025-12-31',
  })
  @IsOptional()
  @Transform(({ value }): Date | undefined =>
    value ? new Date(value) : undefined,
  )
  fy_end?: Date;

  @ApiPropertyOptional({
    description: 'VAT registration effectivity date',
    example: '2025-01-01',
  })
  @IsOptional()
  @Transform(({ value }): Date | undefined =>
    value ? new Date(value) : undefined,
  )
  vat_reg_effectivity?: Date;

  @ApiPropertyOptional({
    description: 'Registration effectivity date',
    example: '2025-01-01',
  })
  @IsOptional()
  @Transform(({ value }): Date | undefined =>
    value ? new Date(value) : undefined,
  )
  registration_effectivity?: Date;

  @ApiPropertyOptional({
    description: 'Payroll cut-off dates',
    example: ['15', '30'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  payroll_cut_off?: string[];

  @ApiPropertyOptional({
    description: 'Payment cut-off dates',
    example: ['10', '25'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  payment_cut_off?: string[];

  @ApiPropertyOptional({
    description: 'Quarter closing dates',
    example: ['03-31', '06-30', '09-30', '12-31'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  quarter_closing?: string[];

  @ApiPropertyOptional({
    description: 'Has foreign transactions',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  has_foreign?: boolean;

  @ApiPropertyOptional({
    description: 'Has employees',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  has_employees?: boolean;

  @ApiPropertyOptional({
    description: 'Is expanded withholding tax',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  is_ewt?: boolean;

  @ApiPropertyOptional({
    description: 'Is final withholding tax',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  is_fwt?: boolean;

  @ApiPropertyOptional({
    description: 'Is BIR withholding agent',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  is_bir_withholding_agent?: boolean;

  @ApiPropertyOptional({
    description: 'Accounting method',
    enum: AccountingMethod,
    example: AccountingMethod.ACCRUAL,
  })
  @IsOptional()
  @IsEnum(AccountingMethod)
  accounting_method?: AccountingMethod;
}

// Update Organization Status Request DTO
export class UpdateOrganizationStatusRequestDto {
  @ApiProperty({
    description: 'Organization status',
    example: 'ACTIVE',
    enum: BusinessStatus,
    enumName: 'BusinessStatus',
  })
  @IsNotEmpty()
  @IsEnum(BusinessStatus)
  status: BusinessStatus;

  @ApiProperty({
    description: 'Reason for status change',
    example: 'EXPIRED',
    enum: ['EXPIRED', 'OPTED_OUT', 'PAYMENT_PENDING', 'VIOLATIONS'],
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['EXPIRED', 'OPTED_OUT', 'PAYMENT_PENDING', 'VIOLATIONS'])
  reason: string;

  @ApiPropertyOptional({
    description: 'Optional description for the status change',
    example: 'Organization license has expired',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

// Update Organization Registration Request DTO
export class UpdateOrganizationRegistrationRequestDto {
  @ApiPropertyOptional({
    description: 'First name of the registrant',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiPropertyOptional({
    description: 'Middle name of the registrant',
    example: 'Michael',
  })
  @IsOptional()
  @IsString()
  middle_name?: string;

  @ApiPropertyOptional({
    description: 'Last name of the registrant',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional({
    description: 'Trade name of the business',
    example: 'ABC Trading',
  })
  @IsOptional()
  @IsString()
  trade_name?: string;

  @ApiPropertyOptional({
    description: 'Line of business (PSIC code)',
    example: '6201',
  })
  @IsOptional()
  @IsString()
  line_of_business?: string;

  @ApiPropertyOptional({
    description: 'Address line',
    example: '123 Main Street',
  })
  @IsOptional()
  @IsString()
  address_line?: string;

  @ApiPropertyOptional({
    description: 'Region',
    example: 'NCR',
  })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({
    description: 'City',
    example: 'Makati',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'ZIP code',
    example: '1223',
  })
  @IsOptional()
  @IsString()
  zip_code?: string;

  @ApiPropertyOptional({
    description: '12-digit TIN',
    example: '001234567890',
  })
  @IsOptional()
  @IsString()
  @Length(12, 12)
  tin?: string;

  @ApiPropertyOptional({
    description: 'RDO code',
    example: '001',
  })
  @IsOptional()
  @IsString()
  rdo_code?: string;

  @ApiPropertyOptional({
    description: 'Contact number',
    example: '+639123456789',
  })
  @IsOptional()
  @IsString()
  contact_number?: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  email_address?: string;

  @ApiPropertyOptional({
    description: 'Tax type for registration',
    enum: TaxClassification,
    example: TaxClassification.VAT,
  })
  @IsOptional()
  @IsEnum(TaxClassification)
  tax_type?: TaxClassification;

  @ApiPropertyOptional({
    description: 'Start date',
    example: '2024-01-01',
  })
  @IsOptional()
  @Transform(({ value }): Date | undefined =>
    value ? new Date(value) : undefined,
  )
  start_date?: Date;

  @ApiPropertyOptional({
    description: 'Registration date for MCIT calculation',
    example: '2024-01-01',
  })
  @IsOptional()
  @Transform(({ value }): Date | undefined =>
    value ? new Date(value) : undefined,
  )
  reg_date?: Date;
}
