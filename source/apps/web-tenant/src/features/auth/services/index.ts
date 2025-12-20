// Auth Service - Public API exports

export { authService } from './auth.service';
export type {
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
  UserRole,
} from '../types/auth.types';
