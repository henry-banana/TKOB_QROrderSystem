/**
 * Auth Adapter Factory
 * Switches between Mock and Real API based on environment
 */

import type { IAuthAdapter } from './types';
import { AuthApiAdapter } from './api';
import { AuthMockAdapter } from './mock';

const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

/**
 * Get the auth adapter based on environment
 */
export const getAuthAdapter = (): IAuthAdapter => {
  if (useMockData) {
    console.log('🎭 [AuthAdapter] Using Mock Adapter');
    return new AuthMockAdapter();
  }
  console.log('🌐 [AuthAdapter] Using Real API Adapter');
  return new AuthApiAdapter();
};

/**
 * Singleton instance
 */
export const authAdapter = getAuthAdapter();
