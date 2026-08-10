import { Controller, Get } from '@nestjs/common';
import { CategoryResponseDto } from './category.dto';
import { CategoryService } from './category.service';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async list(): Promise<CategoryResponseDto[]> {
    return this.categoryService.findAll();
  }
}
