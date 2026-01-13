// Hook to get current table session information
// Refactored to use React Query for better state management

import { useQuery } from '@tanstack/react-query';
import { TableService, SessionInfo } from '@/api/services/table.service';
import { queryKeys } from '@/lib/query-client';

export function useSession() {
  const { data: session, isLoading: loading, error } = useQuery<SessionInfo, Error>({
    queryKey: queryKeys.session,
    queryFn: async () => {
      try {
        const sessionData = await TableService.getCurrentSession();
        console.log('[useSession] Session data received:', sessionData);
        return sessionData;
      } catch (err) {
        console.error('[useSession] Failed to get session:', err);
        throw err;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes - session is stable
    refetchOnWindowFocus: false,
  });

  return { 
    session: session ?? null, 
    loading, 
    error: error ?? null 
  };
}
