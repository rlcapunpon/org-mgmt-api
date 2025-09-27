import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationObligationRepository } from '../repositories/organization-obligation.repository';
import {
  OrganizationObligation,
  Prisma,
  OrganizationTaxObligationStatus,
} from '@prisma/client';

@Injectable()
export class OrganizationObligationService {
  constructor(private repo: OrganizationObligationRepository) {}

  async assignObligation(
    data: Prisma.OrganizationObligationCreateInput,
  ): Promise<OrganizationObligation> {
    return this.repo.create(data);
  }

  async getObligationsByOrgId(
    orgId: string,
  ): Promise<OrganizationObligation[]> {
    return this.repo.findByOrgId(orgId);
  }

  async updateStatus(
    id: string,
    status: OrganizationTaxObligationStatus,
  ): Promise<OrganizationObligation> {
    try {
      return await this.repo.update(id, { status });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2025') {
        throw new NotFoundException();
      }
      throw error;
    }
  }

  async findById(id: string): Promise<OrganizationObligation | null> {
    return this.repo.findById(id);
  }
}
