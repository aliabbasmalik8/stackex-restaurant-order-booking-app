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

type GoogleStatusPayload = {
  status: string;
  error_message?: string;
};

type GoogleGeocodeResponse = GoogleStatusPayload & {
  results?: GoogleGeocodeResult[];
};

type GoogleAutocompletePrediction = {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
};

type GoogleAutocompleteResponse = GoogleStatusPayload & {
  predictions?: GoogleAutocompletePrediction[];
};

type GooglePlaceDetailsResult = {
  formatted_address?: string;
  address_components?: GoogleAddressComponent[];
  geometry?: { location?: { lat: number; lng: number } };
};

type GooglePlaceDetailsResponse = GoogleStatusPayload & {
  result?: GooglePlaceDetailsResult;
};

/** Normalized reverse-geocode / place-details fields (English when `language=en`). */
export type GoogleReverseGeocodeResult = {
  line1: string;
  line2: string;
  area: string;
  city: string;
  formattedAddress: string;
  lat: number;
  lng: number;
};

/** One Places Autocomplete suggestion (no lat/lng until place details). */
export type GooglePlacePrediction = {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
};

const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const AUTOCOMPLETE_URL =
  'https://maps.googleapis.com/maps/api/place/autocomplete/json';
const PLACE_DETAILS_URL =
  'https://maps.googleapis.com/maps/api/place/details/json';

const LOOKUP_UNAVAILABLE = {
  english: 'Address lookup is not available right now.',
  arabic: 'البحث عن العنوان غير متاح حالياً.',
} as const;

const LOOKUP_FAILED = {
  english: "Couldn't look up this location. Try again.",
  arabic: 'تعذر البحث عن هذا الموقع. حاول مرة أخرى.',
} as const;

const LOOKUP_BUSY = {
  english: 'Address lookup is busy. Please wait a moment.',
  arabic: 'البحث عن العنوان مشغول. يرجى الانتظار قليلاً.',
} as const;

