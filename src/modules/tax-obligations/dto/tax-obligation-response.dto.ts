import { ApiProperty } from '@nestjs/swagger';

export class TaxObligationResponseDto {
  @ApiProperty({ description: 'Tax obligation unique identifier' })
  id: string;

  @ApiProperty({ description: 'Tax obligation code' })
  code: string;

  @ApiProperty({ description: 'Tax obligation name' })
  name: string;

  @ApiProperty({ 
    description: 'Filing frequency',
    enum: ['MONTHLY', 'QUARTERLY', 'ANNUAL', 'ONE_TIME']
  })
  frequency: string;

  @ApiProperty({ 
    description: 'Due date rules configuration (JSON object)',
    example: { day: 20, month_offset: 1 }
  })
  due_rule: any;

  @ApiProperty({ 
    description: 'Tax obligation status',
    enum: ['MANDATORY', 'OPTIONAL', 'EXEMPT', 'CONDITIONAL', 'ONE_TIME', 'RETIRED']
  })
  status: string;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at: Date;
}