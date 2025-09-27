import { ApiProperty } from '@nestjs/swagger';

export class ScheduleResponseDto {
  @ApiProperty({ description: 'Organization obligation ID' })
  org_obligation_id: string;

  @ApiProperty({ description: 'Reporting period' })
  period: string;

  @ApiProperty({ description: 'Due date for filing' })
  due_date: Date;

  @ApiProperty({
    description: 'Filing status',
    enum: ['DUE', 'FILED', 'LATE', 'EXEMPT'],
  })
  status: string;

  @ApiProperty({ description: 'Date when filed', required: false })
  filed_at: Date | null;
}
