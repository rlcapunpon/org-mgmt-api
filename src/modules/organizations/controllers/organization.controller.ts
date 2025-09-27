import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  NotFoundException,
  HttpCode,
  Req,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { OrganizationService } from '../services/organization.service';
import {
  CreateOrganizationRequestDto,
  UpdateOrganizationRequestDto,
  UpdateOrganizationOperationRequestDto,
  UpdateOrganizationStatusRequestDto,
  UpdateOrganizationRegistrationRequestDto,
} from '../dto/organization-request.dto';
import {
  OrganizationResponseDto,
  OrganizationOperationResponseDto,
  OrganizationStatusResponseDto,
  OrganizationRegistrationResponseDto,
} from '../dto/organization-response.dto';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequiresPermission } from '../../../common/decorators/requires-permission.decorator';
import type { Request } from 'express';

@ApiTags('Organizations')
@ApiBearerAuth('JWT-auth')
@Controller('organizations')
@UseGuards(AuthGuard, PermissionsGuard)
export class OrganizationController {
  constructor(private service: OrganizationService) {}

  @Post()
  @RequiresPermission('resource:create')
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiResponse({
    status: 201,
    description: 'Organization created successfully',
    type: OrganizationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid data' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiBody({ type: CreateOrganizationRequestDto })
  async create(@Body() dto: CreateOrganizationRequestDto, @Req() req: Request) {
    const user = req.user as { userId: string };
    const org = await this.service.create(dto, user.userId);
    return org;
  }

  @Get(':id')
  @RequiresPermission('resource:read')
  @ApiOperation({ summary: 'Get organization by ID' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({
    status: 200,
    description: 'Organization found',
    type: OrganizationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async findById(@Param('id') id: string) {
    const org = await this.service.findById(id);
    if (!org) throw new NotFoundException();
    return org;
  }

  @Put(':id')
  @RequiresPermission('resource:update')
  @ApiOperation({ summary: 'Update organization' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({
    status: 200,
    description: 'Organization updated successfully',
    type: OrganizationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiBody({ type: UpdateOrganizationRequestDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationRequestDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequiresPermission('resource:delete')
  @HttpCode(204)
  @ApiOperation({ summary: 'Soft delete organization' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({
    status: 204,
    description: 'Organization deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async delete(@Param('id') id: string) {
    return this.service.softDelete(id);
  }

  @Get()
  @RequiresPermission('resource:read')
  @ApiOperation({ summary: 'List organizations with optional filters' })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: ['INDIVIDUAL', 'NON_INDIVIDUAL'],
  })
  @ApiQuery({
    name: 'tax_classification',
    required: false,
    enum: ['VAT', 'NON_VAT'],
  })
  @ApiQuery({
    name: 'subcategory',
    required: false,
    enum: [
      'SELF_EMPLOYED',
      'SOLE_PROPRIETOR',
      'FREELANCER',
      'CORPORATION',
      'PARTNERSHIP',
      'OTHERS',
    ],
  })
  @ApiResponse({
    status: 200,
    description: 'List of organizations',
    type: [OrganizationResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async list(
    @Query()
    query: {
      category?: string;
      tax_classification?: string;
      subcategory?: string;
    },
  ) {
    return this.service.list(query);
  }

  @Get(':id/operation')
  @RequiresPermission('resource:read')
  @ApiOperation({ summary: 'Get organization operation details' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({
    status: 200,
    description: 'Organization operation details',
    type: OrganizationOperationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Organization or operation not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async getOperation(@Param('id') id: string) {
    const operation = await this.service.getOperationByOrgId(id);
    if (!operation) throw new NotFoundException();
    return operation;
  }

  @Put(':id/operation')
  @RequiresPermission('resource:update')
  @ApiOperation({ summary: 'Update organization operation details' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({
    status: 200,
    description: 'Organization operation updated successfully',
    type: OrganizationOperationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiBody({ type: UpdateOrganizationOperationRequestDto })
  async updateOperation(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationOperationRequestDto,
  ) {
    return this.service.updateOperation(id, dto);
  }

  @Get(':id/status')
  @RequiresPermission('resource:read')
  @ApiOperation({ summary: 'Get organization status details' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({
    status: 200,
    description: 'Organization status details',
    type: OrganizationStatusResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Organization or status not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async getStatus(@Param('id') id: string) {
    const status = await this.service.getStatusByOrgId(id);
    if (!status) throw new NotFoundException();
    return status;
  }

  @Put(':id/status')
  @RequiresPermission('resource:update')
  @ApiOperation({ summary: 'Update organization status details' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({
    status: 200,
    description: 'Organization status updated successfully',
    type: OrganizationStatusResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiBody({ type: UpdateOrganizationStatusRequestDto })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationStatusRequestDto,
    @Req() req: Request,
  ) {
    const user = req.user as { userId: string };
    return this.service.updateStatus(id, dto, user.userId);
  }

  @Patch(':id/status')
  @RequiresPermission('resource:update')
  @ApiOperation({ summary: 'Partially update organization status details' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({
    status: 200,
    description: 'Organization status updated successfully',
    type: OrganizationStatusResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiBody({ type: UpdateOrganizationStatusRequestDto })
  async patchStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationStatusRequestDto,
    @Req() req: Request,
  ) {
    const user = req.user as { userId: string };
    return this.service.updateStatus(id, dto, user.userId);
  }

  @Get(':id/registration')
  @RequiresPermission('resource:read')
  @ApiOperation({ summary: 'Get organization registration details' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({
    status: 200,
    description: 'Organization registration details',
    type: OrganizationRegistrationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Organization or registration not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async getRegistration(@Param('id') id: string) {
    const registration = await this.service.getRegistrationByOrgId(id);
    if (!registration) throw new NotFoundException();
    return registration;
  }

  @Put(':id/registration')
  @RequiresPermission('resource:update')
  @ApiOperation({ summary: 'Update organization registration details' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({
    status: 200,
    description: 'Organization registration updated successfully',
    type: OrganizationRegistrationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiBody({ type: UpdateOrganizationRegistrationRequestDto })
  async updateRegistration(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationRegistrationRequestDto,
  ) {
    return this.service.updateRegistration(id, dto);
  }

  @Patch(':id/registration')
  @RequiresPermission('resource:update')
  @ApiOperation({
    summary: 'Partially update organization registration details',
  })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({
    status: 200,
    description: 'Organization registration updated successfully',
    type: OrganizationRegistrationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiBody({ type: UpdateOrganizationRegistrationRequestDto })
  async patchRegistration(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationRegistrationRequestDto,
  ) {
    return this.service.updateRegistration(id, dto);
  }
}
