import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { HttpStatus, Injectable } from '@nestjs/common';
import { FirebaseAdminService } from '@shared/services/firebase-admin.service';
import { OrderBookingException } from '@utils/order-booking.exception';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export type ProductImageUploadResult = {
  url: string;
  objectPath: string;
};

@Injectable()
export class FirebaseStorageService {
  constructor(private readonly firebaseAdmin: FirebaseAdminService) {}

  async uploadProductImage(file: Express.Multer.File): Promise<ProductImageUploadResult> {
    if (!this.firebaseAdmin.isStorageConfigured()) {
      throw new OrderBookingException({
        error_detail: 'Firebase Storage is not configured on this deploy',
        user_error_detail: {
          english:
            'Image upload is not available on this deployment. Paste an image URL instead.',
          arabic:
            'رفع الصور غير متاح في هذا النشر. الصق رابط الصورة بدلاً من ذلك.',
        },
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      });
    }

    if (!file?.buffer?.length) {
      throw new OrderBookingException({
        error_detail: 'Empty upload file',
        user_error_detail: {
          english: 'Please choose an image file to upload.',
          arabic: 'يرجى اختيار ملف صورة للرفع.',
        },
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (file.size > MAX_BYTES) {
      throw new OrderBookingException({
        error_detail: `Upload exceeds ${MAX_BYTES} bytes`,
        user_error_detail: {
          english: 'Image must be 5 MB or smaller.',
          arabic: 'يجب أن تكون الصورة بحجم 5 ميغابايت أو أقل.',
        },
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const contentType = (file.mimetype || '').toLowerCase().trim();
    if (!ALLOWED_MIME.has(contentType)) {
      throw new OrderBookingException({
        error_detail: `Unsupported content type: ${contentType}`,
        user_error_detail: {
          english: 'Use a JPEG, PNG, WebP, or GIF image.',
          arabic: 'استخدم صورة بصيغة JPEG أو PNG أو WebP أو GIF.',
        },
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const ext = normalizeExt(file.originalname, contentType);
    const objectPath = `products/${randomUUID()}${ext}`;

    const uploaded = await this.firebaseAdmin.uploadPublicObject({
      objectPath,
      buffer: file.buffer,
      contentType,
    });

    return {
      url: uploaded.downloadUrl,
      objectPath: uploaded.objectPath,
    };
  }
}

function normalizeExt(originalName: string, contentType: string): string {
  const fromName = extname(originalName || '').toLowerCase();
  if (
    fromName === '.jpg' ||
    fromName === '.jpeg' ||
    fromName === '.png' ||
    fromName === '.webp' ||
    fromName === '.gif'
  ) {
    return fromName === '.jpeg' ? '.jpg' : fromName;
  }

  switch (contentType) {
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'image/gif':
      return '.gif';
    default:
      return '.jpg';
  }
}
