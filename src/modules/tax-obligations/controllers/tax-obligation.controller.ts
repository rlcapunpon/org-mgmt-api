import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { TaxObligationService } from '../services/tax-obligation.service';
import { CreateTaxObligationDto } from '../dto/create-tax-obligation.dto';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequiresPermission } from '../../../common/decorators/requires-permission.decorator';

@Controller('tax-obligations')
export class TaxObligationController {
  constructor(private service: TaxObligationService) {}

  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequiresPermission('tax-obligation.create')
  async create(@Body() dto: CreateTaxObligationDto) {
    const obligation = await this.service.create(dto);
    return obligation;
  }

  @Get()
  async listActive() {
    return this.service.listActive();
  }
}