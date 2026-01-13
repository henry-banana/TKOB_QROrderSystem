import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/database/prisma.service';
import { RedisService } from '@/modules/redis/redis.service';
import { OrderGateway } from '@/modules/websocket/gateways/order.gateway';
import { CreatePaymentIntentDto } from '../dto/create-payment-intent.dto';
import { PaymentIntentResponseDto } from '../dto/payment-intent-response.dto';
import { PaymentStatusResponseDto } from '../dto/payment-status-response.dto';
import { PaymentWebhookDto } from '../dto/payment-webhook.dto';
import { SepayProvider } from '../providers/sepay.provider';
import { PaymentMethod, PaymentStatus, OrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import {
  PaymentExpiredException,
  InvalidPaymentAmountException,
  OrderAlreadyHasPaymentException,
} from '../exceptions/payment.exceptions';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly paymentExpiryMinutes: number;
  private readonly CACHE_TTL = 300; // 5 minutes in seconds
  private readonly CACHE_PREFIX = 'payment:status:';

  constructor(
    private readonly prisma: PrismaService,
    private readonly sepayProvider: SepayProvider,
    private readonly configService: ConfigService,
    private readonly redis: RedisService,
    private readonly orderGateway: OrderGateway,
  ) {
    this.paymentExpiryMinutes =
      this.configService.get<number>('payment.paymentExpiryMinutes') || 15;
  }

  /**
   * Create payment intent for an order
   *
   * Flow:
   * 1. Validate order exists and belongs to tenant
   * 2. Check order doesn't already have a pending/paid payment
   * 3. Calculate amount from order total
   * 4. Call SePay provider to generate payment intent
   * 5. Create Payment record in database
   * 6. Return payment details to frontend
   *
   * @param tenantId - Tenant identifier
   * @param dto - Payment intent creation data
   * @returns Payment intent response with QR code and payment details
   * @throws NotFoundException if order not found
   * @throws BadRequestException if order already has active payment
   */
  async createPaymentIntent(
    tenantId: string,
    dto: CreatePaymentIntentDto,
  ): Promise<PaymentIntentResponseDto> {
    this.logger.log(
      `[${tenantId}] Creating payment intent for order ${dto.orderId}`,
    );

    // Use transaction to ensure atomicity
    return await this.prisma.$transaction(async (tx) => {
      // 1. Validate order exists and belongs to tenant
      const order = await tx.order.findFirst({
        where: {
          id: dto.orderId,
          tenantId,
        },
        select: {
          id: true,
          orderNumber: true,
          tenantId: true,
          total: true,
          paymentMethod: true,
          paymentStatus: true,
          status: true,
        },
      });

      if (!order) {
        this.logger.warn(
          `[${tenantId}] Order ${dto.orderId} not found or unauthorized`,
        );
        throw new NotFoundException(
          `Order ${dto.orderId} not found or you don't have permission to access it`,
        );
      }

      this.logger.debug(
        `[${tenantId}] Order ${order.orderNumber} found - Total: ${order.total} VND`,
      );

      // 2. Check if order already has an active payment
      const existingPayment = await tx.payment.findFirst({
        where: {
          orderId: order.id,
          status: {
            in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING, PaymentStatus.COMPLETED],
          },
        },
      });

      if (existingPayment) {
        this.logger.warn(
          `[${tenantId}] Order ${order.orderNumber} already has ${existingPayment.status} payment: ${existingPayment.id}`,
        );
        throw new OrderAlreadyHasPaymentException(order.id, existingPayment.id);
      }

      // 3. Calculate amount (convert Decimal to number)
      const amount = order.total.toNumber();

      if (amount <= 0) {
        throw new BadRequestException(
          `Invalid order amount: ${amount}. Amount must be greater than 0.`,
        );
      }

      // 4. Generate payment intent from SePay provider
      this.logger.debug(
        `[${tenantId}] Calling SePay provider to generate payment intent`,
      );

      const paymentIntent = await this.sepayProvider.createPaymentIntent(
        order.id,
        amount,
        'VND',
        {
          orderNumber: order.orderNumber,
          tenantId,
          returnUrl: dto.returnUrl,
          cancelUrl: dto.cancelUrl,
        },
      );

      // 5. Create Payment record
      const expiresAt = new Date(Date.now() + this.paymentExpiryMinutes * 60 * 1000);

      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          tenantId,
          method: PaymentMethod.SEPAY_QR,
          status: PaymentStatus.PENDING,
          amount: new Decimal(amount),
          currency: 'VND',
          bankCode: paymentIntent.bankCode,
          accountNumber: paymentIntent.accountNumber,
          qrContent: paymentIntent.qrContent,
          deepLink: paymentIntent.deepLink,
          transferContent: paymentIntent.transferContent,
          providerData: paymentIntent.providerData,
          expiresAt,
        },
      });

      this.logger.log(
        `[${tenantId}] Payment created: ${payment.id} for order ${order.orderNumber} - Amount: ${amount} VND - Expires: ${expiresAt.toISOString()}`,
      );

      // 6. Return response DTO
      return {
        paymentId: payment.id,
        orderId: payment.orderId,
        amount: payment.amount.toNumber(),
        currency: payment.currency,
        qrContent: payment.qrContent!,
        deepLink: payment.deepLink || undefined,
        transferContent: payment.transferContent!,
        accountNumber: payment.accountNumber!,
        bankCode: payment.bankCode!,
        status: payment.status,
        expiresAt: payment.expiresAt,
        createdAt: payment.createdAt,
      };
    });
  }

  /**
   * Get payment status by ID with Redis caching
   *
   * Flow:
   * 1. Check Redis cache first
   * 2. If cache miss, query database
   * 3. Transform to DTO
   * 4. Cache result for 5 minutes
   * 5. Return payment status with order details
   *
   * @param paymentId - Payment identifier
   * @returns Payment status with order information
   * @throws NotFoundException if payment not found
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponseDto> {
    this.logger.log(`Getting payment status for ${paymentId}`);

    // 1. Try to get from cache
    const cacheKey = `${this.CACHE_PREFIX}${paymentId}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      this.logger.debug(`Cache hit for payment ${paymentId}`);
      return JSON.parse(cached);
    }

    this.logger.debug(`Cache miss for payment ${paymentId}, querying database`);

    // 2. Query database
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          select: {
            status: true,
            orderNumber: true,
          },
        },
      },
    });

    if (!payment) {
      this.logger.warn(`Payment ${paymentId} not found`);
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }

    // 3. Transform to DTO
    const response: PaymentStatusResponseDto = {
      paymentId: payment.id,
      orderId: payment.orderId,
      method: payment.method,
      status: payment.status,
      amount: payment.amount.toNumber(),
      currency: payment.currency,
      transactionId: payment.transactionId || undefined,
      paidAt: payment.paidAt || undefined,
      failureReason: payment.failureReason || undefined,
      orderStatus: payment.order.status,
      expiresAt: payment.expiresAt,
      createdAt: payment.createdAt,
    };

    // 4. Cache the result for 5 minutes
    await this.redis.set(cacheKey, JSON.stringify(response), this.CACHE_TTL);
    this.logger.debug(`Cached payment status for ${paymentId} (TTL: ${this.CACHE_TTL}s)`);

    return response;
  }

  /**
   * Handle webhook from SePay
   *
   * Flow:
   * 1. Verify webhook signature
   * 2. Extract and validate webhook data
   * 3. Find payment by transfer content
   * 4. Check idempotency (transaction ID)
   * 5. Update payment status and record transaction details
   * 6. Update order status and payment status
   * 7. Create order status history entry
   * 8. Emit WebSocket event (placeholder for EPIC 5)
   * 9. Return success response
   *
   * @param webhookData - Webhook payload from SePay
   * @param signature - Authorization header signature
   * @returns void (SePay expects HTTP 200 with {success: true})
   * @throws UnauthorizedException if signature invalid
   * @throws NotFoundException if payment not found
   * @throws BadRequestException if data invalid
   */
  async handleWebhook(
    webhookData: PaymentWebhookDto,
    signature: string,
  ): Promise<{ success: boolean; message?: string }> {
    this.logger.log(
      `[Webhook] Received webhook - TransactionID: ${webhookData.transactionId}, Content: ${webhookData.transferContent}, Amount: ${webhookData.amount}, Status: ${webhookData.status}`,
    );

    // 1. Verify signature
    const isValidSignature = this.sepayProvider.verifyWebhookSignature(
      webhookData,
      signature,
    );

    if (!isValidSignature) {
      this.logger.error(
        `[Webhook] Invalid signature for transaction ${webhookData.transactionId}`,
      );
      throw new UnauthorizedException('Invalid webhook signature');
    }

    this.logger.debug(
      `[Webhook] Signature verified for transaction ${webhookData.transactionId}`,
    );

    // 2. Validate webhook data
    if (!webhookData.transferContent || !webhookData.transactionId) {
      this.logger.error(
        `[Webhook] Missing required fields - TransactionID: ${webhookData.transactionId}, Content: ${webhookData.transferContent}`,
      );
      throw new BadRequestException(
        'Missing required webhook fields: transferContent or transactionId',
      );
    }

    // Use transaction for atomicity
    return await this.prisma.$transaction(async (tx) => {
      // 3. Find payment by transfer content
      const payment = await tx.payment.findFirst({
        where: {
          transferContent: webhookData.transferContent,
          status: {
            in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING],
          },
        },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              tenantId: true,
              status: true,
              paymentStatus: true,
            },
          },
        },
      });

      if (!payment) {
        this.logger.warn(
          `[Webhook] Payment not found or already processed - Content: ${webhookData.transferContent}`,
        );
        // Return success to prevent SePay retry (idempotency)
        return {
          success: true,
          message: 'Payment not found or already processed',
        };
      }

      this.logger.debug(
        `[Webhook] Payment found: ${payment.id} for order ${payment.order.orderNumber}`,
      );

      // 4. Check idempotency - has this transaction been processed?
      if (payment.transactionId === webhookData.transactionId) {
        this.logger.warn(
          `[Webhook] Duplicate webhook - Transaction ${webhookData.transactionId} already processed for payment ${payment.id}`,
        );
        return {
          success: true,
          message: 'Transaction already processed (idempotent)',
        };
      }

      // 5. Determine payment status from webhook
      const isSuccess = webhookData.status === 'success';
      const newPaymentStatus = isSuccess
        ? PaymentStatus.COMPLETED
        : PaymentStatus.FAILED;

      // Validate amount matches
      const expectedAmount = payment.amount.toNumber();
      if (Math.abs(webhookData.amount - expectedAmount) > 0.01) {
        this.logger.error(
          `[Webhook] Amount mismatch - Expected: ${expectedAmount}, Received: ${webhookData.amount} for payment ${payment.id}`,
        );
        throw new InvalidPaymentAmountException(expectedAmount, webhookData.amount);
      }

      // 6. Update payment record
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: newPaymentStatus,
          transactionId: webhookData.transactionId,
          paidAt: isSuccess ? new Date(webhookData.transactionTime) : null,
          failureReason: isSuccess ? null : 'Payment failed from provider',
          providerData: {
            ...(payment.providerData as any),
            webhook: {
              transactionId: webhookData.transactionId,
              bankCode: webhookData.bankCode,
              accountNumber: webhookData.accountNumber,
              transactionTime: webhookData.transactionTime,
              status: webhookData.status,
              metadata: webhookData.metadata,
              processedAt: new Date().toISOString(),
            },
          },
        },
      });

      this.logger.log(
        `[Webhook] Payment ${payment.id} updated to ${newPaymentStatus} - Transaction: ${webhookData.transactionId}`,
      );

      // Invalidate cache after webhook update
      const cacheKey = `${this.CACHE_PREFIX}${payment.id}`;
      await this.redis.del(cacheKey);
      this.logger.debug(`Invalidated cache for payment ${payment.id}`);

      // 7. Update order status if payment successful
      let updatedOrder;
      if (isSuccess) {
        // Update order payment status and potentially order status
        const newOrderStatus =
          payment.order.status === OrderStatus.PENDING
            ? OrderStatus.RECEIVED
            : payment.order.status;

        updatedOrder = await tx.order.update({
          where: { id: payment.order.id },
          data: {
            paymentStatus: PaymentStatus.COMPLETED,
            paidAt: new Date(webhookData.transactionTime),
            status: newOrderStatus,
          },
        });

        // 8. Create order status history
        if (newOrderStatus !== payment.order.status) {
          await tx.orderStatusHistory.create({
            data: {
              orderId: payment.order.id,
              status: newOrderStatus,
              notes: `Order status auto-updated after payment completed. Transaction: ${webhookData.transactionId}`,
            },
          });

          this.logger.log(
            `[Webhook] Order ${payment.order.orderNumber} status updated: ${payment.order.status} → ${newOrderStatus}`,
          );
        }

        this.logger.log(
          `[Webhook] Order ${payment.order.orderNumber} payment completed - Amount: ${webhookData.amount} VND`,
        );
      } else {
        // Payment failed - update order payment status
        updatedOrder = await tx.order.update({
          where: { id: payment.order.id },
          data: {
            paymentStatus: PaymentStatus.FAILED,
          },
        });

        this.logger.warn(
          `[Webhook] Order ${payment.order.orderNumber} payment failed - Transaction: ${webhookData.transactionId}`,
        );
      }

      // 9. Emit WebSocket event for payment completion
      this.orderGateway.emitPaymentCompleted(payment.order.tenantId, payment.order.id, {
        id: payment.id,
        status: newPaymentStatus,
        amount: payment.amount.toNumber(),
        transactionId: webhookData.transactionId,
        paidAt: isSuccess ? new Date(webhookData.transactionTime) : null,
        orderNumber: payment.order.orderNumber,
        orderStatus: updatedOrder.status,
      });
      this.logger.debug(
        `Emitted order:payment_completed event for order ${payment.order.id}`,
      );

      this.logger.log(
        `[Webhook] Successfully processed webhook for payment ${payment.id} - Status: ${newPaymentStatus}`,
      );

      return {
        success: true,
        message: `Payment ${isSuccess ? 'completed' : 'failed'} successfully`,
      };
    });
  }
}
