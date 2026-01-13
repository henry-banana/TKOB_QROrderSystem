import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  IPaymentProvider,
  PaymentIntent,
  PaymentStatusResult,
  PaymentProviderException,
  PaymentProviderNetworkException,
  PaymentProviderRateLimitException,
  PaymentProviderInvalidRequestException,
} from '../interfaces/payment-provider.interface';

/**
 * SePay Payment Provider Implementation
 *
 * Integrates with SePay VietQR API for bank transfer payments.
 * Docs: https://docs.sepay.vn
 */
@Injectable()
export class SepayProvider implements IPaymentProvider {
  private readonly logger = new Logger(SepayProvider.name);
  private readonly httpClient: AxiosInstance;
  private readonly apiUrl: string;
  private readonly apiToken: string;
  private readonly accountNumber: string;
  private readonly accountName: string;
  private readonly bankCode: string;
  private readonly retryAttempts: number = 3;
  private readonly retryDelay: number = 1000; // ms

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('payment.sepay.apiUrl')!;
    this.apiToken = this.configService.get<string>('payment.sepay.secretKey')!;
    this.accountNumber = this.configService.get<string>(
      'payment.sepay.accountNumber',
    )!;
    this.accountName = this.configService.get<string>(
      'payment.sepay.accountName',
    )!;
    this.bankCode = this.configService.get<string>('payment.sepay.bankCode')!;

    // Validate required config
    if (!this.apiToken || !this.accountNumber || !this.bankCode) {
      throw new Error(
        'Missing required SePay configuration. Check SEPAY_SECRET_KEY, SEPAY_ACCOUNT_NUMBER, SEPAY_BANK_CODE in .env',
      );
    }

