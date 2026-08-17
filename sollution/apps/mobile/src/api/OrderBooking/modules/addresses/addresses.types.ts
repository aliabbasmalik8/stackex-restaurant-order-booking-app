export type UserAddressDto = {
  id: string;
  label: string;
  line1: string;
  line2: string;
  area: string;
  city: string;
  notes: string;
  lat: number;
  lng: number;
  isDefault: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

/** Body for `POST /addresses/reverse-geocode`. */
export type ReverseGeocodeRequest = {
  lat: number;
  lng: number;
};

/** Matches backend `GoogleReverseGeocodeResult`. */
export type ReverseGeocodeResult = {
  line1: string;
  line2: string;
  area: string;
  city: string;
  formattedAddress: string;
  lat: number;
  lng: number;
};

export type CreateAddressRequest = {
  label: string;
  line1: string;
  line2?: string;
  area?: string;
  city: string;
  notes?: string;
  lat: number;
  lng: number;
  isDefault?: boolean;
};
