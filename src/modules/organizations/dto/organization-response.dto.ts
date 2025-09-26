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

export class OrganizationStatusResponseDto {
  @ApiProperty({ description: 'Status unique identifier' })
  id: string;

  @ApiProperty({ description: 'Organization ID' })
  organization_id: string;

  @ApiProperty({ description: 'Is active status' })
  is_active: boolean;

  @ApiProperty({ description: 'Is suspended status' })
  is_suspended: boolean;

  @ApiProperty({ description: 'Is terminated status' })
  is_terminated: boolean;

  @ApiProperty({ description: 'Suspension reason', required: false })
  suspension_reason: string | null;

  @ApiProperty({ description: 'Termination reason', required: false })
  termination_reason: string | null;

  @ApiProperty({ description: 'Last update timestamp' })
  last_update: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: Date;

  @ApiProperty({ description: 'Update timestamp' })
  updated_at: Date;
}

export class OrganizationRegistrationResponseDto {
  @ApiProperty({ description: 'Registration unique identifier' })
  id: string;

  @ApiProperty({ description: 'Organization ID' })
  organization_id: string;

  @ApiProperty({ description: 'Is VAT registered' })
  is_vat_registered: boolean;

  @ApiProperty({ description: 'Is non-VAT registered' })
  is_non_vat_registered: boolean;

  @ApiProperty({ description: 'Is percentage tax registered' })
  is_percentage_tax_registered: boolean;

  @ApiProperty({ description: 'Is income tax registered' })
  is_income_tax_registered: boolean;

  @ApiProperty({ description: 'Is withholding tax registered' })
  is_withholding_tax_registered: boolean;

  @ApiProperty({ description: 'Is expanded withholding tax registered' })
  is_ewt_registered: boolean;

  @ApiProperty({ description: 'Is final withholding tax registered' })
  is_fwt_registered: boolean;

  @ApiProperty({ description: 'Is BIR withholding agent registered' })
  is_bir_withholding_agent_registered: boolean;

  @ApiProperty({ description: 'Last update timestamp' })
  last_update: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: Date;

  @ApiProperty({ description: 'Update timestamp' })
  updated_at: Date;
}