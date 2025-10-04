import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { OrganizationOwnerService } from '../services/organization-owner.service';
import {
  AssignOrganizationOwnerRequestDto,
  OrganizationOwnerResponseDto,
  OrganizationOwnerListResponseDto,
  CheckOwnershipResponseDto,
} from '../dto/organization-owner.dto';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { SuperAdminGuard } from '../../../common/guards/super-admin.guard';
import type { Request } from 'express';

@ApiTags('Organization Owners')
@ApiBearerAuth('JWT-auth')
@Controller('organizations')
@UseGuards(AuthGuard)
export class OrganizationOwnerController {
  constructor(private service: OrganizationOwnerService) {}

  @Post(':orgId/owners')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Assign owner to organization' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiResponse({
    status: 201,
    description: 'Owner assigned successfully',
    type: OrganizationOwnerResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Super admin access required',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - User is already an owner',
  })
  async assignOwner(
    @Param('orgId') orgId: string,
    @Body() dto: AssignOrganizationOwnerRequestDto,
    @Req() req: Request,
  ) {
    // Validate that the orgId in param matches the one in body
    if (dto.org_id !== orgId) {
      throw new Error('Organization ID mismatch');
    }

    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.service.assignOwner(dto, token);
  }

  @Get(':orgId/owners')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Get all owners of an organization' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiResponse({
    status: 200,
    description: 'List of organization owners',
    type: OrganizationOwnerListResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Super admin access required',
  })
  async getOwnersByOrgId(@Param('orgId') orgId: string) {
    const owners = await this.service.getOwnersByOrgId(orgId);
    return { owners };
  }

  @Delete(':orgId/owners/:userId')
  @UseGuards(SuperAdminGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Remove owner from organization' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'userId', description: 'User ID to remove as owner' })
  @ApiResponse({
    status: 200,
    description: 'Owner removed successfully',
    type: OrganizationOwnerResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Super admin access required',
  })
  @ApiResponse({ status: 404, description: 'Owner assignment not found' })
  async removeOwner(
    @Param('orgId') orgId: string,
    @Param('userId') userId: string,
    @Req() req: Request,
  ) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.service.removeOwner(orgId, userId, token);
  }

  @Delete('owners/:id')
  @UseGuards(SuperAdminGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Remove owner assignment by ID' })
  @ApiParam({ name: 'id', description: 'Owner assignment ID' })
  @ApiResponse({
    status: 200,
    description: 'Owner assignment removed successfully',
    type: OrganizationOwnerResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Super admin access required',
  })
  @ApiResponse({ status: 404, description: 'Owner assignment not found' })
  async removeOwnerById(@Param('id') id: string) {
    return await this.service.removeOwnerById(id);
  }

  @Get(':orgId/ownership')
  @ApiOperation({ summary: 'Check if current user is owner of organization' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiResponse({
    status: 200,
    description: 'Ownership check result',
    type: CheckOwnershipResponseDto,
  })
  async checkOwnership(@Param('orgId') orgId: string, @Req() req: Request) {
    const user = req.user as {
      userId: string;
      isSuperAdmin?: boolean;
      role?: string;
    };
    const userId = user.userId;

    // Super admin is always considered an owner
    if (user.isSuperAdmin || user.role === 'Super Admin') {
      return {
        is_owner: true,
        org_id: orgId,
        user_id: userId,
      };
    }

    return await this.service.checkOwnership(orgId, userId);
  }
}
