import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({
    description: 'Health check status',
    example: 'ok',
  })
  status: string;
}
