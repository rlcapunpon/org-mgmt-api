import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OrganizationOwnerController } from './controllers/organization-owner.controller';
import { OrganizationOwnerService } from './services/organization-owner.service';
import { OrganizationOwnerRepository } from './repositories/organization-owner.repository';
import { RbacUtilityService } from '../../common/services/rbac-utility.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [OrganizationOwnerController],
  providers: [OrganizationOwnerService, OrganizationOwnerRepository, RbacUtilityService],
  exports: [OrganizationOwnerService],
})
export class OrganizationOwnersModule {}
