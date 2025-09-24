import { IsNotEmpty, IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { Category, SubCategory, TaxClassification } from '../../../../generated/prisma';

export class CreateOrganizationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? null)
  tin: string | null;

  @IsNotEmpty()
  @IsEnum(Category)
  category: Category;

  @IsOptional()
  @IsEnum(SubCategory)
  subcategory?: SubCategory;

  @IsNotEmpty()
  @IsEnum(TaxClassification)
  tax_classification: TaxClassification;

  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : null)
  registration_date: Date | null;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? null)
  address: string | null;
}