import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import type { TaxObligation, Prisma } from '@prisma/client';

@Injectable()
export class TaxObligationRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.TaxObligationCreateInput): Promise<TaxObligation> {
    if (!data.code || !data.name || !data.frequency || !data.due_rule) {
      throw new Error('Required fields missing');
    }
    return this.prisma.taxObligation.create({ data });
  }

  async listActive(): Promise<TaxObligation[]> {
    return this.prisma.taxObligation.findMany({ where: { active: true } });
  }
}
