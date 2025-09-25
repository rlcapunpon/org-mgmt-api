import { IsNotEmpty, IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Category, SubCategory, TaxClassification } from '../../../../generated/prisma';

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
}