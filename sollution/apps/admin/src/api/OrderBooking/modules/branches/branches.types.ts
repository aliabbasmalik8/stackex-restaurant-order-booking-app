export type BranchDto = {
  id: string;
  slug: string;
  name: string;
  name_arabic: string;
  address: string;
  address_arabic: string;
  etaMinutes: number;
  lat: number | null;
  lng: number | null;
  deliveryRadiusKm: number | null;
  active: boolean;
  sortOrder: number;
};

export type UpdateBranchDto = {
  name: string;
  name_arabic: string;
  address?: string;
  address_arabic?: string;
  etaMinutes?: number;
  lat?: number | null;
  lng?: number | null;
  deliveryRadiusKm?: number | null;
  active?: boolean;
  sortOrder?: number;
};
