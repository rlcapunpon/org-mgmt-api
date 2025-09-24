import { IsOptional, IsEnum, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  tin?: string;

  @IsOptional()
  @IsEnum(['INDIVIDUAL', 'NON_INDIVIDUAL'])
  category?: 'INDIVIDUAL' | 'NON_INDIVIDUAL';

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsOptional()
  @IsEnum(['VAT', 'NON_VAT', 'WITHHOLDING', 'MIXED', 'OTHERS'])
  tax_classification?: 'VAT' | 'NON_VAT' | 'WITHHOLDING' | 'MIXED' | 'OTHERS';

  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : null)
  registration_date?: Date;

  @IsOptional()
  @IsString()
  address?: string;
}