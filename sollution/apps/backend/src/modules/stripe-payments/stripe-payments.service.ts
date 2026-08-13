import { Order } from '@database/entities/Order.model';
import { OrderDbService } from '@database/services/order-db.service';
import { UserDbService } from '@database/services/user-db.service';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ensureOrderBookingException,
  OrderBookingException,
} from '@utils/order-booking.exception';
import Stripe from 'stripe';
import {
  APP_EVENTS,
  EventsService,
  toOrderPlacedPayload,
} from '../events';
import { SettingService } from '../setting/setting.service';
import {
  OrderPaymentStatusResponseDto,
  PaymentIntentResponseDto,
} from './stripe-payments.dto';
import {
  readStripeSecrets,
  toStripeAmount,
  type StripeSecretsConfig,
} from './stripe.config';

const CARD_PAYMENTS_UNAVAILABLE = {
  english: 'Card payments are not available right now.',
  arabic: 'الدفع بالبطاقة غير متاح حالياً.',
};

const ORDER_NOT_FOUND = {
  english: 'Order not found.',
  arabic: 'الطلب غير موجود.',
};

const ORDER_FORBIDDEN = {
  english: 'You do not have access to this order.',
  arabic: 'ليس لديك صلاحية للوصول إلى هذا الطلب.',
};

@Injectable()
export class StripePaymentsService {
  private readonly logger = new Logger(StripePaymentsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly orderDb: OrderDbService,
    private readonly userDb: UserDbService,
    private readonly settingService: SettingService,
    private readonly events: EventsService,
  ) {}

  private requireStripe(): StripeSecretsConfig {
    const cfg = readStripeSecrets(this.configService);
    if (!cfg) {
      throw new OrderBookingException({
        error_detail:
          'Card payments are not configured. Set STRIPE_SECRET_KEY.',
        user_error_detail: CARD_PAYMENTS_UNAVAILABLE,
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        notify: true,
      });
    }
    return cfg;
  }

  private stripeClient(secretKey: string): Stripe {
    return new Stripe(secretKey);
  }

  private async getCommerceSettings(): Promise<{
    currencyCode: string;
    currencyDisplay: string;
    businessName: string;
    businessMonogram: string;
  }> {
    const [currencyCode, currencyDisplay, businessName, businessMonogram] =
      await Promise.all([
        this.settingService.getValue<string>('currency_code'),
        this.settingService.getValue<string>('currency_display'),
        this.settingService.getValue<string>('business_name'),
        this.settingService.getValue<string>('business_monogram'),
      ]);

    return {
      currencyCode: String(currencyCode).trim().toLowerCase(),
      currencyDisplay: String(currencyDisplay).trim(),
      businessName: String(businessName).trim(),
      businessMonogram: String(businessMonogram).trim(),
    };
  }

  private toPaymentStatusResponse(order: Order): OrderPaymentStatusResponseDto {
    return {
      orderId: order.id,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      orderStatus: order.status,
      paidAt: order.paid_at ? order.paid_at.toISOString() : null,
      stripePaymentIntentId: order.stripe_payment_intent_id,
    };
  }

