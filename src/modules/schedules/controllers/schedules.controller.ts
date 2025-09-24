import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { SchedulesService } from '../services/schedules.service';
import { SchedulesRepository } from '../repositories/schedules.repository';
import { GetSchedulesQueryDto } from '../dto/get-schedules-query.dto';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequiresPermission } from '../../../common/decorators/requires-permission.decorator';
import { ObligationSchedule } from '../../../../generated/prisma';

@Controller('organizations')
@UseGuards(AuthGuard, PermissionsGuard)
export class SchedulesController {
  constructor(
    private readonly schedulesService: SchedulesService,
    private readonly schedulesRepository: SchedulesRepository,
  ) {}

  @Get(':id/schedules')
  @RequiresPermission('organization.read')
  async getSchedules(
    @Param('id') organizationId: string,
    @Query() query: GetSchedulesQueryDto,
  ): Promise<Omit<ObligationSchedule, 'id' | 'created_at' | 'updated_at'>[]> {
    const obligations = await this.schedulesRepository.getOrganizationObligationsWithTaxObligations(organizationId);

    const startDate = query.start_date ? new Date(query.start_date) : new Date();
    const endDate = query.end_date ? new Date(query.end_date) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now

    const allSchedules: Omit<ObligationSchedule, 'id' | 'created_at' | 'updated_at'>[] = [];

    for (const obligation of obligations) {
      const schedules = this.schedulesService.generateSchedulesForObligation(obligation as any, startDate, endDate);
      allSchedules.push(...schedules);
    }

    return allSchedules;
  }
}