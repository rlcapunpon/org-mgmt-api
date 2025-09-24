import { IsNotEmpty, IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateOrganizationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  tin?: string;

  @IsNotEmpty()
  @IsEnum(['INDIVIDUAL', 'NON_INDIVIDUAL'])
  category: 'INDIVIDUAL' | 'NON_INDIVIDUAL';

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsNotEmpty()
  @IsEnum(['VAT', 'NON_VAT', 'WITHHOLDING', 'MIXED', 'OTHERS'])
  tax_classification: 'VAT' | 'NON_VAT' | 'WITHHOLDING' | 'MIXED' | 'OTHERS';

  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : null)
  registration_date?: Date;

  @IsOptional()
  @IsString()
  address?: string;
}