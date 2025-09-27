import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { OrganizationOwnerRepository } from '../repositories/organization-owner.repository';
import { AssignOrganizationOwnerRequestDto } from '../dto/organization-owner.dto';
import { OrganizationOwner } from '@prisma/client';

@Injectable()
export class OrganizationOwnerService {
  constructor(private repo: OrganizationOwnerRepository) {}

  async assignOwner(
    data: AssignOrganizationOwnerRequestDto,
  ): Promise<OrganizationOwner> {
    try {
      // Check if user is already an owner
      const isAlreadyOwner = await this.repo.isOwner(data.org_id, data.user_id);
      if (isAlreadyOwner) {
        throw new ConflictException(
          'User is already an owner of this organization',
        );
      }

      return await this.repo.assignOwner(data);
    } catch (error) {
      if (error.code === 'P2002') {
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

  async removeOwner(orgId: string, userId: string): Promise<OrganizationOwner> {
    try {
      return await this.repo.removeOwner(orgId, userId);
    } catch (error) {
      if (error.code === 'P2025') {
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
      if (error.code === 'P2025') {
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
      if (error.code === 'P2025') {
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
