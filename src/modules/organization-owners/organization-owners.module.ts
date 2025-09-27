import { Module } from '@nestjs/common';
import { OrganizationOwnerController } from './controllers/organization-owner.controller';
import { OrganizationOwnerService } from './services/organization-owner.service';
import { OrganizationOwnerRepository } from './repositories/organization-owner.repository';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OrganizationOwnerController],
  providers: [OrganizationOwnerService, OrganizationOwnerRepository],
  exports: [OrganizationOwnerService],
})
export class OrganizationOwnersModule {}
