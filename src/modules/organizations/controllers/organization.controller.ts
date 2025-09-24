import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, NotFoundException, HttpCode } from '@nestjs/common';
import { OrganizationService } from '../services/organization.service';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequiresPermission } from '../../../common/decorators/requires-permission.decorator';

@Controller('organizations')
@UseGuards(AuthGuard, PermissionsGuard)
export class OrganizationController {
  constructor(private service: OrganizationService) {}

  @Post()
  @RequiresPermission('organization.create')
  async create(@Body() dto: CreateOrganizationDto) {
    const org = await this.service.create(dto);
    return org;
  }

  @Get(':id')
  @RequiresPermission('organization.read')
  async findById(@Param('id') id: string) {
    const org = await this.service.findById(id);
    if (!org) throw new NotFoundException();
    return org;
  }

  @Put(':id')
  @RequiresPermission('organization.write')
  async update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequiresPermission('organization.write')
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    await this.service.softDelete(id);
  }

  @Get()
  @RequiresPermission('organization.read')
  async list(@Query() query: { category?: string; tax_classification?: string }) {
    return this.service.list(query);
  }
}