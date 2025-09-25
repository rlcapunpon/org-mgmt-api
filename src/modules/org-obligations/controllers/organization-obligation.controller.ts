import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { OrganizationObligationService } from '../services/organization-obligation.service';
import { AssignObligationDto, UpdateObligationStatusDto } from '../dto/assign-obligation.dto';
import { OrganizationObligationResponseDto } from '../dto/organization-obligation-response.dto';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequiresPermission } from '../../../common/decorators/requires-permission.decorator';

@ApiTags('Organization Obligations')
@ApiBearerAuth('JWT-auth')
@Controller()
@UseGuards(AuthGuard, PermissionsGuard)
export class OrganizationObligationController {
  constructor(private service: OrganizationObligationService) {}

  @Post('organizations/:orgId/obligations')
  @RequiresPermission('resource:create')
  @ApiOperation({ summary: 'Assign tax obligation to organization' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiResponse({ 
    status: 201, 
    description: 'Obligation assigned successfully',
    type: OrganizationObligationResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid data' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Organization or obligation not found' })
  @ApiBody({ type: AssignObligationDto })
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
  @ApiOperation({ summary: 'Get obligations for organization' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of organization obligations',
    type: [OrganizationObligationResponseDto] 
  })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async getObligationsByOrgId(@Param('orgId') orgId: string) {
    return this.service.getObligationsByOrgId(orgId);
  }

  @Put('organization-obligations/:id')
  @RequiresPermission('resource:update')
  @ApiOperation({ summary: 'Update obligation status' })
  @ApiParam({ name: 'id', description: 'Organization obligation ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Obligation status updated successfully',
    type: OrganizationObligationResponseDto 
  })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Obligation not found' })
  @ApiBody({ type: UpdateObligationStatusDto })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateObligationStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }
}
