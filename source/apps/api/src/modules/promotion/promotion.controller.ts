import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PromotionService } from './promotion.service';
import {
  CreatePromotionDto,
  UpdatePromotionDto,
  PromotionResponseDto,
  ValidatePromoDto,
  ValidatePromoResponseDto,
  PromotionListQueryDto,
} from './dto/promotion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetTenant } from '../../common/decorators/tenant.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Promotions')
@Controller()
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  // ==================== Admin Endpoints ====================

  @Post('admin/promotions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new promotion' })
  @ApiResponse({ status: 201, type: PromotionResponseDto })
  async createPromotion(
    @GetTenant() tenantId: string,
    @Body() dto: CreatePromotionDto,
  ): Promise<PromotionResponseDto> {
    return this.promotionService.createPromotion(tenantId, dto);
  }

  @Get('admin/promotions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all promotions' })
  async getPromotions(
    @GetTenant() tenantId: string,
    @Query() query: PromotionListQueryDto,
  ) {
    return this.promotionService.getPromotions(tenantId, query);
  }

  @Get('admin/promotions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single promotion' })
  @ApiParam({ name: 'id', description: 'Promotion ID' })
  @ApiResponse({ status: 200, type: PromotionResponseDto })
  async getPromotion(
    @GetTenant() tenantId: string,
    @Param('id') id: string,
  ): Promise<PromotionResponseDto> {
    return this.promotionService.getPromotion(tenantId, id);
  }

  @Put('admin/promotions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a promotion' })
  @ApiParam({ name: 'id', description: 'Promotion ID' })
  @ApiResponse({ status: 200, type: PromotionResponseDto })
  async updatePromotion(
    @GetTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePromotionDto,
  ): Promise<PromotionResponseDto> {
    return this.promotionService.updatePromotion(tenantId, id, dto);
  }

  @Delete('admin/promotions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a promotion (only if never used)' })
  @ApiParam({ name: 'id', description: 'Promotion ID' })
  @ApiResponse({ status: 200, description: 'Promotion deleted successfully' })
  async deletePromotion(
    @GetTenant() tenantId: string,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.promotionService.deletePromotion(tenantId, id);
    return { message: 'Promotion deleted successfully' };
  }

  // ==================== Customer Endpoints ====================

  @Post('checkout/validate-promo')
  @ApiOperation({ summary: 'Validate a promotion code at checkout' })
  @ApiQuery({ name: 'tenantId', description: 'Tenant ID' })
  @ApiResponse({ status: 200, type: ValidatePromoResponseDto })
  async validatePromoCode(
    @Query('tenantId') tenantId: string,
    @Body() dto: ValidatePromoDto,
  ): Promise<ValidatePromoResponseDto> {
    return this.promotionService.validatePromoCode(tenantId, dto);
  }
}
