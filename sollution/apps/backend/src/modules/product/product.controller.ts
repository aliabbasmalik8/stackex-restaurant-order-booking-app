import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ProductResponseDto } from './product.dto';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async list(
    @Query('branchId') branchId?: string,
  ): Promise<ProductResponseDto[]> {
    return this.productService.findAvailable(branchId);
  }

  @Get(':id')
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductResponseDto> {
    return this.productService.findById(id);
  }
}
