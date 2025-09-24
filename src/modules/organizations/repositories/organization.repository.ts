import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Organization } from '../../../../generated/prisma';

@Injectable()
export class OrganizationRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Omit<Organization, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<Organization> {
    if (!data.name || !data.category || !data.tax_classification) {
      throw new Error('Required fields missing');
    }
    return this.prisma.organization.create({
      data: {
        ...data,
        deleted_at: null,
        status: {
          create: {
            status: 'PENDING',
          },
        },
        operation: {
          create: {
            fy_start: new Date(new Date().getFullYear(), 0, 1), // January 1st of current year
            fy_end: new Date(new Date().getFullYear(), 11, 31), // December 31st of current year
            vat_reg_effectivity: new Date(new Date().getFullYear(), 0, 1),
            registration_effectivity: new Date(new Date().getFullYear(), 0, 1),
            payroll_cut_off: ['15/30'],
            payment_cut_off: ['15/30'],
            quarter_closing: ['03/31', '06/30', '09/30', '12/31'],
            has_foreign: false,
            accounting_method: 'ACCRUAL',
          },
        },
      },
      include: {
        status: true,
        operation: true,
      },
    });
  }

  async getById(id: string): Promise<Organization | null> {
    return this.prisma.organization.findUnique({
      where: { id },
      include: {
        status: true,
      },
    });
  }

  async getByIdBasic(id: string): Promise<Organization | null> {
    return this.prisma.organization.findUnique({
      where: { id },
      include: {
        status: true,
      },
    });
  }

  async getOperationByOrgId(id: string) {
    return this.prisma.organizationOperation.findUnique({
      where: { organization_id: id },
    });
  }

  async update(id: string, data: Partial<Omit<Organization, 'id' | 'created_at' | 'updated_at'>>): Promise<Organization> {
    return this.prisma.organization.update({
      where: { id },
      data: {
        ...data,
        status: {
          update: {
            last_update: new Date(),
          },
        },
      },
      include: {
        status: true,
      },
    });
  }

  async updateBasic(id: string, data: Partial<Omit<Organization, 'id' | 'created_at' | 'updated_at'>>): Promise<Organization> {
    return this.prisma.organization.update({
      where: { id },
      data: {
        ...data,
        status: {
          update: {
            last_update: new Date(),
          },
        },
      },
      include: {
        status: true,
      },
    });
  }

  async updateOperation(id: string, data: any) {
    return this.prisma.organizationOperation.update({
      where: { organization_id: id },
      data: {
        ...data,
        last_update: new Date(),
      },
    });
  }

  async softDelete(id: string): Promise<Organization> {
    return this.prisma.organization.update({ where: { id }, data: { deleted_at: new Date() } });
  }

  async list(filters?: { category?: string; tax_classification?: string }): Promise<Organization[]> {
    const where = {
      deleted_at: null,
      ...(filters?.category && { category: filters.category as any }),
      ...(filters?.tax_classification && { tax_classification: filters.tax_classification as any }),
    };
    return this.prisma.organization.findMany({
      where,
      include: {
        status: true,
      },
    });
  }

  async listBasic(filters?: { category?: string; tax_classification?: string }): Promise<Organization[]> {
    const where = {
      deleted_at: null,
      ...(filters?.category && { category: filters.category as any }),
      ...(filters?.tax_classification && { tax_classification: filters.tax_classification as any }),
    };
    return this.prisma.organization.findMany({
      where,
      include: {
        status: true,
      },
    });
  }
}