import { Order } from '@database/entities/Order.model';
import { OrderDbService } from '@database/services/order-db.service';
import { UserDbService } from '@database/services/user-db.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { SettingService } from '../setting/setting.service';
import {
  OrderPaymentStatusResponseDto,
  PaymentIntentResponseDto,
} from './payment.dto';
import {
  readStripeSecrets,
  toStripeAmount,
  type StripeSecretsConfig,
} from './stripe.config';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly orderDb: OrderDbService,
    private readonly userDb: UserDbService,
    private readonly settingService: SettingService,
  ) {}

  private requireStripe(): StripeSecretsConfig {
    const cfg = readStripeSecrets(this.configService);
    if (!cfg) {
      throw new ServiceUnavailableException(
        'Card payments are not configured for this deployment. Set STRIPE_SECRET_KEY.',
      );
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
      throw new NotFoundException('User not found.');
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

    const customer = await stripe.customers.create({
      email: user.email?.trim() || undefined,
      name: user.name?.trim() || undefined,
      phone: user.contact_phone?.trim() || undefined,
      metadata: {
        userId: user.id,
      },
    });

    if (!customer?.id) {
      throw new ServiceUnavailableException(
        'Stripe did not return a customer id.',
      );
    }

    const saved = await this.userDb.setStripeCustomerId(user.id, customer.id);
    if (!saved?.stripe_customer_id) {
      throw new ServiceUnavailableException(
        'Failed to persist Stripe customer id on user.',
      );
    }

    this.logger.log(
      `Linked Stripe customer ${customer.id} to user ${user.id}`,
    );
    return saved.stripe_customer_id;
  }

  async createIntent(
    userId: string,
    orderId: string,
  ): Promise<PaymentIntentResponseDto> {
    const stripeCfg = this.requireStripe();
    const stripe = this.stripeClient(stripeCfg.secretKey);
    const commerce = await this.getCommerceSettings();

    if (!commerce.currencyCode) {
      throw new ServiceUnavailableException(
        'currency_code setting is empty. Set it via /api/settings.',
      );
    }

    const order = await this.orderDb.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found.');
    }
    if (order.user_id !== userId) {
      throw new ForbiddenException('Order does not belong to this user.');
    }
    if (order.payment_method !== 'card') {
      throw new BadRequestException(
        'PaymentIntent is only for card orders. Use paymentMethod: card when creating the order.',
      );
    }
    if (order.payment_status === 'paid') {
      throw new BadRequestException('Order is already paid.');
    }
    if (order.payment_status === 'cancelled') {
      throw new BadRequestException('Order payment was cancelled.');
    }
    if (order.status === 'cancelled') {
      throw new BadRequestException('Order was cancelled.');
    }

    const amount = toStripeAmount(order.total);
    if (!Number.isFinite(amount) || amount < 1) {
      throw new BadRequestException('Order total is invalid for payment.');
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
        orderCode: order.order_code,
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
      throw new ServiceUnavailableException(
        'Stripe did not return a client secret.',
      );
    }

    await this.orderDb.bindStripePaymentIntent(order.id, intent.id);

    return {
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      ...responseBase,
    };
  }

  async syncPaymentStatus(
    userId: string,
    orderId: string,
  ): Promise<OrderPaymentStatusResponseDto> {
    const stripeCfg = this.requireStripe();
    const stripe = this.stripeClient(stripeCfg.secretKey);

    const order = await this.orderDb.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found.');
    }
    if (order.user_id !== userId) {
      throw new ForbiddenException('Order does not belong to this user.');
    }
    if (order.payment_method !== 'card') {
      throw new BadRequestException('Sync is only for card orders.');
    }
    if (order.payment_status !== 'unpaid') {
      throw new BadRequestException(
        `sync-payment-status only applies when payment_status is unpaid (current: ${order.payment_status}).`,
      );
    }
    if (!order.stripe_payment_intent_id) {
      throw new BadRequestException(
        'Order has no PaymentIntent to sync. Call POST /api/payments/intent first.',
      );
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
  }

  async handleWebhook(
    rawBody: Buffer,
    signature: string | undefined,
  ): Promise<void> {
    const stripeCfg = this.requireStripe();
    if (!stripeCfg.webhookSecret) {
      throw new ServiceUnavailableException(
        'STRIPE_WEBHOOK_SECRET is not configured for this deployment.',
      );
    }
    if (!signature) {
      throw new BadRequestException('Missing Stripe-Signature header.');
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
      throw new BadRequestException('Invalid Stripe webhook signature.');
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

    const updated = await this.orderDb.applyPaymentSucceeded(
      order.id,
      paymentIntentId,
    );
    if (updated?.payment_status === 'paid') {
      this.logger.log(`Order ${order.order_code} marked paid.`);
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
