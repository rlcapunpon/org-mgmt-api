import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationRepository } from '../repositories/organization.repository';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { Organization } from '../../../../generated/prisma';
import { Prisma } from '../../../../generated/prisma';

@Injectable()
export class OrganizationService {
  constructor(private repo: OrganizationRepository) {}

  async create(data: CreateOrganizationDto): Promise<Organization> {
    return this.repo.create(data);
  }

  async findById(id: string): Promise<Organization | null> {
    return this.repo.getById(id);
  }

  async update(id: string, data: UpdateOrganizationDto): Promise<Organization> {
    try {
      return await this.repo.update(id, data);
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
    return this.repo.list(filters);
  }
}