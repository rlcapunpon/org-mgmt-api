import { ApiProperty } from '@nestjs/swagger';

export class OrganizationResponseDto {
  @ApiProperty({ description: 'Organization unique identifier' })
  id: string;

  @ApiProperty({ description: 'Organization name' })
  name: string;

  @ApiProperty({ description: 'Tax identification number', required: false })
  tin: string | null;

  @ApiProperty({ 
    description: 'Organization category',
    enum: ['INDIVIDUAL', 'NON_INDIVIDUAL']
  })
  category: string;

  @ApiProperty({ 
    description: 'Organization subcategory',
    enum: ['SELF_EMPLOYED', 'SOLE_PROPRIETOR', 'FREELANCER', 'CORPORATION', 'PARTNERSHIP', 'OTHERS'],
    required: false
  })
  subcategory: string | null;

  @ApiProperty({ 
    description: 'Tax classification',
    enum: ['VAT', 'NON_VAT']
  })
  tax_classification: string;

  @ApiProperty({ description: 'Registration date', required: false })
  registration_date: Date | null;

  @ApiProperty({ description: 'Organization address', required: false })
  address: string | null;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at: Date;

  @ApiProperty({ description: 'Deletion timestamp', required: false })
  deleted_at: Date | null;
}

export class OrganizationListResponseDto {
  @ApiProperty({ 
    type: [OrganizationResponseDto],
    description: 'Array of organizations'
  })
  organizations: OrganizationResponseDto[];
}

export class OrganizationOperationResponseDto {
  @ApiProperty({ description: 'Operation unique identifier' })
  id: string;

  @ApiProperty({ description: 'Organization ID' })
  organization_id: string;

  @ApiProperty({ description: 'Fiscal year start date' })
  fy_start: Date;

  @ApiProperty({ description: 'Fiscal year end date' })
  fy_end: Date;

  @ApiProperty({ description: 'VAT registration effectivity date' })
  vat_reg_effectivity: Date;

  @ApiProperty({ description: 'Registration effectivity date' })
  registration_effectivity: Date;

  @ApiProperty({ 
    description: 'Payroll cut-off dates',
    type: [String]
  })
  payroll_cut_off: string[];

  @ApiProperty({ 
    description: 'Payment cut-off dates',
    type: [String]
  })
  payment_cut_off: string[];

  @ApiProperty({ 
    description: 'Quarter closing dates',
    type: [String]
  })
  quarter_closing: string[];

  @ApiProperty({ description: 'Has foreign transactions' })
  has_foreign: boolean;

  @ApiProperty({ description: 'Has employees' })
  has_employees: boolean;

  @ApiProperty({ description: 'Is expanded withholding tax' })
  is_ewt: boolean;

  @ApiProperty({ description: 'Is final withholding tax' })
  is_fwt: boolean;

  @ApiProperty({ description: 'Is BIR withholding agent' })
  is_bir_withholding_agent: boolean;

  @ApiProperty({ 
    description: 'Accounting method',
    enum: ['ACCRUAL', 'CASH', 'OTHERS']
  })
  accounting_method: string;

  @ApiProperty({ description: 'Last update timestamp' })
  last_update: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: Date;

  @ApiProperty({ description: 'Update timestamp' })
  updated_at: Date;
}