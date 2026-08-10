import { Category } from '@database/entities/Category.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryResponseDto } from './category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async findAll(): Promise<CategoryResponseDto[]> {
    const rows = await this.categoryRepo.find({
      order: { sort_order: 'ASC' },
    });
    return rows.map((row) => this.map(row));
  }

  private map(row: Category): CategoryResponseDto {
    return {
      id: row.id,
      label: row.label,
      label_arabic: row.label_arabic,
      sortOrder: row.sort_order,
    };
  }
}
