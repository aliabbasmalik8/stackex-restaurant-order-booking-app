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
import { handleControllerError } from '@utils/order-booking.exception';
import { BranchResponseDto, UpdateBranchDto } from './branch.dto';
import { BranchService } from './branch.service';

@Controller('branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  /** Guest / product pickers — active branches only. */
  @Get()
  async list(): Promise<BranchResponseDto[]> {
    try {
      return await this.branchService.findActive();
    } catch (error) {
      handleControllerError(error);
    }
  }

  /** Admin catalog — includes inactive. */
  @Get('manage')
  @UseGuards(AuthGuard, SuperAdminGuard)
  async listAll(): Promise<BranchResponseDto[]> {
    try {
      return await this.branchService.findAll();
    } catch (error) {
      handleControllerError(error);
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard, SuperAdminGuard)
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BranchResponseDto> {
    try {
      return await this.branchService.findById(id);
    } catch (error) {
      handleControllerError(error);
    }
  }

  @Patch(':id')
  @UseGuards(AuthGuard, SuperAdminGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBranchDto,
  ): Promise<BranchResponseDto> {
    try {
      return await this.branchService.update(id, dto);
    } catch (error) {
      handleControllerError(error);
    }
  }
}