/**
 * Thin Google Maps Platform client (Geocoding + Places Autocomplete/Details).
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
    const url = this.mapsUrl(GEOCODE_URL);
    url.searchParams.set('latlng', `${lat},${lng}`);
    url.searchParams.set('language', 'en');

    const payload = await this.fetchGoogle<GoogleGeocodeResponse>(
      url,
      'Geocoding',
    );

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

    this.assertGoogleOk(payload, 'Geocoding');
    return mapGoogleResult(payload.results[0], lat, lng);
  }

  /**
   * Places Autocomplete (legacy) — suggestions only. Bias with lat/lng when set.
   * Empty Google results → `[]` (not 404).
   */
  async autocompletePlaces(input: {
    query: string;
    lat?: number;
    lng?: number;
    sessionToken?: string;
  }): Promise<GooglePlacePrediction[]> {
    const query = input.query.trim();
    const url = this.mapsUrl(AUTOCOMPLETE_URL);
    url.searchParams.set('input', query);
    url.searchParams.set('language', 'en');
    if (
      typeof input.lat === 'number' &&
      Number.isFinite(input.lat) &&
      typeof input.lng === 'number' &&
      Number.isFinite(input.lng)
    ) {
      url.searchParams.set('location', `${input.lat},${input.lng}`);
      url.searchParams.set('radius', '40000');
    }
    if (input.sessionToken?.trim()) {
      url.searchParams.set('sessiontoken', input.sessionToken.trim());
    }

    const payload = await this.fetchGoogle<GoogleAutocompleteResponse>(
      url,
      'Places Autocomplete',
    );

    if (payload.status === 'ZERO_RESULTS' || !payload.predictions?.length) {
      if (payload.status === 'ZERO_RESULTS') return [];
      this.assertGoogleOk(payload, 'Places Autocomplete');
      return [];
    }

    this.assertGoogleOk(payload, 'Places Autocomplete');
    return payload.predictions.map((row) => ({
      placeId: row.place_id,
      description: row.description,
      mainText: row.structured_formatting?.main_text?.trim() || row.description,
      secondaryText: row.structured_formatting?.secondary_text?.trim() || '',
    }));
  }

  /**
   * Place Details → same English street fields + pin as reverse geocode.
   */
  async placeDetails(
    placeId: string,
    sessionToken?: string,
  ): Promise<GoogleReverseGeocodeResult> {
    const url = this.mapsUrl(PLACE_DETAILS_URL);
    url.searchParams.set('place_id', placeId.trim());
    url.searchParams.set('language', 'en');
    url.searchParams.set(
      'fields',
      'geometry,address_component,formatted_address',
    );
    if (sessionToken?.trim()) {
      url.searchParams.set('sessiontoken', sessionToken.trim());
    }

    const payload = await this.fetchGoogle<GooglePlaceDetailsResponse>(
      url,
      'Place Details',
    );

    if (
      payload.status === 'ZERO_RESULTS' ||
      payload.status === 'NOT_FOUND' ||
      !payload.result
    ) {
      throw new OrderBookingException({
        error_detail: `Google Place Details ${payload.status} placeId=${placeId}`,
        user_error_detail: {
          english: 'That place was not found. Try another search.',
          arabic: 'لم يتم العثور على هذا المكان. جرّب بحثاً آخر.',
        },
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    this.assertGoogleOk(payload, 'Place Details');
    const lat = payload.result.geometry?.location?.lat;
    const lng = payload.result.geometry?.location?.lng;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      throw new OrderBookingException({
        error_detail: `Google Place Details missing geometry placeId=${placeId}`,
        user_error_detail: LOOKUP_FAILED,
        statusCode: HttpStatus.BAD_GATEWAY,
      });
    }

    return mapGoogleResult(
      {
        formatted_address: payload.result.formatted_address ?? '',
        address_components: payload.result.address_components ?? [],
      },
      lat,
      lng,
    );
  }

  private mapsUrl(base: string): URL {
    const key = this.config.get<string>('GOOGLE_MAPS_API_KEY')?.trim();
    if (!key) {
      throw new OrderBookingException({
        error_detail: 'GOOGLE_MAPS_API_KEY is not set',
        user_error_detail: LOOKUP_UNAVAILABLE,
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      });
    }
    const url = new URL(base);
    url.searchParams.set('key', key);
    return url;
  }

  private async fetchGoogle<T extends GoogleStatusPayload>(
    url: URL,
    label: string,
  ): Promise<T> {
    try {
      const response = await fetch(url);
      const payload = (await response.json()) as T;
      if (!response.ok) {
        throw new OrderBookingException({
          error_detail: `Google ${label} HTTP ${response.status} status=${payload.status}`,
          user_error_detail: LOOKUP_FAILED,
          statusCode: HttpStatus.BAD_GATEWAY,
        });
      }
      return payload;
    } catch (error) {
      throw ensureOrderBookingException(error, {
        error_detail: `Google ${label} request failed`,
        user_error_detail: LOOKUP_FAILED,
        statusCode: HttpStatus.BAD_GATEWAY,
      });
    }
  }

  private assertGoogleOk(payload: GoogleStatusPayload, label: string): void {
    if (
      payload.status === 'OVER_QUERY_LIMIT' ||
      payload.status === 'RESOURCE_EXHAUSTED'
    ) {
      this.logger.warn(`Google ${label} quota: ${payload.status}`);
      throw new OrderBookingException({
        error_detail: `Google ${label} quota ${payload.status}`,
        user_error_detail: LOOKUP_BUSY,
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
      });
    }

    if (
      payload.status === 'REQUEST_DENIED' ||
      payload.status === 'INVALID_REQUEST'
    ) {
      throw new OrderBookingException({
        error_detail: `Google ${label} ${payload.status}: ${payload.error_message ?? ''}`,
        user_error_detail: LOOKUP_UNAVAILABLE,
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      });
    }

    if (payload.status !== 'OK') {
      throw new OrderBookingException({
        error_detail: `Google ${label} status=${payload.status} ${payload.error_message ?? ''}`,
        user_error_detail: LOOKUP_FAILED,
        statusCode: HttpStatus.BAD_GATEWAY,
      });
    }
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
