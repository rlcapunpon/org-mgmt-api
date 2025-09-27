import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationObligationRepository } from '../repositories/organization-obligation.repository';
import { OrganizationTaxObligationHistoryRepository } from '../repositories/organization-tax-obligation-history.repository';
import {
  OrganizationObligation,
  Prisma,
  OrganizationTaxObligationStatus,
} from '@prisma/client';

@Injectable()
export class OrganizationObligationService {
  constructor(
    private repo: OrganizationObligationRepository,
    private historyRepo: OrganizationTaxObligationHistoryRepository,
  ) {}

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
    updatedBy: string,
    description?: string,
  ): Promise<OrganizationObligation> {
    // First, find the current obligation to get the previous status
    const currentObligation = await this.repo.findById(id);
    if (!currentObligation) {
      throw new NotFoundException('Obligation not found');
    }

    // Create history record
    await this.historyRepo.createHistory({
      org_obligation_id: id,
      prev_status: currentObligation.status,
      new_status: status,
      desc: description,
      updated_by: updatedBy,
    });

    // Update the obligation status
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
