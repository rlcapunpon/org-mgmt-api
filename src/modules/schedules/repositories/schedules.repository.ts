import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { OrganizationObligation } from '../../../../generated/prisma';

@Injectable()
export class SchedulesRepository {
  constructor(private prisma: PrismaService) {}

  async getOrganizationObligationsWithTaxObligations(organizationId: string): Promise<OrganizationObligation[]> {
    return this.prisma.organizationObligation.findMany({
      where: {
        organization_id: organizationId,
        status: 'ACTIVE',
      },
      include: {
        obligation: true,
        organization: true,
      },
    });
  }
}