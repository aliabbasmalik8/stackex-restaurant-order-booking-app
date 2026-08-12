import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@shared/guards/auth.guard';
import { SuperAdminGuard } from '@shared/guards/super-admin.guard';
import { BranchResponseDto, UpdateBranchDto } from './branch.dto';
import { BranchService } from './branch.service';

@Controller('branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  /** Guest / product pickers — active branches only. */
  @Get()
  async list(): Promise<BranchResponseDto[]> {
    return this.branchService.findActive();
  }

  /** Admin catalog — includes inactive. */
  @Get('manage')
  @UseGuards(AuthGuard, SuperAdminGuard)
  async listAll(): Promise<BranchResponseDto[]> {
    return this.branchService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard, SuperAdminGuard)
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BranchResponseDto> {
    return this.branchService.findById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, SuperAdminGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBranchDto,
  ): Promise<BranchResponseDto> {
    return this.branchService.update(id, dto);
  }
}
