import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SchedulesService } from '../services/schedules.service';
import { SchedulesRepository } from '../repositories/schedules.repository';
import { GetSchedulesQueryDto } from '../dto/get-schedules-query.dto';
import { ScheduleResponseDto } from '../dto/schedule-response.dto';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequiresPermission } from '../../../common/decorators/requires-permission.decorator';

@ApiTags('Schedules')
@ApiBearerAuth('JWT-auth')
@Controller('organizations')
@UseGuards(AuthGuard, PermissionsGuard)
export class SchedulesController {
  constructor(
    private readonly schedulesService: SchedulesService,
    private readonly schedulesRepository: SchedulesRepository,
  ) {}

  @Get(':id/schedules')
  @RequiresPermission('resource:read')
  @ApiOperation({ summary: 'Get compliance schedules for organization' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiQuery({
    name: 'start_date',
    required: false,
    description: 'Start date for schedule generation (defaults to today)',
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    description:
      'End date for schedule generation (defaults to 1 year from now)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of compliance schedules',
    type: [ScheduleResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async getSchedules(
    @Param('id') organizationId: string,
    @Query() query: GetSchedulesQueryDto,
  ): Promise<ScheduleResponseDto[]> {
    const obligations =
      await this.schedulesRepository.getOrganizationObligationsWithTaxObligations(
        organizationId,
      );

    const startDate = query.start_date
      ? new Date(query.start_date)
      : new Date();
    const endDate = query.end_date
      ? new Date(query.end_date)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now

    const allSchedules: ScheduleResponseDto[] = [];

    for (const obligation of obligations) {
      const schedules = this.schedulesService.generateSchedulesForObligation(
        obligation as any,
        startDate,
        endDate,
      );
      allSchedules.push(...(schedules as ScheduleResponseDto[]));
    }

    return allSchedules;
  }
}
