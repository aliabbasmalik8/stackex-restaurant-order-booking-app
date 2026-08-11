import { AppSetting } from '@database/entities/AppSetting.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SettingDbService {
  constructor(
    @InjectRepository(AppSetting)
    private readonly settings: Repository<AppSetting>,
  ) {}

  /** All override rows (catalog defaults live in code, not here). */
  async listOverrides(): Promise<AppSetting[]> {
    return this.settings.find();
  }

  async findOverrideByKey(key: string): Promise<AppSetting | null> {
    return this.settings.findOne({ where: { key } });
  }

  /** Insert or replace the serialized override value for a catalog key. */
  async upsertOverride(key: string, serializedValue: string): Promise<AppSetting> {
    let row = await this.findOverrideByKey(key);
    if (!row) {
      row = this.settings.create({ key, value: serializedValue });
    } else {
      row.value = serializedValue;
    }
    return this.settings.save(row);
  }
}
