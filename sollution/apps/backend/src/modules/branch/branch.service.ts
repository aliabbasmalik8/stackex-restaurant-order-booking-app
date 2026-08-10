import { Branch } from '@database/entities/Branch.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BranchResponseDto } from './branch.dto';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
  ) {}

  async findActive(): Promise<BranchResponseDto[]> {
    const rows = await this.branchRepo.find({
      where: { active: true },
      order: { sort_order: 'ASC' },
    });
    return rows.map((row) => this.map(row));
  }

  private map(row: Branch): BranchResponseDto {
    return {
      id: row.id,
      name: row.name,
      name_arabic: row.name_arabic,
      address: row.address,
      address_arabic: row.address_arabic,
      etaMinutes: row.eta_minutes,
      active: row.active,
      sortOrder: row.sort_order,
    };
  }
}
