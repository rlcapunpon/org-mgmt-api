import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [OrganizationsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
