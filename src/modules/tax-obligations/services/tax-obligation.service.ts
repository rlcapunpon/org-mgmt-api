import { Injectable } from '@nestjs/common';
import { TaxObligationRepository } from '../repositories/tax-obligation.repository';
import type { TaxObligation, Prisma } from '@prisma/client';

@Injectable()
export class TaxObligationService {
  constructor(private repo: TaxObligationRepository) {}

  async create(data: Prisma.TaxObligationCreateInput): Promise<TaxObligation> {
    return this.repo.create(data);
  }

  async listActive(): Promise<TaxObligation[]> {
    return this.repo.listActive();
  }
}
