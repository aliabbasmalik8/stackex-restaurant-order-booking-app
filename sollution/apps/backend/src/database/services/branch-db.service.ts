import { Branch } from '@database/entities/Branch.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
}
