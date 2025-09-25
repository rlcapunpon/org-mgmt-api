import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { OrganizationObligationService } from '../services/organization-obligation.service';
import { AssignObligationDto, UpdateObligationStatusDto } from '../dto/assign-obligation.dto';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequiresPermission } from '../../../common/decorators/requires-permission.decorator';

@Controller()
@UseGuards(AuthGuard, PermissionsGuard)
export class OrganizationObligationController {
  constructor(private service: OrganizationObligationService) {}

  @Post('organizations/:orgId/obligations')
  @RequiresPermission('resource:create')
  async assignObligation(@Param('orgId') orgId: string, @Body() dto: AssignObligationDto) {
    const data = {
      start_date: new Date(dto.start_date),
      end_date: dto.end_date ? new Date(dto.end_date) : null,
      notes: dto.notes,
      organization: { connect: { id: orgId } },
      obligation: { connect: { id: dto.obligation_id } },
    };
    const obligation = await this.service.assignObligation(data);
    return obligation;
  }

  @Get('organizations/:orgId/obligations')
  @RequiresPermission('resource:read')
  async getObligationsByOrgId(@Param('orgId') orgId: string) {
    return this.service.getObligationsByOrgId(orgId);
  }

  @Put('organization-obligations/:id')
  @RequiresPermission('resource:update')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateObligationStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }
}
