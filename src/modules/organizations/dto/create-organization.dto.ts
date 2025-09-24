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
  @IsEnum(['SELF_EMPLOYED', 'SOLE_PROPRIETOR', 'FREELANCER', 'CORPORATION', 'PARTNERSHIP', 'OTHERS'])
  subcategory?: 'SELF_EMPLOYED' | 'SOLE_PROPRIETOR' | 'FREELANCER' | 'CORPORATION' | 'PARTNERSHIP' | 'OTHERS';

  @IsNotEmpty()
  @IsEnum(['VAT', 'NON_VAT'])
  tax_classification: 'VAT' | 'NON_VAT';

  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : null)
  registration_date: Date | null;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? null)
  address: string | null;
}