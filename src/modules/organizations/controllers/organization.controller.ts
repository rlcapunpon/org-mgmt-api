import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, NotFoundException, HttpCode } from '@nestjs/common';
import { OrganizationService } from '../services/organization.service';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { UpdateOrganizationOperationDto } from '../dto/update-organization-operation.dto';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequiresPermission } from '../../../common/decorators/requires-permission.decorator';

@Controller('organizations')
@UseGuards(AuthGuard, PermissionsGuard)
export class OrganizationController {
  constructor(private service: OrganizationService) {}

  @Post()
  @RequiresPermission('resource:create')
  async create(@Body() dto: CreateOrganizationDto) {
    const org = await this.service.create(dto);
    return org;
  }

  @Get(':id')
  @RequiresPermission('resource:read')
  async findById(@Param('id') id: string) {
    const org = await this.service.findById(id);
    if (!org) throw new NotFoundException();
    return org;
  }

  @Put(':id')
  @RequiresPermission('resource:update')
  async update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequiresPermission('resource:delete')
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    return this.service.softDelete(id);
  }

  @Get()
  @RequiresPermission('resource:read')
  async list(@Query() query: { category?: string; tax_classification?: string }) {
    return this.service.list(query);
  }

  @Get(':id/operation')
  @RequiresPermission('resource:read')
  async getOperation(@Param('id') id: string) {
    const operation = await this.service.getOperationByOrgId(id);
    if (!operation) throw new NotFoundException();
    return operation;
  }

  @Put(':id/operation')
  @RequiresPermission('resource:update')
  async updateOperation(@Param('id') id: string, @Body() dto: UpdateOrganizationOperationDto) {
    return this.service.updateOperation(id, dto);
  }
}