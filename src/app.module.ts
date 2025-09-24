import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { TaxObligationsModule } from './modules/tax-obligations/tax-obligations.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [OrganizationsModule, TaxObligationsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
