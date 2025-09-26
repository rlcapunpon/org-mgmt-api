import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationRepository } from '../repositories/organization.repository';
import { CreateOrganizationRequestDto, UpdateOrganizationRequestDto, UpdateOrganizationOperationRequestDto, UpdateOrganizationStatusRequestDto, UpdateOrganizationRegistrationRequestDto } from '../dto/organization-request.dto';
import { Organization } from '@prisma/client';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrganizationService {
  constructor(private repo: OrganizationRepository) {}

  async create(data: CreateOrganizationRequestDto, userId: string): Promise<Organization> {
    // Transform undefined subcategory to null for database compatibility
    const transformedData = {
      ...data,
      subcategory: data.subcategory ?? null,
      update_by: userId,
    };
    return this.repo.create(transformedData);
  }

  async findById(id: string): Promise<Organization | null> {
    return this.repo.getByIdBasic(id);
  }

  async findByIdWithOperation(id: string): Promise<Organization | null> {
    return this.repo.getById(id);
  }

  async update(id: string, data: UpdateOrganizationRequestDto): Promise<Organization> {
    try {
      // Transform undefined subcategory to null for database compatibility
      const transformedData = {
        ...data,
        subcategory: data.subcategory ?? null,
      };
      return await this.repo.updateBasic(id, transformedData);
    } catch (error) {
      if (error.code === 'P2025') { // Record not found
        throw new NotFoundException();
      }
      throw error;
    }
  }

  async softDelete(id: string): Promise<void> {
    try {
      await this.repo.softDelete(id);
    } catch (error) {
      if (error.code === 'P2025') { // Record not found
        throw new NotFoundException();
      }
      throw error;
    }
  }

  async list(filters: { category?: string; tax_classification?: string }): Promise<Organization[]> {
    return this.repo.listBasic(filters);
  }

  async getOperationByOrgId(id: string) {
    return this.repo.getOperationByOrgId(id);
  }

  async updateOperation(id: string, data: UpdateOrganizationOperationRequestDto) {
    return this.repo.updateOperation(id, data);
  }

  async getStatusByOrgId(id: string) {
    try {
      return await this.repo.getStatusByOrgId(id);
    } catch (error) {
      if (error.code === 'P2025') { // Record not found
        throw new NotFoundException();
      }
      throw error;
    }
  }

  async updateStatus(id: string, data: UpdateOrganizationStatusRequestDto, userId: string) {
    try {
      // Update the status
      const result = await this.repo.updateStatus(id, { status: data.status });

      // Create status change reason record
      await this.repo.createStatusChangeReason({
        organization_id: id,
        reason: data.reason,
        description: data.description,
        updated_by: userId,
      });

      return result;
    } catch (error) {
      if (error.code === 'P2025') { // Record not found
        throw new NotFoundException();
      }
      throw error;
    }
  }

  async getRegistrationByOrgId(id: string) {
    try {
      return await this.repo.getRegistrationByOrgId(id);
    } catch (error) {
      if (error.code === 'P2025') { // Record not found
        throw new NotFoundException();
      }
      throw error;
    }
  }

  async updateRegistration(id: string, data: UpdateOrganizationRegistrationRequestDto) {
    try {
      return await this.repo.updateRegistration(id, data);
    } catch (error) {
      if (error.code === 'P2025') { // Record not found
        throw new NotFoundException();
      }
      throw error;
    }
  }
}
