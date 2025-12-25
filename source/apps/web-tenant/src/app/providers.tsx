'use client';

import { ReactNode, useEffect } from 'react';
import { ReactQueryProvider } from '@/lib/providers/ReactQueryProvider';
import { AuthProvider } from '@/shared/context/AuthContext';
import { Toaster } from 'sonner';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Auto-inject mock token in mock mode
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      const existingToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!existingToken) {
        console.log('🎭 [Providers] Mock Mode - Auto-injecting mock token');
        const mockToken = `mock_token_${Date.now()}`;
        localStorage.setItem('authToken', mockToken);
      }
    }
  }, []);

  return (
    <ReactQueryProvider>
      <AuthProvider>
        {children}
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </ReactQueryProvider>
  );
}
