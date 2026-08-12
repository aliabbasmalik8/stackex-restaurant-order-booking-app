import { Branch } from '@database/entities/Branch.model';
import { BranchDbService } from '@database/services/branch-db.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { OrderBookingException } from '@utils/order-booking.exception';
import { BranchResponseDto, UpdateBranchDto } from './branch.dto';

const BRANCH_NOT_FOUND: ConstructorParameters<
  typeof OrderBookingException
>[0]['user_error_detail'] = {
  english: 'Branch not found.',
  arabic: 'الفرع غير موجود.',
};

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
    if (!row) {
      throw new OrderBookingException({
        error_detail: `Branch ${id} not found`,
        user_error_detail: BRANCH_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    return this.map(row);
  }

  async update(id: string, dto: UpdateBranchDto): Promise<BranchResponseDto> {
    const row = await this.branchDb.findById(id);
    if (!row) {
      throw new OrderBookingException({
        error_detail: `Branch ${id} not found before update`,
        user_error_detail: BRANCH_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

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
    if (!saved) {
      throw new OrderBookingException({
        error_detail: `Branch ${id} missing after updateBranchContent`,
        user_error_detail: BRANCH_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
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
