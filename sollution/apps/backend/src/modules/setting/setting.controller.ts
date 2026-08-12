import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@shared/guards/auth.guard';
import { SuperAdminGuard } from '@shared/guards/super-admin.guard';
import { handleControllerError } from '@utils/order-booking.exception';
import {
  PublicSettingsDto,
  SettingItemDto,
  UpdateSettingDto,
} from './setting.dto';
import { SettingService } from './setting.service';

@Controller('settings')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  /** Mobile / guest — shaped public settings (nested dial). */
  @Get('public')
  async getPublic(): Promise<PublicSettingsDto> {
    try {
      return await this.settingService.getPublic();
    } catch (error) {
      handleControllerError(error);
    }
  }

  /** Admin — all settings with resolved values + override flags. */
  @Get()
  @UseGuards(AuthGuard, SuperAdminGuard)
  async listAll(): Promise<SettingItemDto[]> {
    try {
      return await this.settingService.listAll();
    } catch (error) {
      handleControllerError(error);
    }
  }

  /**
   * Admin — upsert setting value.
   * Scalars replace; JSON objects merge with the current value then validate
   * (so `dial` can be patched with `{ "code": "+1" }` or a full object).
   */
  @Patch(':key')
  @UseGuards(AuthGuard, SuperAdminGuard)
  async update(
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
  ): Promise<SettingItemDto> {
    try {
      return await this.settingService.update(key, dto.value);
    } catch (error) {
      handleControllerError(error);
    }
  }
}
