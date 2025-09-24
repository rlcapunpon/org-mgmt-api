import { IsNotEmpty, IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateOrganizationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? null)
  tin: string | null;

  @IsNotEmpty()
  @IsEnum(['INDIVIDUAL', 'NON_INDIVIDUAL'])
  category: 'INDIVIDUAL' | 'NON_INDIVIDUAL';

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? null)
  subcategory: string | null;

  @IsNotEmpty()
  @IsEnum(['VAT', 'NON_VAT', 'WITHHOLDING', 'MIXED', 'OTHERS'])
  tax_classification: 'VAT' | 'NON_VAT' | 'WITHHOLDING' | 'MIXED' | 'OTHERS';

  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : null)
  registration_date: Date | null;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? null)
  address: string | null;
}