import { Branch } from '@database/entities/Branch.model';
import { BranchDbService } from '@database/services/branch-db.service';
import { Injectable } from '@nestjs/common';
import { BranchResponseDto } from './branch.dto';

@Injectable()
export class BranchService {
  constructor(private readonly branchDb: BranchDbService) {}

  async findActive(): Promise<BranchResponseDto[]> {
    const rows = await this.branchDb.listActiveOrdered();
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
