import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@shared/guards/auth.guard';
import { SuperAdminGuard } from '@shared/guards/super-admin.guard';
import { handleControllerError } from '@utils/order-booking.exception';
import { ProductResponseDto, UpsertProductDto } from './product.dto';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /** Guest catalog — available items only. */
  @Get()
  async list(
    @Query('branchId') branchId?: string,
  ): Promise<ProductResponseDto[]> {
    try {
      return await this.productService.findAvailable(branchId);
    } catch (error) {
      handleControllerError(error);
    }
  }

  /** Admin catalog — includes unavailable. */
  @Get('manage')
  @UseGuards(AuthGuard, SuperAdminGuard)
  async listAll(
    @Query('branchId') branchId?: string,
  ): Promise<ProductResponseDto[]> {
    try {
      return await this.productService.findAll(branchId);
    } catch (error) {
      handleControllerError(error);
    }
  }

  @Get(':id')
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductResponseDto> {
    try {
      return await this.productService.findById(id, false);
    } catch (error) {
      handleControllerError(error);
    }
  }

  @Post()
  @UseGuards(AuthGuard, SuperAdminGuard)
  async create(@Body() dto: UpsertProductDto): Promise<ProductResponseDto> {
    try {
      return await this.productService.create(dto);
    } catch (error) {
      handleControllerError(error);
    }
  }

  @Patch(':id')
  @UseGuards(AuthGuard, SuperAdminGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpsertProductDto,
  ): Promise<ProductResponseDto> {
    try {
      return await this.productService.update(id, dto);
    } catch (error) {
      handleControllerError(error);
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard, SuperAdminGuard)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    try {
      return await this.productService.remove(id);
    } catch (error) {
      handleControllerError(error);
    }
  }
}