  /**
   * Lazy Stripe Customer: reuse `user.stripe_customer_id` or create + persist.
   * Runs before PaymentIntent create so cards/customers stay linked.
   */
  private async ensureStripeCustomer(
    stripe: Stripe,
    userId: string,
  ): Promise<string> {
    const user = await this.userDb.findById(userId);
    if (!user) {
      throw new OrderBookingException({
        error_detail: `Stripe customer ensure: user ${userId} not found`,
        user_error_detail: {
          english: 'User not found.',
          arabic: 'المستخدم غير موجود.',
        },
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (user.stripe_customer_id) {
      try {
        const existing = await stripe.customers.retrieve(
          user.stripe_customer_id,
        );
        if (!('deleted' in existing && existing.deleted)) {
          return existing.id;
        }
      } catch (err) {
        this.logger.warn(
          `Stored Stripe customer ${user.stripe_customer_id} missing; recreating. ${(err as Error).message}`,
        );
      }
    }

    try {
      const customer = await stripe.customers.create({
        email: user.email?.trim() || undefined,
        name: user.name?.trim() || undefined,
        phone: user.contact_phone?.trim() || undefined,
        metadata: {
          userId: user.id,
        },
      });

      if (!customer?.id) {
        throw new OrderBookingException({
          error_detail: `Stripe customers.create returned no id for user ${user.id}`,
          user_error_detail: CARD_PAYMENTS_UNAVAILABLE,
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          notify: true,
        });
      }

      const saved = await this.userDb.setStripeCustomerId(user.id, customer.id);
      if (!saved?.stripe_customer_id) {
        throw new OrderBookingException({
          error_detail: `Failed to persist Stripe customer ${customer.id} on user ${user.id}`,
          user_error_detail: CARD_PAYMENTS_UNAVAILABLE,
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          notify: true,
        });
      }

      this.logger.log(
        `Linked Stripe customer ${customer.id} to user ${user.id}`,
      );
      return saved.stripe_customer_id;
    } catch (error) {
      throw ensureOrderBookingException(error, {
        error_detail: `Failed to ensure Stripe customer for user ${userId}`,
        user_error_detail: CARD_PAYMENTS_UNAVAILABLE,
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        notify: true,
      });
    }
  }

  async createIntent(
    userId: string,
    orderId: string,
  ): Promise<PaymentIntentResponseDto> {
    try {
      const stripeCfg = this.requireStripe();
      const stripe = this.stripeClient(stripeCfg.secretKey);
      const commerce = await this.getCommerceSettings();

      if (!commerce.currencyCode) {
        throw new OrderBookingException({
          error_detail:
            'currency_code setting is empty. Set it via /api/settings.',
          user_error_detail: CARD_PAYMENTS_UNAVAILABLE,
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          notify: true,
        });
      }

      const order = await this.orderDb.findById(orderId);
      if (!order) {
        throw new OrderBookingException({
          error_detail: `PaymentIntent: order ${orderId} not found`,
          user_error_detail: ORDER_NOT_FOUND,
          statusCode: HttpStatus.NOT_FOUND,
        });
      }
      if (order.user_id !== userId) {
        throw new OrderBookingException({
          error_detail: `PaymentIntent: order ${orderId} belongs to ${order.user_id}, not ${userId}`,
          user_error_detail: ORDER_FORBIDDEN,
          statusCode: HttpStatus.FORBIDDEN,
        });
      }
      if (order.payment_method !== 'card') {
        throw new OrderBookingException({
          error_detail: `PaymentIntent rejected: order ${orderId} payment_method=${order.payment_method}`,
          user_error_detail: {
            english: 'Card payment is only available for card orders.',
            arabic: 'الدفع بالبطاقة متاح فقط لطلبات البطاقة.',
          },
        });
      }
      if (order.payment_status === 'paid') {
        throw new OrderBookingException({
          error_detail: `PaymentIntent rejected: order ${orderId} already paid`,
          user_error_detail: {
            english: 'This order is already paid.',
            arabic: 'تم دفع هذا الطلب بالفعل.',
          },
        });
      }
      if (order.payment_status === 'cancelled') {
        throw new OrderBookingException({
          error_detail: `PaymentIntent rejected: order ${orderId} payment cancelled`,
          user_error_detail: {
            english: 'Payment for this order was cancelled.',
            arabic: 'تم إلغاء دفع هذا الطلب.',
          },
        });
      }
      if (order.status === 'cancelled') {
        throw new OrderBookingException({
          error_detail: `PaymentIntent rejected: order ${orderId} cancelled`,
          user_error_detail: {
            english: 'This order was cancelled.',
            arabic: 'تم إلغاء هذا الطلب.',
          },
        });
      }

      const amount = toStripeAmount(order.total);
      if (!Number.isFinite(amount) || amount < 1) {
        throw new OrderBookingException({
          error_detail: `PaymentIntent rejected: invalid total ${order.total} → amount ${amount} for order ${orderId}`,
          user_error_detail: {
            english: 'This order total cannot be paid.',
            arabic: 'لا يمكن دفع إجمالي هذا الطلب.',
          },
        });
      }

      const stripeCustomerId = await this.ensureStripeCustomer(stripe, userId);

      const responseBase = {
        currencyCode: commerce.currencyCode,
        currencyDisplay: commerce.currencyDisplay,
        businessName: commerce.businessName,
      };

      if (order.stripe_payment_intent_id) {
        const existing = await stripe.paymentIntents.retrieve(
          order.stripe_payment_intent_id,
        );
        const reusable = [
          'requires_payment_method',
          'requires_confirmation',
          'requires_action',
        ].includes(existing.status);

        if (reusable && existing.client_secret) {
          return {
            clientSecret: existing.client_secret,
            paymentIntentId: existing.id,
            ...responseBase,
          };
        }
      }

      const intentParams: Stripe.PaymentIntentCreateParams = {
        amount,
        currency: commerce.currencyCode,
        customer: stripeCustomerId,
        automatic_payment_methods: { enabled: true },
        description: `${commerce.businessName} · ${order.order_code}`,
        metadata: {
          orderId: order.id,
          orderCode: String(order.order_code),
          userId: order.user_id,
          currency_code: commerce.currencyCode,
          currency_display: commerce.currencyDisplay,
          business_name: commerce.businessName,
        },
      };

      const suffix = commerce.businessMonogram
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .slice(0, 22)
        .trim();
      if (suffix) {
        intentParams.statement_descriptor_suffix = suffix;
      }

      const intent = await stripe.paymentIntents.create(intentParams);

      if (!intent.client_secret) {
        throw new OrderBookingException({
          error_detail: `Stripe PaymentIntent ${intent.id} missing client_secret for order ${order.id}`,
          user_error_detail: CARD_PAYMENTS_UNAVAILABLE,
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          notify: true,
        });
      }

      await this.orderDb.bindStripePaymentIntent(order.id, intent.id);

      return {
        clientSecret: intent.client_secret,
        paymentIntentId: intent.id,
        ...responseBase,
      };
    } catch (error) {
      throw ensureOrderBookingException(error, {
        error_detail: `createIntent failed for user ${userId} order ${orderId}`,
        user_error_detail: CARD_PAYMENTS_UNAVAILABLE,
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        notify: true,
      });
    }
  }

  async syncPaymentStatus(
    userId: string,
    orderId: string,
  ): Promise<OrderPaymentStatusResponseDto> {
    try {
      const stripeCfg = this.requireStripe();
      const stripe = this.stripeClient(stripeCfg.secretKey);

      const order = await this.orderDb.findById(orderId);
      if (!order) {
        throw new OrderBookingException({
          error_detail: `syncPaymentStatus: order ${orderId} not found`,
          user_error_detail: ORDER_NOT_FOUND,
          statusCode: HttpStatus.NOT_FOUND,
        });
      }
      if (order.user_id !== userId) {
        throw new OrderBookingException({
          error_detail: `syncPaymentStatus: order ${orderId} belongs to ${order.user_id}, not ${userId}`,
          user_error_detail: ORDER_FORBIDDEN,
          statusCode: HttpStatus.FORBIDDEN,
        });
      }
      if (order.payment_method !== 'card') {
        throw new OrderBookingException({
          error_detail: `syncPaymentStatus rejected: order ${orderId} payment_method=${order.payment_method}`,
          user_error_detail: {
            english: 'Payment sync is only available for card orders.',
            arabic: 'مزامنة الدفع متاحة فقط لطلبات البطاقة.',
          },
        });
      }
      if (order.payment_status !== 'unpaid') {
        throw new OrderBookingException({
          error_detail: `syncPaymentStatus rejected: order ${orderId} payment_status=${order.payment_status}`,
          user_error_detail: {
            english: 'This order is not waiting for payment.',
            arabic: 'هذا الطلب لا ينتظر الدفع.',
          },
        });
      }
      if (!order.stripe_payment_intent_id) {
        throw new OrderBookingException({
          error_detail: `syncPaymentStatus rejected: order ${orderId} has no PaymentIntent`,
          user_error_detail: {
            english: 'Payment has not been started for this order yet.',
            arabic: 'لم يبدأ الدفع لهذا الطلب بعد.',
          },
        });
      }

      const intent = await stripe.paymentIntents.retrieve(
        order.stripe_payment_intent_id,
      );

      if (intent.status === 'succeeded') {
        await this.markPaid(intent.id, order.id);
      } else if (
        intent.status === 'canceled' ||
        (intent.status === 'requires_payment_method' &&
          intent.last_payment_error)
      ) {
        await this.markFailed(intent.id, order.id);
      }

      const refreshed = await this.orderDb.findById(order.id);
      return this.toPaymentStatusResponse(refreshed ?? order);
    } catch (error) {
      throw ensureOrderBookingException(error, {
        error_detail: `syncPaymentStatus failed for user ${userId} order ${orderId}`,
        user_error_detail: {
          english: 'Could not refresh payment status. Please try again.',
          arabic: 'تعذر تحديث حالة الدفع. يرجى المحاولة مرة أخرى.',
        },
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        notify: true,
      });
    }
  }

  async handleWebhook(
    rawBody: Buffer,
    signature: string | undefined,
  ): Promise<void> {
    try {
      const stripeCfg = this.requireStripe();
      if (!stripeCfg.webhookSecret) {
        throw new OrderBookingException({
          error_detail:
            'STRIPE_WEBHOOK_SECRET is not configured for this deployment.',
          user_error_detail: CARD_PAYMENTS_UNAVAILABLE,
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          notify: true,
        });
      }
      if (!signature) {
        throw new OrderBookingException({
          error_detail: 'Missing Stripe-Signature header on webhook',
          user_error_detail: {
            english: 'Invalid payment notification.',
            arabic: 'إشعار دفع غير صالح.',
          },
        });
      }

      const stripe = this.stripeClient(stripeCfg.secretKey);

      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(
          rawBody,
          signature,
          stripeCfg.webhookSecret,
        );
      } catch (err) {
        this.logger.warn(
          `Webhook signature verification failed: ${(err as Error).message}`,
        );
        throw new OrderBookingException({
          error_detail: `Invalid Stripe webhook signature: ${(err as Error).message}`,
          user_error_detail: {
            english: 'Invalid payment notification.',
            arabic: 'إشعار دفع غير صالح.',
          },
        });
      }

      if (event.type === 'payment_intent.succeeded') {
        const intent = event.data.object as Stripe.PaymentIntent;
        await this.markPaid(intent.id, intent.metadata?.orderId);
        return;
      }

      if (event.type === 'payment_intent.payment_failed') {
        const intent = event.data.object as Stripe.PaymentIntent;
        await this.markFailed(intent.id, intent.metadata?.orderId);
        return;
      }

      this.logger.debug(`Ignoring Stripe event ${event.type}`);
    } catch (error) {
      throw ensureOrderBookingException(error, {
        error_detail: 'Stripe webhook handling failed',
        user_error_detail: {
          english: 'Could not process payment notification.',
          arabic: 'تعذر معالجة إشعار الدفع.',
        },
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        notify: true,
      });
    }
  }

  private async markPaid(
    paymentIntentId: string,
    orderIdFromMeta?: string,
  ): Promise<void> {
    const order =
      (await this.orderDb.findByPaymentIntentId(paymentIntentId)) ??
      (orderIdFromMeta ? await this.orderDb.findById(orderIdFromMeta) : null);

    if (!order) {
      this.logger.warn(
        `Paid PaymentIntent ${paymentIntentId} has no matching order.`,
      );
      return;
    }

    const alreadyPaid = order.payment_status === 'paid';
    const updated = await this.orderDb.applyPaymentSucceeded(
      order.id,
      paymentIntentId,
    );
    if (updated?.payment_status === 'paid') {
      this.logger.log(`Order ${order.order_code} marked paid.`);
      if (!alreadyPaid) {
        this.events.emit(
          APP_EVENTS.order.placed,
          toOrderPlacedPayload(updated),
        );
      }
    }
  }

  private async markFailed(
    paymentIntentId: string,
    orderIdFromMeta?: string,
  ): Promise<void> {
    const order =
      (await this.orderDb.findByPaymentIntentId(paymentIntentId)) ??
      (orderIdFromMeta ? await this.orderDb.findById(orderIdFromMeta) : null);

    if (!order) {
      this.logger.warn(
        `Failed PaymentIntent ${paymentIntentId} has no matching order.`,
      );
      return;
    }

    await this.orderDb.applyPaymentFailed(order.id);
    this.logger.log(`Order ${order.order_code} payment failed.`);
  }
}
