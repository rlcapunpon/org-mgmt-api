import { Injectable } from '@nestjs/common';
import { TaxObligationRepository } from '../repositories/tax-obligation.repository';
import { TaxObligation, Prisma } from '../../../../generated/prisma';

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