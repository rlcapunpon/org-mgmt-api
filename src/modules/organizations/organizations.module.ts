import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OrganizationController } from './controllers/organization.controller';
import { OrganizationService } from './services/organization.service';
import { OrganizationRepository } from './repositories/organization.repository';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [OrganizationController],
  providers: [OrganizationService, OrganizationRepository],
  exports: [OrganizationService, OrganizationRepository],
})
export class OrganizationsModule {}
