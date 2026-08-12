import { Branch } from '@database/entities/Branch.model';
import { BranchDbService } from '@database/services/branch-db.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BranchResponseDto, UpdateBranchDto } from './branch.dto';

@Injectable()
export class BranchService {
  constructor(private readonly branchDb: BranchDbService) {}

  async findActive(): Promise<BranchResponseDto[]> {
    const rows = await this.branchDb.listActiveOrdered();
    return rows.map((row) => this.map(row));
  }

  /** Admin — includes inactive branches. */
  async findAll(): Promise<BranchResponseDto[]> {
    const rows = await this.branchDb.listAllOrdered();
    return rows.map((row) => this.map(row));
  }

  async findById(id: string): Promise<BranchResponseDto> {
    const row = await this.branchDb.findById(id);
    if (!row) throw new NotFoundException('Branch not found.');
    return this.map(row);
  }

  async update(id: string, dto: UpdateBranchDto): Promise<BranchResponseDto> {
    const row = await this.branchDb.findById(id);
    if (!row) throw new NotFoundException('Branch not found.');

    const saved = await this.branchDb.updateBranchContent(id, {
      name: dto.name.trim(),
      nameArabic: dto.name_arabic.trim(),
      address: dto.address?.trim() ?? row.address,
      addressArabic: dto.address_arabic?.trim() ?? row.address_arabic,
      etaMinutes:
        dto.etaMinutes !== undefined ? dto.etaMinutes : row.eta_minutes,
      active: dto.active !== undefined ? dto.active : row.active,
      sortOrder: dto.sortOrder !== undefined ? dto.sortOrder : row.sort_order,
    });
    if (!saved) throw new NotFoundException('Branch not found.');
    return this.map(saved);
  }

  private map(row: Branch): BranchResponseDto {
    return {
      id: row.id,
      slug: row.slug,
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
