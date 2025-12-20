// Auth Adapter Interface - Contract for both Mock and API implementations

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

export interface IAuthAdapter {
  /**
   * Login with email and password
   */
  login(credentials: LoginCredentials): Promise<AuthResponse>;

  /**
   * Sign up new tenant
   */
  signup(data: SignupData): Promise<AuthResponse>;

  /**
   * Request password reset
   */
  forgotPassword(data: ForgotPasswordData): Promise<{ success: boolean; message: string }>;

  /**
   * Reset password with token
   */
  resetPassword(data: ResetPasswordData): Promise<{ success: boolean; message: string }>;

  /**
   * Verify OTP code
   */
  verifyOtp(data: RegisterConfirmData): Promise<OtpVerificationResponse>;

  /**
   * Resend OTP code
   */
  resendOtp(data: ResendOtpData): Promise<{ success: boolean; message: string }>;

  /**
   * Check slug availability
   */
  checkSlugAvailability(slug: string): Promise<SlugAvailabilityResponse>;

  /**
   * Logout current user
   */
  logout(refreshToken?: string): Promise<void>;
}
