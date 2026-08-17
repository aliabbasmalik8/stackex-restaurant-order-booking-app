import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AuthGuard } from '@shared/guards/auth.guard';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import {
  GooglePlacePrediction,
  GoogleReverseGeocodeResult,
} from '@shared/services/google-maps.service';
import { IAuthUser } from '@utils/global.type';
import { handleControllerError } from '@utils/order-booking.exception';
import { AddressGeocodeThrottlerGuard } from './address-geocode-throttler.guard';
import {
  AddressResponseDto,
  CreateAddressDto,
  PlaceAutocompleteDto,
  PlaceDetailsDto,
  ReverseGeocodeDto,
  UpdateAddressDto,
} from './address.dto';
import { AddressService } from './address.service';

@Controller('addresses')
@UseGuards(AuthGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  async list(@CurrentUser() user: IAuthUser): Promise<AddressResponseDto[]> {
    try {
      return await this.addressService.listForUser(user.userId);
    } catch (error) {
      handleControllerError(error);
    }
  }

  @Post()
  async create(
    @CurrentUser() user: IAuthUser,
    @Body() dto: CreateAddressDto,
  ): Promise<AddressResponseDto> {
    try {
      return await this.addressService.createForUser(user.userId, dto);
    } catch (error) {
      handleControllerError(error);
    }
  }

  @Patch(':id/default')
  async setDefault(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AddressResponseDto> {
    try {
      return await this.addressService.setDefaultForUser(user.userId, id);
    } catch (error) {
      handleControllerError(error);
    }
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAddressDto,
  ): Promise<AddressResponseDto> {
    try {
      return await this.addressService.updateForUser(user.userId, id, dto);
    } catch (error) {
      handleControllerError(error);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    try {
      await this.addressService.deleteForUser(user.userId, id);
    } catch (error) {
      handleControllerError(error);
    }
  }

  /** Pin → English street fields (throttled). */
  @Post('reverse-geocode')
  @SkipThrottle({ addressPlacesShort: true, addressPlacesHour: true })
  @UseGuards(AddressGeocodeThrottlerGuard)
  async reverseGeocode(
    @Body() dto: ReverseGeocodeDto,
  ): Promise<GoogleReverseGeocodeResult> {
    try {
      return await this.addressService.reverseGeocode(dto);
    } catch (error) {
      handleControllerError(error);
    }
  }

  /** Search → place suggestions (throttled). Optional lat/lng bias. */
  @Post('place-autocomplete')
  @SkipThrottle({ addressGeocodeShort: true, addressGeocodeHour: true })
  @UseGuards(AddressGeocodeThrottlerGuard)
  async placeAutocomplete(
    @Body() dto: PlaceAutocompleteDto,
  ): Promise<GooglePlacePrediction[]> {
    try {
      return await this.addressService.autocompletePlaces(dto);
    } catch (error) {
      handleControllerError(error);
    }
  }

  /** Chosen suggestion → pin + English street fields (throttled). */
  @Post('place-details')
  @SkipThrottle({ addressGeocodeShort: true, addressGeocodeHour: true })
  @UseGuards(AddressGeocodeThrottlerGuard)
  async placeDetails(
    @Body() dto: PlaceDetailsDto,
  ): Promise<GoogleReverseGeocodeResult> {
    try {
      return await this.addressService.placeDetails(dto);
    } catch (error) {
      handleControllerError(error);
    }
  }
}
