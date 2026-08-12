import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

const logger = new Logger('OrderBookingHttpError');

/**
 * Bilingual message shown to end users.
 * Keep this non-technical — no IDs, stack traces, or internal jargon.
 */
export interface UserErrorDetail {
  english: string;
  arabic: string;
}

export interface OrderBookingExceptionOptions {
  /**
   * Detailed server-side description (English).
   * Logged at the controller boundary; may include IDs / internals.
   */
  error_detail: string;

  /**
   * Non-technical bilingual message returned in the HTTP body for the user/UI.
   */
  user_error_detail: UserErrorDetail;

  /**
   * Whether this error should trigger an out-of-band notification.
   * Notification wiring is intentionally deferred (stub for later).
   */
  notify?: boolean;

  /**
   * HTTP status used by `handleControllerError` / filter. Defaults to 400.
   */
  statusCode?: number;

  /**
   * Optional machine-readable code for clients (e.g. ITEM_UNAVAILABLE).
   * Not shown as the user-facing sentence — keep `user_error_detail` friendly.
   */
  error_code?: string;

  /**
   * Optional extra fields merged into the HTTP body for clients
   * (e.g. `{ unavailableMenuItemIds }`, `{ count }`).
   */
  error_data?: Record<string, unknown>;
}

/**
 * Application-level error type for all business / validation failures.
 * Framework-agnostic so it can be used from services and utils.
 */
export class OrderBookingException extends Error {
  public readonly error_detail: string;
  public readonly user_error_detail: UserErrorDetail;
  public readonly notify: boolean;
  public readonly statusCode: number;
  public readonly error_code?: string;
  public readonly error_data?: Record<string, unknown>;

  constructor(options: OrderBookingExceptionOptions) {
    const {
      error_detail,
      user_error_detail,
      notify = false,
      statusCode = HttpStatus.BAD_REQUEST,
      error_code,
      error_data,
    } = options;

    super(error_detail);

    this.name = 'OrderBookingException';
    this.error_detail = error_detail;
    this.user_error_detail = user_error_detail;
    this.notify = notify;
    this.statusCode = statusCode;
    this.error_code = error_code;
    this.error_data = error_data;
  }
}

/**
 * Utility to normalize unknown errors into an `OrderBookingException`.
 *
 * - If the incoming error is already an `OrderBookingException`, it is returned as-is.
 * - Otherwise, we wrap it with the provided bilingual `user_error_detail` and capture the
 *   underlying detail in `error_detail`.
 */
export function ensureOrderBookingException(
  error: unknown,
  options: OrderBookingExceptionOptions,
): OrderBookingException {
  if (error instanceof OrderBookingException) {
    return error;
  }

  const underlying = extractUnknownErrorMessage(error);
  const error_detail =
    underlying && underlying !== options.error_detail
      ? `${options.error_detail} — ${underlying}`
      : options.error_detail;

  return new OrderBookingException({
    error_detail,
    user_error_detail: options.user_error_detail,
    notify: options.notify ?? false,
    statusCode: options.statusCode,
    error_code: options.error_code,
    error_data: options.error_data,
  });
}

/**
 * Extracts a human-readable detail string from any unknown error.
 * - OrderBookingException → error_detail
 * - Error → stack ?? message
 * - anything else → JSON.stringify or String fallback
 */
export function getErrorDetail(error: unknown): string {
  if (error instanceof OrderBookingException) {
    return error.error_detail;
  }
  if (error instanceof Error) {
    return error.stack ?? error.message;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

/**
 * Consistent HTTP body for `OrderBookingException` responses.
 * Passed as a full object (includes `statusCode`) so Nest does not wrap it
 * under `message`.
 */
export interface OrderBookingHttpErrorBody {
  statusCode: number;
  user_error_detail: UserErrorDetail;
  /** Machine code when provided (clients may key off this). */
  code?: string;
  [key: string]: unknown;
}

export function toOrderBookingHttpBody(
  error: OrderBookingException,
): OrderBookingHttpErrorBody {
  return {
    statusCode: error.statusCode,
    user_error_detail: error.user_error_detail,
    ...(error.error_code ? { code: error.error_code } : {}),
    ...(error.error_data ?? {}),
  };
}

function logOrderBookingException(error: OrderBookingException): void {
  logger.error(error.error_detail);

  // TODO: when notify === true, emit out-of-band notification (Slack/etc).
  if (error.notify) {
    logger.warn(
      `OrderBookingException notify=true (notification not wired yet): ${error.error_detail}`,
    );
  }
}

/**
 * Shared HTTP-layer error mapper for controllers.
 *
 * - If the error is an `OrderBookingException` → log + throw Nest `HttpException`
 *   with `{ statusCode, user_error_detail, code?, ...error_data }`.
 * - Otherwise → re-throw unchanged.
 */
export function handleControllerError(error: unknown): never {
  if (error instanceof OrderBookingException) {
    logOrderBookingException(error);
    throw new HttpException(toOrderBookingHttpBody(error), error.statusCode);
  }

  throw error;
}

/**
 * Global fallback so guards / filters that throw `OrderBookingException`
 * still return the same HTTP body (controllers should still use try/catch).
 */
@Catch(OrderBookingException)
export class OrderBookingExceptionFilter implements ExceptionFilter {
  catch(exception: OrderBookingException, host: ArgumentsHost): void {
    logOrderBookingException(exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response
      .status(exception.statusCode)
      .json(toOrderBookingHttpBody(exception));
  }
}

function extractUnknownErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return 'Unknown error';
  }
}
