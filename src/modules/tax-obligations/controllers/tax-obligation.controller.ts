import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { TaxObligationService } from '../services/tax-obligation.service';
import { CreateTaxObligationRequestDto } from '../dto/create-tax-obligation.dto';
import { TaxObligationResponseDto } from '../dto/tax-obligation-response.dto';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequiresPermission } from '../../../common/decorators/requires-permission.decorator';

@ApiTags('Tax Obligations')
@ApiBearerAuth('JWT-auth')
@Controller('tax-obligations')
export class TaxObligationController {
  constructor(private service: TaxObligationService) {}

  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequiresPermission('tax:configure')
  @ApiOperation({ summary: 'Create a new tax obligation' })
  @ApiResponse({
    status: 201,
    description: 'Tax obligation created successfully',
    type: TaxObligationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid data' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiBody({ type: CreateTaxObligationRequestDto })
  async create(@Body() dto: CreateTaxObligationRequestDto) {
    const obligation = await this.service.create(dto);
    return obligation;
  }

  @Get()
  @ApiOperation({ summary: 'List active tax obligations' })
  @ApiResponse({
    status: 200,
    description: 'List of active tax obligations',
    type: [TaxObligationResponseDto],
  })
  async listActive() {
    return this.service.listActive();
  }
}
