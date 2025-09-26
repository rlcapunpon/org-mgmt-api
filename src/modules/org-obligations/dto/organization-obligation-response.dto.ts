import { ApiProperty } from '@nestjs/swagger';

export class OrganizationObligationResponseDto {
  @ApiProperty({ description: 'Organization obligation unique identifier' })
  id: string;

  @ApiProperty({ description: 'Organization ID' })
  organization_id: string;

  @ApiProperty({ description: 'Tax obligation ID' })
  obligation_id: string;

  @ApiProperty({ description: 'Obligation start date' })
  start_date: Date;

  @ApiProperty({ description: 'Obligation end date', required: false })
  end_date: Date | null;

  @ApiProperty({ 
    description: 'Obligation status',
    enum: ['NOT_APPLICABLE', 'ASSIGNED', 'ACTIVE', 'DUE', 'FILED', 'PAID', 'OVERDUE', 'LATE', 'EXEMPT', 'SUSPENDED', 'CLOSED']
  })
  status: string;

  @ApiProperty({ description: 'Notes about the obligation', required: false })
  notes: string | null;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at: Date;
}