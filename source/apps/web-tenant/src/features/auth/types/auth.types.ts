// Auth Types - Shared types for Auth features

export type UserRole = 'admin' | 'kds' | 'waiter';

export interface LoginCredentials {
  email: string;
  password: string;
  deviceInfo?: string;
}

export interface SignupData {
  tenantName: string;
  slug: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyOtpData {
  email: string;
  otp: string;
}

export interface RegisterConfirmData {
  registrationToken: string;
  otp: string;
}

export interface ResendOtpData {
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  registrationToken?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    tenantId: string;
  };
}

export interface OtpVerificationResponse {
  success: boolean;
  message?: string;
  verified: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    tenantId: string;
  };
}

export interface SlugAvailabilityResponse {
  available: boolean;
  message?: string;
}
