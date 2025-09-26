import { IsNotEmpty, IsEnum, IsOptional, IsString, IsDateString, IsEmail, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Category, SubCategory, TaxClassification } from '@prisma/client';

export class CreateOrganizationDto {
  @ApiProperty({
    description: 'Organization name',
    example: 'ABC Corporation'
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Tax Identification Number',
    example: '001234567890'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? null)
  tin: string | null;

  @ApiProperty({
    description: 'Organization category',
    enum: Category,
    example: Category.INDIVIDUAL
  })
  @IsNotEmpty()
  @IsEnum(Category)
  category: Category;

  @ApiPropertyOptional({
    description: 'Organization subcategory',
    enum: SubCategory,
    example: SubCategory.SELF_EMPLOYED
  })
  @IsOptional()
  @IsEnum(SubCategory)
  subcategory?: SubCategory;

  @ApiProperty({
    description: 'Tax classification',
    enum: TaxClassification,
    example: TaxClassification.VAT
  })
  @IsNotEmpty()
  @IsEnum(TaxClassification)
  tax_classification: TaxClassification;

  @ApiPropertyOptional({
    description: 'Registration date',
    example: '2024-01-01'
  })
  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : null)
  registration_date: Date | null;

  @ApiPropertyOptional({
    description: 'Organization address',
    example: 'Makati City, Philippines'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? null)
  address: string | null;

  // OrganizationRegistration fields
  @ApiProperty({
    description: 'First name of the registrant',
    example: 'John'
  })
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @ApiPropertyOptional({
    description: 'Middle name of the registrant',
    example: 'Michael'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? null)
  middle_name: string | null;

  @ApiProperty({
    description: 'Last name of the registrant',
    example: 'Doe'
  })
  @IsNotEmpty()
  @IsString()
  last_name: string;

  @ApiPropertyOptional({
    description: 'Trade name of the business',
    example: 'ABC Trading'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? null)
  trade_name: string | null;

  @ApiProperty({
    description: 'Line of business (PSIC code)',
    example: '6201'
  })
  @IsNotEmpty()
  @IsString()
  line_of_business: string;

  @ApiProperty({
    description: 'Address line',
    example: '123 Main Street'
  })
  @IsNotEmpty()
  @IsString()
  address_line: string;

  @ApiProperty({
    description: 'Region',
    example: 'NCR'
  })
  @IsNotEmpty()
  @IsString()
  region: string;

  @ApiProperty({
    description: 'City',
    example: 'Makati'
  })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({
    description: 'ZIP code',
    example: '1223'
  })
  @IsNotEmpty()
  @IsString()
  zip_code: string;

  @ApiProperty({
    description: '12-digit TIN',
    example: '001234567890'
  })
  @IsNotEmpty()
  @IsString()
  @Length(12, 12)
  tin_registration: string;

  @ApiProperty({
    description: 'RDO code',
    example: '001'
  })
  @IsNotEmpty()
  @IsString()
  rdo_code: string;

  @ApiProperty({
    description: 'Contact number',
    example: '+639123456789'
  })
  @IsNotEmpty()
  @IsString()
  contact_number: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john.doe@example.com'
  })
  @IsNotEmpty()
  @IsEmail()
  email_address: string;

  @ApiProperty({
    description: 'Tax type for registration',
    enum: TaxClassification,
    example: TaxClassification.VAT
  })
  @IsNotEmpty()
  @IsEnum(TaxClassification)
  tax_type: TaxClassification;

  @ApiProperty({
    description: 'Start date',
    example: '2024-01-01'
  })
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  start_date: Date;

  @ApiProperty({
    description: 'Registration date for MCIT calculation',
    example: '2024-01-01'
  })
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  reg_date: Date;
}
