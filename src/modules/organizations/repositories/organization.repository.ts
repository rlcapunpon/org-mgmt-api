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
      },
      include: {
        status: true,
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
}