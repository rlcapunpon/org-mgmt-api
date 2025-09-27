import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';
import { OrganizationOwnerRepository } from '../organization-owners/repositories/organization-owner.repository';
import { OrganizationObligationRepository } from '../org-obligations/repositories/organization-obligation.repository';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    OrganizationOwnerRepository,
    OrganizationObligationRepository,
  ],
  exports: [UserService],
})
export class UserModule {}
