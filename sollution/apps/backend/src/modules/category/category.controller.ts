import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@shared/guards/auth.guard';
import { SuperAdminGuard } from '@shared/guards/super-admin.guard';
import { handleControllerError } from '@utils/order-booking.exception';
import {
  CategoryResponseDto,
  UpsertCategoryDto,
} from './category.dto';
import { CategoryService } from './category.service';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async list(): Promise<CategoryResponseDto[]> {
    try {
      return await this.categoryService.findAll();
    } catch (error) {
      handleControllerError(error);
    }
  }

  @Get(':id')
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CategoryResponseDto> {
    try {
      return await this.categoryService.findById(id);
    } catch (error) {
      handleControllerError(error);
    }
  }

  @Post()
  @UseGuards(AuthGuard, SuperAdminGuard)
  async create(@Body() dto: UpsertCategoryDto): Promise<CategoryResponseDto> {
    try {
      return await this.categoryService.create(dto);
    } catch (error) {
      handleControllerError(error);
    }
  }

  @Patch(':id')
  @UseGuards(AuthGuard, SuperAdminGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpsertCategoryDto,
  ): Promise<CategoryResponseDto> {
    try {
      return await this.categoryService.update(id, dto);
    } catch (error) {
      handleControllerError(error);
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard, SuperAdminGuard)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    try {
      return await this.categoryService.remove(id);
    } catch (error) {
      handleControllerError(error);
    }
  }
}