    // Create axios instance with defaults
    this.httpClient = axios.create({
      baseURL: this.apiUrl,
      timeout: 10000, // 10s timeout
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiToken}`,
      },
    });

    // Add response interceptor for logging
    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.debug(
          `SePay API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`,
        );
        return response;
      },
      (error) => {
        if (error.response) {
          this.logger.error(
            `SePay API Error: ${error.config.method?.toUpperCase()} ${error.config.url} - Status: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
          );
        } else if (error.request) {
          this.logger.error(
            `SePay Network Error: No response received - ${error.message}`,
          );
        } else {
          this.logger.error(`SePay Request Error: ${error.message}`);
        }
        return Promise.reject(error);
      },
    );

    this.logger.log(
      `SePay Provider initialized - Bank: ${this.bankCode}, Account: ${this.accountNumber}`,
    );
  }

  /**
   * Create payment intent with SePay
   *
   * SePay uses bank transfer model - we generate transfer content and return bank details.
   * No API call needed for basic implementation, just return bank account info.
   *
   * @param orderId - Order identifier
   * @param amount - Payment amount in VND
   * @param currency - Currency code (VND)
   * @param metadata - Additional metadata
   * @returns Payment intent with QR code and payment details
   */
  async createPaymentIntent(
    orderId: string,
    amount: number,
    currency: string,
    metadata?: Record<string, any>,
  ): Promise<PaymentIntent> {
    this.logger.log(
      `Creating payment intent for order ${orderId} - Amount: ${amount} ${currency}`,
    );

    try {
      // Generate transfer content (used to match payment)
      const transferContent = this.generateTransferContent(orderId);

      // Generate VietQR content (for QR code generation)
      // Format: bank_code|account_number|account_name|amount|transfer_content
      const qrContent = this.generateVietQRContent(
        amount,
        transferContent,
      );

      // Generate deep link for mobile banking apps
      const deepLink = this.generateDeepLink(amount, transferContent);

      // Return payment intent (no API call needed for basic SePay)
      const paymentIntent: PaymentIntent = {
        paymentId: '', // Will be set by PaymentService
        orderId,
        amount,
        currency,
        qrContent,
        deepLink,
        transferContent,
        accountNumber: this.accountNumber,
        accountName: this.accountName,
        bankCode: this.bankCode,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        providerData: {
          provider: 'sepay',
          version: '1.0',
          ...metadata,
        },
      };

      this.logger.log(
        `Payment intent created for order ${orderId} - Transfer: ${transferContent}`,
      );
      return paymentIntent;
    } catch (error) {
      this.logger.error(
        `Failed to create payment intent for order ${orderId}: ${error.message}`,
      );
      throw new PaymentProviderException(
        'Failed to create payment intent',
        'CREATE_INTENT_ERROR',
        500,
      );
    }
  }

  /**
   * Verify webhook signature from SePay
   *
   * SePay webhook authentication uses API Key in header:
   * Authorization: Apikey YOUR_API_KEY
   *
   * @param payload - Raw webhook payload
   * @param signature - Signature from Authorization header
   * @param secret - Optional webhook secret (not used by SePay)
   * @returns true if signature is valid
   */
  verifyWebhookSignature(
    payload: any,
    signature: string,
    secret?: string,
  ): boolean {
    this.logger.debug('Verifying SePay webhook signature');

    try {
      // SePay webhook uses: Authorization: Apikey YOUR_API_KEY
      // Extract the API key from signature (format: "Apikey XXXXX")
      const expectedPrefix = 'Apikey ';
      if (!signature.startsWith(expectedPrefix)) {
        this.logger.warn(
          `Invalid signature format. Expected "Apikey XXX", got: ${signature}`,
        );
        return false;
      }

      const providedApiKey = signature.substring(expectedPrefix.length).trim();

      // Compare with our API token
      const isValid = providedApiKey === this.apiToken;

      if (!isValid) {
        this.logger.warn('Webhook signature verification failed - Invalid API key');
      } else {
        this.logger.debug('Webhook signature verified successfully');
      }

      return isValid;
    } catch (error) {
      this.logger.error(`Webhook signature verification error: ${error.message}`);
      return false;
    }
  }

  /**
   * Get payment status from SePay
   *
   * Note: SePay primarily uses webhook for notifications.
   * This method can be used for manual status polling if needed.
   *
   * @param transactionId - Provider's transaction ID
   * @returns Payment status result
   */
  async getPaymentStatus(transactionId: string): Promise<PaymentStatusResult> {
    this.logger.log(`Getting payment status from SePay: ${transactionId}`);

    try {
      // SePay doesn't have a dedicated status endpoint in basic plan
      // Status updates come via webhook
      // For now, we'll return a placeholder response
      throw new PaymentProviderException(
        'Status polling not available. Use webhook for payment updates.',
        'STATUS_NOT_AVAILABLE',
        501,
      );
    } catch (error) {
      if (error instanceof PaymentProviderException) {
        throw error;
      }

      this.logger.error(
        `Failed to get payment status: ${error.message}`,
      );
      throw new PaymentProviderException(
        'Failed to get payment status',
        'STATUS_ERROR',
        500,
      );
    }
  }

  /**
   * Generate transfer content for payment matching
   *
   * Format: DH{orderId}
   * Example: DH123456
   *
   * @param orderId - Order identifier
   * @returns Transfer content string
   */
  private generateTransferContent(orderId: string): string {
    return `DH${orderId}`;
  }

  /**
   * Generate VietQR content string
   *
   * VietQR Format (compact):
   * 2|{bank_code}|{account_number}|{account_name}|{amount}|{content}|0
   *
   * @param amount - Payment amount
   * @param transferContent - Transfer content/description
   * @returns VietQR content string
   */
  private generateVietQRContent(
    amount: number,
    transferContent: string,
  ): string {
    // VietQR Compact Format v2
    return `2|${this.bankCode}|${this.accountNumber}|${this.accountName}|${amount}|${transferContent}|0`;
  }

  /**
   * Generate deep link for mobile banking apps
   *
   * Format: Banking app specific URL schemes
   * For now, return a generic banking URL
   *
   * @param amount - Payment amount
   * @param transferContent - Transfer content
   * @returns Deep link URL
   */
  private generateDeepLink(amount: number, transferContent: string): string {
    // Generic banking deep link (works with most Vietnamese banking apps)
    const params = new URLSearchParams({
      bankCode: this.bankCode,
      accountNumber: this.accountNumber,
      accountName: this.accountName,
      amount: amount.toString(),
      content: transferContent,
    });

    return `banking://transfer?${params.toString()}`;
  }

  /**
   * Execute HTTP request with retry logic
   *
   * Implements exponential backoff for transient failures (network errors, 5xx).
   * Does not retry 4xx errors.
   *
   * @param requestFn - Function that returns axios promise
   * @param attempt - Current attempt number
   * @returns Response data
   * @throws PaymentProviderException on final failure
   */
  private async executeWithRetry<T>(
    requestFn: () => Promise<T>,
    attempt: number = 1,
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      const isRetryable = this.isRetryableError(error);
      const shouldRetry = isRetryable && attempt < this.retryAttempts;

      if (!shouldRetry) {
        throw this.handleHttpError(error);
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = this.retryDelay * Math.pow(2, attempt - 1);
      this.logger.warn(
        `Request failed (attempt ${attempt}/${this.retryAttempts}). Retrying in ${delay}ms...`,
      );

      await this.sleep(delay);
      return this.executeWithRetry(requestFn, attempt + 1);
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      // Network errors (no response)
      if (!axiosError.response) {
        return true;
      }

      // Server errors (5xx)
      const status = axiosError.response.status;
      if (status >= 500 && status < 600) {
        return true;
      }

      // Rate limit (429) - retryable after delay
      if (status === 429) {
        return true;
      }
    }

    return false;
  }

  /**
   * Handle HTTP errors and convert to PaymentProviderException
   */
  private handleHttpError(error: any): PaymentProviderException {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      // Network error (no response)
      if (!axiosError.response) {
        return new PaymentProviderNetworkException(
          `Network error: ${axiosError.message}`,
          axiosError,
        );
      }

      const status = axiosError.response.status;
      const data = axiosError.response.data;

      // Rate limit
      if (status === 429) {
        const retryAfter = axiosError.response.headers['retry-after'];
        return new PaymentProviderRateLimitException(
          'Rate limit exceeded',
          retryAfter ? parseInt(retryAfter) : undefined,
        );
      }

      // Client error (4xx)
      if (status >= 400 && status < 500) {
        return new PaymentProviderInvalidRequestException(
          `Invalid request: ${JSON.stringify(data)}`,
          data,
        );
      }

      // Server error (5xx)
      return new PaymentProviderException(
        `Server error: ${status}`,
        'SERVER_ERROR',
        status,
        data,
      );
    }

    // Unknown error
    return new PaymentProviderException(
      error.message || 'Unknown error',
      'UNKNOWN_ERROR',
      500,
    );
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
