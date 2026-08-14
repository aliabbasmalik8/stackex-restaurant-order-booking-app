import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ensureOrderBookingException,
  OrderBookingException,
} from '@utils/order-booking.exception';

type GoogleAddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

type GoogleGeocodeResult = {
  formatted_address: string;
  address_components: GoogleAddressComponent[];
};

type GoogleGeocodeResponse = {
  status: string;
  error_message?: string;
  results?: GoogleGeocodeResult[];
};

/** Normalized reverse-geocode fields (English when `language=en`). */
export type GoogleReverseGeocodeResult = {
  line1: string;
  line2: string;
  area: string;
  city: string;
  formattedAddress: string;
  lat: number;
  lng: number;
};

const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

/**
 * Thin Google Maps Platform client (Geocoding today; Places later).
 * Optional: omit `GOOGLE_MAPS_API_KEY` — `isConfigured()` is false; callers get 503.
 * No HTTP routes here — domain modules own product APIs + throttle.
 */
@Injectable()
export class GoogleMapsService {
  private readonly logger = new Logger(GoogleMapsService.name);

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.config.get<string>('GOOGLE_MAPS_API_KEY')?.trim());
  }

  /**
   * Reverse geocode a pin via Google Geocoding API (`language=en`).
   */
  async reverseGeocode(
    lat: number,
    lng: number,
  ): Promise<GoogleReverseGeocodeResult> {
    const key = this.config.get<string>('GOOGLE_MAPS_API_KEY')?.trim();
    if (!key) {
      throw new OrderBookingException({
        error_detail: 'GOOGLE_MAPS_API_KEY is not set',
        user_error_detail: {
          english: 'Address lookup is not available right now.',
          arabic: 'البحث عن العنوان غير متاح حالياً.',
        },
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      });
    }

    const url = new URL(GEOCODE_URL);
    url.searchParams.set('latlng', `${lat},${lng}`);
    url.searchParams.set('language', 'en');
    url.searchParams.set('key', key);

    let payload: GoogleGeocodeResponse;
    try {
      const response = await fetch(url);
      payload = (await response.json()) as GoogleGeocodeResponse;
      if (!response.ok) {
        throw new OrderBookingException({
          error_detail: `Google Geocoding HTTP ${response.status} status=${payload.status}`,
          user_error_detail: {
            english: "Couldn't look up this location. Try again.",
            arabic: 'تعذر البحث عن هذا الموقع. حاول مرة أخرى.',
          },
          statusCode: HttpStatus.BAD_GATEWAY,
        });
      }
    } catch (error) {
      throw ensureOrderBookingException(error, {
        error_detail: 'Google Geocoding request failed',
        user_error_detail: {
          english: "Couldn't look up this location. Try again.",
          arabic: 'تعذر البحث عن هذا الموقع. حاول مرة أخرى.',
        },
        statusCode: HttpStatus.BAD_GATEWAY,
      });
    }

    if (payload.status === 'ZERO_RESULTS' || !payload.results?.length) {
      throw new OrderBookingException({
        error_detail: `Google Geocoding ZERO_RESULTS lat=${lat} lng=${lng}`,
        user_error_detail: {
          english:
            'No address found for this pin. Move it slightly and try again.',
          arabic:
            'لم يتم العثور على عنوان لهذا الموقع. حرّك الدبوس قليلاً وحاول مرة أخرى.',
        },
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (
      payload.status === 'OVER_QUERY_LIMIT' ||
      payload.status === 'RESOURCE_EXHAUSTED'
    ) {
      this.logger.warn(`Google Geocoding quota: ${payload.status}`);
      throw new OrderBookingException({
        error_detail: `Google Geocoding quota ${payload.status}`,
        user_error_detail: {
          english: 'Address lookup is busy. Please wait a moment.',
          arabic: 'البحث عن العنوان مشغول. يرجى الانتظار قليلاً.',
        },
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
      });
    }

    if (
      payload.status === 'REQUEST_DENIED' ||
      payload.status === 'INVALID_REQUEST'
    ) {
      throw new OrderBookingException({
        error_detail: `Google Geocoding ${payload.status}: ${payload.error_message ?? ''}`,
        user_error_detail: {
          english: 'Address lookup is not available right now.',
          arabic: 'البحث عن العنوان غير متاح حالياً.',
        },
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      });
    }

    if (payload.status !== 'OK') {
      throw new OrderBookingException({
        error_detail: `Google Geocoding status=${payload.status} ${payload.error_message ?? ''}`,
        user_error_detail: {
          english: "Couldn't look up this location. Try again.",
          arabic: 'تعذر البحث عن هذا الموقع. حاول مرة أخرى.',
        },
        statusCode: HttpStatus.BAD_GATEWAY,
      });
    }

    return mapGoogleResult(payload.results[0], lat, lng);
  }
}

function component(parts: GoogleAddressComponent[], type: string): string {
  return parts.find((part) => part.types.includes(type))?.long_name?.trim() ?? '';
}

function mapGoogleResult(
  result: GoogleGeocodeResult,
  lat: number,
  lng: number,
): GoogleReverseGeocodeResult {
  const parts = result.address_components ?? [];
  const streetNumber = component(parts, 'street_number');
  const route = component(parts, 'route');
  const line1 =
    [streetNumber, route].filter(Boolean).join(' ') ||
    result.formatted_address.split(',')[0]?.trim() ||
    '';
  const line2 =
    component(parts, 'subpremise') || component(parts, 'floor') || '';
  const area =
    component(parts, 'neighborhood') ||
    component(parts, 'sublocality') ||
    component(parts, 'sublocality_level_1') ||
    '';
  const city =
    component(parts, 'locality') ||
    component(parts, 'postal_town') ||
    component(parts, 'administrative_area_level_1') ||
    '';

  return {
    line1,
    line2,
    area,
    city,
    formattedAddress: result.formatted_address,
    lat,
    lng,
  };
}
