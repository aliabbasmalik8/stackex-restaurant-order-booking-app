import { Controller, Get } from '@nestjs/common';
import { BranchResponseDto } from './branch.dto';
import { BranchService } from './branch.service';

@Controller('branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Get()
  async list(): Promise<BranchResponseDto[]> {
    return this.branchService.findActive();
  }
}
