import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { OrganizationOwnerRepository } from '../repositories/organization-owner.repository';
import { AssignOrganizationOwnerRequestDto } from '../dto/organization-owner.dto';
import { OrganizationOwner } from '@prisma/client';
import { RbacUtilityService } from '../../../common/services/rbac-utility.service';

@Injectable()
export class OrganizationOwnerService {
  constructor(
    private repo: OrganizationOwnerRepository,
    private rbacUtilityService: RbacUtilityService,
  ) {}

  async assignOwner(
    data: AssignOrganizationOwnerRequestDto,
    jwtToken?: string,
  ): Promise<OrganizationOwner> {
    try {
      // Check if user is already an owner
      const isAlreadyOwner = await this.repo.isOwner(data.org_id, data.user_id);
      if (isAlreadyOwner) {
        throw new ConflictException(
          'User is already an owner of this organization',
        );
      }

      const owner = await this.repo.assignOwner(data);

      // Call RBAC API to assign SUPERADMIN role if JWT token is provided
      if (jwtToken) {
        try {
          // Get available roles to find SUPERADMIN roleId
          const availableRoles = await this.rbacUtilityService.getAvailableRoles(jwtToken);
          const superAdminRole = availableRoles.find((role: any) => role.name === 'SUPERADMIN');

          if (superAdminRole) {
            await this.rbacUtilityService.assignRole(
              data.user_id,
              superAdminRole.id,
              data.org_id,
              jwtToken,
            );
          } else {
            console.warn('SUPERADMIN role not found in available roles');
          }
        } catch (error) {
          // Log the error but don't fail the owner assignment
          console.error('Failed to assign SUPERADMIN role in RBAC API:', error);
        }
      }

      return owner;
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        // Unique constraint violation
        throw new ConflictException('User is already assigned as owner');
      }
      throw error;
    }
  }

  async getOwnersByOrgId(orgId: string): Promise<OrganizationOwner[]> {
    return this.repo.getOwnersByOrgId(orgId);
  }

  async isOwner(orgId: string, userId: string): Promise<boolean> {
    return this.repo.isOwner(orgId, userId);
  }

  async checkOwnership(
    orgId: string,
    userId: string,
  ): Promise<{ is_owner: boolean; org_id: string; user_id: string }> {
    const isOwner = await this.repo.isOwner(orgId, userId);
    return {
      is_owner: isOwner,
      org_id: orgId,
      user_id: userId,
    };
  }

  async removeOwner(orgId: string, userId: string, jwtToken?: string): Promise<OrganizationOwner> {
    try {
      const owner = await this.repo.removeOwner(orgId, userId);

      // Call RBAC API to revoke SUPERADMIN role if JWT token is provided
      if (jwtToken) {
        try {
          // Get available roles to find SUPERADMIN roleId
          const availableRoles = await this.rbacUtilityService.getAvailableRoles(jwtToken);
          const superAdminRole = availableRoles.find((role: any) => role.name === 'SUPERADMIN');

          if (superAdminRole) {
            await this.rbacUtilityService.revokeRole(
              userId,
              superAdminRole.id,
              orgId,
              jwtToken,
            );
          } else {
            console.warn('SUPERADMIN role not found in available roles');
          }
        } catch (error) {
          // Log the error but don't fail the owner removal
          console.error('Failed to revoke SUPERADMIN role in RBAC API:', error);
        }
      }

      return owner;
    } catch (error) {
      if ((error as { code?: string }).code === 'P2025') {
        // Record not found
        throw new NotFoundException('Owner assignment not found');
      }
      throw error;
    }
  }

  async removeOwnerById(id: string): Promise<OrganizationOwner> {
    try {
      return await this.repo.removeOwnerById(id);
    } catch (error) {
      if ((error as { code?: string }).code === 'P2025') {
        // Record not found
        throw new NotFoundException('Owner assignment not found');
      }
      throw error;
    }
  }

  async updateLastUpdate(
    orgId: string,
    userId: string,
  ): Promise<OrganizationOwner> {
    try {
      return await this.repo.updateLastUpdate(orgId, userId);
    } catch (error) {
      if ((error as { code?: string }).code === 'P2025') {
        // Record not found
        throw new NotFoundException('Owner assignment not found');
      }
      throw error;
    }
  }

  async getOwnerById(id: string): Promise<OrganizationOwner | null> {
    return this.repo.getOwnerById(id);
  }
}
