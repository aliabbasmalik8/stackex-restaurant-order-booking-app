import { Module } from '@nestjs/common';
import { SharedModule } from '@shared/shared.module';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';

@Module({
  imports: [SharedModule],
  controllers: [AddressController],
  providers: [AddressService],
  exports: [],
})
export class AddressModule {}
