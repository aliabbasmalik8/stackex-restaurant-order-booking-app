import { orderBookingApiRequest } from '@/api/OrderBooking/client';
import type { ProductImageUploadResponse } from './firebase-storage.types';

/**
 * Upload a product image via Nest → Firebase Storage.
 * Field name must be `file` (matches backend FileInterceptor).
 */
export async function uploadProductImage(
  file: File,
): Promise<ProductImageUploadResponse> {
  const body = new FormData();
  body.append('file', file);

  return orderBookingApiRequest<ProductImageUploadResponse>(
    '/firebase-storage/product-image',
    {
      method: 'POST',
      data: body,
    },
  );
}
