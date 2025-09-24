import { Module } from '@nestjs/common';
import { SchedulesController } from './controllers/schedules.controller';
import { SchedulesService } from './services/schedules.service';
import { SchedulesRepository } from './repositories/schedules.repository';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [SchedulesController],
  providers: [SchedulesService, SchedulesRepository, PrismaService],
})
export class SchedulesModule {}