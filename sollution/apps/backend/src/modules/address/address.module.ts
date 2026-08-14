import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { SharedModule } from '@shared/shared.module';
import { AddressGeocodeThrottlerGuard } from './address-geocode-throttler.guard';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';

@Module({
  imports: [
    SharedModule,
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'addressGeocodeShort', ttl: 60_000, limit: 8 },
        { name: 'addressGeocodeHour', ttl: 3_600_000, limit: 20 },
      ],
    }),
  ],
  controllers: [AddressController],
  providers: [AddressService, AddressGeocodeThrottlerGuard],
  exports: [],
})
export class AddressModule {}
