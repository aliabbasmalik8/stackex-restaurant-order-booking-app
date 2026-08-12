import { randomUUID } from 'node:crypto';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@utils/config/app.config.type';
import {
  ensureOrderBookingException,
  OrderBookingException,
} from '@utils/order-booking.exception';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

export type VerifiedFirebaseUser = {
  uid: string;
  email: string | null;
  name: string | null;
  emailVerified: boolean;
};

export type FirebaseStorageUploadInput = {
  /** Object path inside the bucket (e.g. `products/uuid.jpg`). */
  objectPath: string;
  buffer: Buffer;
  contentType: string;
};

export type FirebaseStorageUploadResult = {
  bucket: string;
  objectPath: string;
  /** Public HTTPS URL for the object (Firebase download-token style). */
  downloadUrl: string;
};

/**
 * Optional Firebase Admin bootstrap for verifying client ID tokens
 * and uploading to Cloud Storage (when `FIREBASE_STORAGE_BUCKET` is set).
 * Nest still issues app JWTs after verification.
 */
@Injectable()
export class FirebaseAdminService {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private ready = false;
  private storageBucket: string | null = null;

  constructor(private readonly configService: ConfigService<AppConfig>) {
    this.bootstrap();
  }

  isConfigured(): boolean {
    return this.ready;
  }

  isStorageConfigured(): boolean {
    return this.ready && Boolean(this.storageBucket);
  }

  async verifyIdToken(idToken: string): Promise<VerifiedFirebaseUser> {
    if (!this.ready) {
      throw new OrderBookingException({
        error_detail:
          'Firebase Auth is not configured on the server (missing Admin env).',
        user_error_detail: {
          english: 'Sign-in is not available right now. Please try again later.',
          arabic: 'تسجيل الدخول غير متاح حالياً. يرجى المحاولة لاحقاً.',
        },
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        notify: true,
      });
    }

    try {
      const decoded = await getAuth().verifyIdToken(idToken);
      return {
        uid: decoded.uid,
        email: decoded.email ?? null,
        name: typeof decoded.name === 'string' ? decoded.name : null,
        emailVerified: Boolean(decoded.email_verified),
      };
    } catch (error) {
      this.logger.warn(
        `Firebase ID token verification failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw ensureOrderBookingException(error, {
        error_detail: 'Firebase ID token verification failed',
        user_error_detail: {
          english: 'Your sign-in session is invalid. Please sign in again.',
          arabic: 'جلسة تسجيل الدخول غير صالحة. يرجى تسجيل الدخول مرة أخرى.',
        },
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }
  }

  /**
   * Upload bytes to Firebase Storage and return a durable download URL.
   * Uses a Firebase download token in object metadata (no makePublic ACL).
   */
  async uploadPublicObject(
    input: FirebaseStorageUploadInput,
  ): Promise<FirebaseStorageUploadResult> {
    if (!this.isStorageConfigured() || !this.storageBucket) {
      throw new OrderBookingException({
        error_detail:
          'Firebase Storage is not configured (missing Admin env or FIREBASE_STORAGE_BUCKET).',
        user_error_detail: {
          english:
            'Image upload is not available right now. Paste an image URL instead, or try again later.',
          arabic:
            'رفع الصور غير متاح حالياً. الصق رابط الصورة بدلاً من ذلك، أو حاول لاحقاً.',
        },
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        notify: true,
      });
    }

    const downloadToken = randomUUID();
    const bucket = getStorage().bucket(this.storageBucket);
    const file = bucket.file(input.objectPath);

    try {
      await file.save(input.buffer, {
        resumable: false,
        metadata: {
          contentType: input.contentType,
          metadata: {
            firebaseStorageDownloadTokens: downloadToken,
          },
        },
      });
    } catch (error) {
      this.logger.error(
        `Firebase Storage upload failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw ensureOrderBookingException(error, {
        error_detail: 'Firebase Storage upload failed',
        user_error_detail: {
          english: 'Could not upload the image. Please try again.',
          arabic: 'تعذر رفع الصورة. يرجى المحاولة مرة أخرى.',
        },
        statusCode: HttpStatus.BAD_GATEWAY,
        notify: true,
      });
    }

    const encodedPath = encodeURIComponent(input.objectPath);
    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${this.storageBucket}/o/${encodedPath}?alt=media&token=${downloadToken}`;

    return {
      bucket: this.storageBucket,
      objectPath: input.objectPath,
      downloadUrl,
    };
  }

  private bootstrap(): void {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID')?.trim();
    const clientEmail = this.configService
      .get<string>('FIREBASE_CLIENT_EMAIL')
      ?.trim();
    const privateKeyRaw = this.configService.get<string>('FIREBASE_PRIVATE_KEY');
    const storageBucket = this.configService
      .get<string>('FIREBASE_STORAGE_BUCKET')
      ?.trim();

    if (!projectId || !clientEmail || !privateKeyRaw?.trim()) {
      this.logger.warn(
        'Firebase Admin env missing — POST /auth/firebase and Storage uploads will be unavailable.',
      );
      return;
    }

    const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

    try {
      if (!getApps().length) {
        initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
          ...(storageBucket ? { storageBucket } : {}),
        });
      }
      this.ready = true;
      this.storageBucket = storageBucket || null;
      if (!this.storageBucket) {
        this.logger.warn(
          'FIREBASE_STORAGE_BUCKET missing — product image upload will be unavailable.',
        );
      }
    } catch (error) {
      this.logger.error(
        `Firebase Admin init failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      this.ready = false;
      this.storageBucket = null;
    }
  }
}
