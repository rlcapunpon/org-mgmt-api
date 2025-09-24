import { Module } from '@nestjs/common';
import { OrganizationObligationController } from './controllers/organization-obligation.controller';
import { OrganizationObligationService } from './services/organization-obligation.service';
import { OrganizationObligationRepository } from './repositories/organization-obligation.repository';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OrganizationObligationController],
  providers: [OrganizationObligationService, OrganizationObligationRepository],
  exports: [OrganizationObligationService, OrganizationObligationRepository],
})
export class OrgObligationsModule {}