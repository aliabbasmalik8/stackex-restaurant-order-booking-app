import { uploadProductImage as uploadProductImageRequest } from '@/api/OrderBooking/modules/firebase-storage';
import { isFeatureInteractive } from '@/features/_registry';

export type UploadProductImageResult = {
  url: string;
  objectPath: string;
};

/**
 * Feature entry: upload product image when `firebaseStorage` is interactive.
 * Returns a download URL to store on `product.image`.
 */
export async function uploadProductImage(
  file: File,
): Promise<UploadProductImageResult> {
  if (!isFeatureInteractive('firebaseStorage')) {
    throw new Error('Firebase Storage feature is not enabled');
  }
  return uploadProductImageRequest(file);
}

export function canUploadProductImage(): boolean {
  return isFeatureInteractive('firebaseStorage');
}
