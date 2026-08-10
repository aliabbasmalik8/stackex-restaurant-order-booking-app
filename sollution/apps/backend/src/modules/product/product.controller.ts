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
    return this.productService.findAvailable(branchId);
  }

  /** Admin catalog — includes unavailable. */
  @Get('manage')
  @UseGuards(AuthGuard, SuperAdminGuard)
  async listAll(
    @Query('branchId') branchId?: string,
  ): Promise<ProductResponseDto[]> {
    return this.productService.findAll(branchId);
  }

  @Get(':id')
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductResponseDto> {
    return this.productService.findById(id, false);
  }

  @Post()
  @UseGuards(AuthGuard, SuperAdminGuard)
  async create(@Body() dto: UpsertProductDto): Promise<ProductResponseDto> {
    return this.productService.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, SuperAdminGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpsertProductDto,
  ): Promise<ProductResponseDto> {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, SuperAdminGuard)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.productService.remove(id);
  }
}
