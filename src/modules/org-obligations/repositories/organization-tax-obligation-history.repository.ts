import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { OrganizationTaxObligationHistory, OrganizationTaxObligationStatus } from '@prisma/client';

interface CreateHistoryData {
  org_obligation_id: string;
  prev_status: OrganizationTaxObligationStatus;
  new_status: OrganizationTaxObligationStatus;
  desc?: string;
  updated_by: string;
}

@Injectable()
export class OrganizationTaxObligationHistoryRepository {
  constructor(private prisma: PrismaService) {}

  async createHistory(data: CreateHistoryData): Promise<OrganizationTaxObligationHistory> {
    if (!data.org_obligation_id || !data.prev_status || !data.new_status || !data.updated_by) {
      throw new Error('Required fields missing');
    }

    return this.prisma.organizationTaxObligationHistory.create({
      data: {
        org_obligation_id: data.org_obligation_id,
        prev_status: data.prev_status,
        new_status: data.new_status,
        desc: data.desc,
        updated_by: data.updated_by,
      },
    });
  }

  async findByOrgObligationId(orgObligationId: string): Promise<OrganizationTaxObligationHistory[]> {
    return this.prisma.organizationTaxObligationHistory.findMany({
      where: { org_obligation_id: orgObligationId },
      orderBy: { updated_at: 'desc' },
    });
  }

  async findById(id: string): Promise<OrganizationTaxObligationHistory | null> {
    return this.prisma.organizationTaxObligationHistory.findUnique({
      where: { id },
    });
  }
}