import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@utils/config/app.config.type';
import {
  ensureOrderBookingException,
  OrderBookingException,
} from '@utils/order-booking.exception';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

export type VerifiedFirebaseUser = {
  uid: string;
  email: string | null;
  name: string | null;
  emailVerified: boolean;
};

/**
 * Optional Firebase Admin bootstrap for verifying client ID tokens.
 * Nest still issues app JWTs after verification.
 */
@Injectable()
export class FirebaseAdminService {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private ready = false;

  constructor(private readonly configService: ConfigService<AppConfig>) {
    this.bootstrap();
  }

  isConfigured(): boolean {
    return this.ready;
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

  private bootstrap(): void {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID')?.trim();
    const clientEmail = this.configService
      .get<string>('FIREBASE_CLIENT_EMAIL')
      ?.trim();
    const privateKeyRaw = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

    if (!projectId || !clientEmail || !privateKeyRaw?.trim()) {
      this.logger.warn(
        'Firebase Admin env missing — POST /auth/firebase will be unavailable.',
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
        });
      }
      this.ready = true;
    } catch (error) {
      this.logger.error(
        `Firebase Admin init failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      this.ready = false;
    }
  }
}
