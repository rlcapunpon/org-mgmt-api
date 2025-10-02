import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { TaxObligationsModule } from './modules/tax-obligations/tax-obligations.module';
import { OrgObligationsModule } from './modules/org-obligations/org-obligations.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { OrganizationOwnersModule } from './modules/organization-owners/organization-owners.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './modules/users/user.module';

@Module({
  imports: [
    HttpModule,
    OrganizationsModule,
    TaxObligationsModule,
    OrgObligationsModule,
    SchedulesModule,
    OrganizationOwnersModule,
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
