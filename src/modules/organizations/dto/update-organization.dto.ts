import { IsOptional, IsEnum, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Category, SubCategory, TaxClassification } from '@prisma/client';

export class UpdateOrganizationDto {
  @ApiPropertyOptional({
    description: 'Organization name',
    example: 'ABC Corporation'
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Tax Identification Number',
    example: '123-456-789-000'
  })
  @IsOptional()
  @IsString()
  tin?: string;

  @ApiPropertyOptional({
    description: 'Organization category',
    enum: Category,
    example: Category.NON_INDIVIDUAL
  })
  @IsOptional()
  @IsEnum(Category)
  category?: Category;

  @ApiPropertyOptional({
    description: 'Organization subcategory',
    enum: SubCategory,
    example: SubCategory.CORPORATION
  })
  @IsOptional()
  @IsEnum(SubCategory)
  subcategory?: SubCategory;

  @ApiPropertyOptional({
    description: 'Tax classification',
    enum: TaxClassification,
    example: TaxClassification.VAT
  })
  @IsOptional()
  @IsEnum(TaxClassification)
  tax_classification?: TaxClassification;

  @ApiPropertyOptional({
    description: 'Registration date',
    example: '2025-01-01'
  })
  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : null)
  registration_date?: Date;

  @ApiPropertyOptional({
    description: 'Organization address',
    example: '123 Main Street, City, Province 1234'
  })
  @IsOptional()
  @IsString()
  address?: string;
}
