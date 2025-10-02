import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OrganizationController } from './controllers/organization.controller';
import { OrganizationService } from './services/organization.service';
import { OrganizationRepository } from './repositories/organization.repository';
import { OrganizationSyncService } from '../../common/services/organization-sync.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [OrganizationController],
  providers: [OrganizationService, OrganizationRepository, OrganizationSyncService],
  exports: [OrganizationService, OrganizationRepository, OrganizationSyncService],
})
export class OrganizationsModule {}
