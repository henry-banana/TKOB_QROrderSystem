// Mock Auth Adapter - Returns mock data for development

import type { IAuthAdapter } from './auth-adapter.interface';
import type {
  LoginCredentials,
  SignupData,
  ForgotPasswordData,
  ResetPasswordData,
  VerifyOtpData,
  RegisterConfirmData,
  ResendOtpData,
  AuthResponse,
  OtpVerificationResponse,
  SlugAvailabilityResponse,
} from '../types/auth.types';

export class MockAuthAdapter implements IAuthAdapter {
  private readonly MOCK_DELAY = 1000; // Simulate network delay

  private delay(ms: number = this.MOCK_DELAY): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('[MockAuthAdapter] Login called with:', credentials.email);
    await this.delay();

    // Accept any email/password for mock
    // Check for specific test accounts
    if (credentials.email === 'error@test.com') {
      return {
        success: false,
        message: 'Invalid credentials',
      };
    }

    // Determine role based on email
    let role: 'admin' | 'kds' | 'waiter' = 'admin';
    if (credentials.email.includes('kds') || credentials.email.includes('kitchen')) {
      role = 'kds';
    } else if (credentials.email.includes('waiter') || credentials.email.includes('server')) {
      role = 'waiter';
    }

    return {
      success: true,
      message: 'Login successful',
      token: `mock-token-${Date.now()}`,
      user: {
        id: `mock-user-${role}`,
        email: credentials.email,
        name: `Mock ${role.charAt(0).toUpperCase() + role.slice(1)} User`,
        role,
        tenantId: 'mock-tenant-001',
      },
    };
  }

  async signup(data: SignupData): Promise<AuthResponse> {
    console.log('[MockAuthAdapter] Signup called with:', data);
    await this.delay();

    // Validate mock data
    if (data.password !== data.confirmPassword) {
      return {
        success: false,
        message: 'Passwords do not match',
      };
    }

    if (data.email === 'existing@test.com') {
      return {
        success: false,
        message: 'Email already exists',
      };
    }

    return {
      success: true,
      message: 'Signup successful. Please verify your email.',
      registrationToken: `mock-token-${Date.now()}`,
    };
  }

  async forgotPassword(data: ForgotPasswordData): Promise<{ success: boolean; message: string }> {
    console.log('[MockAuthAdapter] Forgot password called with:', data.email);
    await this.delay();

    if (data.email === 'notfound@test.com') {
      return {
        success: false,
        message: 'Email not found',
      };
    }

    return {
      success: true,
      message: 'Password reset link sent to your email',
    };
  }

  async resetPassword(data: ResetPasswordData): Promise<{ success: boolean; message: string }> {
    console.log('[MockAuthAdapter] Reset password called');
    await this.delay();

    if (data.newPassword !== data.confirmPassword) {
      return {
        success: false,
        message: 'Passwords do not match',
      };
    }

    if (data.token === 'expired') {
      return {
        success: false,
        message: 'Reset token has expired',
      };
    }

    return {
      success: true,
      message: 'Password reset successful',
    };
  }

  async verifyOtp(data: RegisterConfirmData): Promise<OtpVerificationResponse> {
    console.log('[MockAuthAdapter] Verify OTP called with registrationToken');
    await this.delay(1500);

    // Accept 123456 as valid OTP
    if (data.otp === '123456') {
      return {
        success: true,
        message: 'OTP verified successfully',
        verified: true,
        token: `mock-token-${Date.now()}`,
        user: {
          id: 'mock-user-admin',
          email: 'admin@test.com',
          name: 'Mock Admin',
          role: 'admin',
          tenantId: 'mock-tenant-001',
        },
      };
    }

    return {
      success: false,
      message: 'Invalid OTP code',
      verified: false,
    };
  }

  async resendOtp(data: ResendOtpData): Promise<{ success: boolean; message: string }> {
    console.log('[MockAuthAdapter] Resend OTP called with:', data.email);
    await this.delay();

    return {
      success: true,
      message: 'OTP code sent successfully',
    };
  }

  async checkSlugAvailability(slug: string): Promise<SlugAvailabilityResponse> {
    console.log('[MockAuthAdapter] Check slug availability:', slug);
    await this.delay(500);

    // Mock reserved slugs
    const reservedSlugs = ['admin', 'api', 'dashboard', 'login', 'signup', 'test-restaurant'];

    if (reservedSlugs.includes(slug.toLowerCase())) {
      return {
        available: false,
        message: 'This slug is already taken or reserved',
      };
    }

    return {
      available: true,
      message: 'Slug is available',
    };
  }

  async logout(_refreshToken?: string): Promise<void> {
    console.log('[MockAuthAdapter] Logout called');
    await this.delay(300);
    // Mock logout - no actual operation needed
  }
}
