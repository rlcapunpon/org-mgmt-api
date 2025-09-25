import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, NotFoundException, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { OrganizationService } from '../services/organization.service';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { UpdateOrganizationOperationDto } from '../dto/update-organization-operation.dto';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequiresPermission } from '../../../common/decorators/requires-permission.decorator';

@ApiTags('Organizations')
@ApiBearerAuth('JWT-auth')
@Controller('organizations')
@UseGuards(AuthGuard, PermissionsGuard)
export class OrganizationController {
  constructor(private service: OrganizationService) {}

  @Post()
  @RequiresPermission('resource:create')
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiResponse({ status: 201, description: 'Organization created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid data' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiBody({ type: CreateOrganizationDto })
  async create(@Body() dto: CreateOrganizationDto) {
    const org = await this.service.create(dto);
    return org;
  }

  @Get(':id')
  @RequiresPermission('resource:read')
  @ApiOperation({ summary: 'Get organization by ID' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({ status: 200, description: 'Organization found' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async findById(@Param('id') id: string) {
    const org = await this.service.findById(id);
    if (!org) throw new NotFoundException();
    return org;
  }

  @Put(':id')
  @RequiresPermission('resource:update')
  @ApiOperation({ summary: 'Update organization' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({ status: 200, description: 'Organization updated successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiBody({ type: UpdateOrganizationDto })
  async update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequiresPermission('resource:delete')
  @HttpCode(204)
  @ApiOperation({ summary: 'Soft delete organization' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({ status: 204, description: 'Organization deleted successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async delete(@Param('id') id: string) {
    return this.service.softDelete(id);
  }

  @Get()
  @RequiresPermission('resource:read')
  @ApiOperation({ summary: 'List organizations with optional filters' })
  @ApiQuery({ name: 'category', required: false, enum: ['INDIVIDUAL', 'NON_INDIVIDUAL'] })
  @ApiQuery({ name: 'tax_classification', required: false, enum: ['VAT', 'NON_VAT'] })
  @ApiQuery({ name: 'subcategory', required: false, enum: ['SELF_EMPLOYED', 'SOLE_PROPRIETOR', 'FREELANCER', 'CORPORATION', 'PARTNERSHIP', 'OTHERS'] })
  @ApiResponse({ status: 200, description: 'List of organizations' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async list(@Query() query: { category?: string; tax_classification?: string; subcategory?: string }) {
    return this.service.list(query);
  }

  @Get(':id/operation')
  @RequiresPermission('resource:read')
  @ApiOperation({ summary: 'Get organization operation details' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({ status: 200, description: 'Organization operation details' })
  @ApiResponse({ status: 404, description: 'Organization or operation not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async getOperation(@Param('id') id: string) {
    const operation = await this.service.getOperationByOrgId(id);
    if (!operation) throw new NotFoundException();
    return operation;
  }

  @Put(':id/operation')
  @RequiresPermission('resource:update')
  @ApiOperation({ summary: 'Update organization operation details' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({ status: 200, description: 'Organization operation updated successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiBody({ type: UpdateOrganizationOperationDto })
  async updateOperation(@Param('id') id: string, @Body() dto: UpdateOrganizationOperationDto) {
    return this.service.updateOperation(id, dto);
  }
}
