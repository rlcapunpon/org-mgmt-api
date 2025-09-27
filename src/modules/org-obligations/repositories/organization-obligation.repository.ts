import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { OrganizationObligation, Prisma } from '@prisma/client';

@Injectable()
export class OrganizationObligationRepository {
  constructor(private prisma: PrismaService) {}

  async create(
    data: Prisma.OrganizationObligationCreateInput,
  ): Promise<OrganizationObligation> {
    if (
      !data.organization?.connect?.id ||
      !data.obligation?.connect?.id ||
      !data.start_date
    ) {
      throw new Error('Required fields missing');
    }
    return this.prisma.organizationObligation.create({ data });
  }

  async findByOrgId(orgId: string): Promise<OrganizationObligation[]> {
    return this.prisma.organizationObligation.findMany({
      where: { organization_id: orgId },
      include: { obligation: true },
    });
  }

  async update(
    id: string,
    data: Prisma.OrganizationObligationUpdateInput,
  ): Promise<OrganizationObligation> {
    return this.prisma.organizationObligation.update({ where: { id }, data });
  }

  async findById(id: string): Promise<OrganizationObligation | null> {
    return this.prisma.organizationObligation.findUnique({
      where: { id },
      include: { obligation: true, organization: true },
    });
  }

  async countObligationsDueWithinDays(days: number): Promise<number> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.obligationSchedule.count({
      where: {
        due_date: {
          lte: futureDate,
          gte: new Date(),
        },
        status: {
          in: ['DUE', 'LATE'], // Only count obligations that are still due or late
        },
      },
    });
  }

  async countTotalObligations(): Promise<number> {
    return this.prisma.organizationObligation.count();
  }
}
