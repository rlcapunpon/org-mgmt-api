import { Module } from '@nestjs/common';
import { TaxObligationController } from './controllers/tax-obligation.controller';
import { TaxObligationService } from './services/tax-obligation.service';
import { TaxObligationRepository } from './repositories/tax-obligation.repository';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TaxObligationController],
  providers: [TaxObligationService, TaxObligationRepository],
  exports: [TaxObligationService, TaxObligationRepository],
})
export class TaxObligationsModule {}