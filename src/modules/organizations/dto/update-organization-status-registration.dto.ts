import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsEmail,
} from 'class-validator';

export class UpdateOrganizationStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'TERMINATED'])
  status: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['EXPIRED', 'OPTED_OUT', 'PAYMENT_PENDING', 'VIOLATIONS'])
  reason: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateOrganizationRegistrationDto {
  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  middle_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsString()
  trade_name?: string;

  @IsOptional()
  @IsString()
  line_of_business?: string;

  @IsOptional()
  @IsString()
  address_line?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  zip_code?: string;

  @IsOptional()
  @IsString()
  tin?: string;

  @IsOptional()
  @IsString()
  rdo_code?: string;

  @IsOptional()
  @IsString()
  contact_number?: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  email_address?: string;

  @IsOptional()
  @IsString()
  tax_type?: string;

  @IsOptional()
  @IsString()
  start_date?: string;

  @IsOptional()
  @IsString()
  reg_date?: string;
}
