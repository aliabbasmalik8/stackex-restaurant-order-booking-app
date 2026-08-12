import { Branch } from '@database/entities/Branch.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export type UpdateBranchContentInput = {
  name: string;
  nameArabic: string;
  address: string;
  addressArabic: string;
  etaMinutes: number;
  active: boolean;
  sortOrder: number;
};

@Injectable()
export class BranchDbService {
  constructor(
    @InjectRepository(Branch)
    private readonly branches: Repository<Branch>,
  ) {}

  async findById(id: string): Promise<Branch | null> {
    return this.branches.findOne({ where: { id } });
  }

  async listActiveOrdered(): Promise<Branch[]> {
    return this.branches.find({
      where: { active: true },
      order: { sort_order: 'ASC' },
    });
  }

  /** Admin manage — includes inactive. */
  async listAllOrdered(): Promise<Branch[]> {
    return this.branches.find({
      order: { sort_order: 'ASC' },
    });
  }

  async updateBranchContent(
    id: string,
    input: UpdateBranchContentInput,
  ): Promise<Branch | null> {
    const row = await this.findById(id);
    if (!row) return null;
    row.name = input.name;
    row.name_arabic = input.nameArabic;
    row.address = input.address;
    row.address_arabic = input.addressArabic;
    row.eta_minutes = input.etaMinutes;
    row.active = input.active;
    row.sort_order = input.sortOrder;
    return this.branches.save(row);
  }
}
