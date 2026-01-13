import { useQuery } from '@tanstack/react-query'
import { MenuService } from '@/api/services/menu.service'
import { MenuItem, ApiResponse } from '@/types'
import { queryKeys } from '@/lib/query-client'

interface UseMenuItemReturn {
  item: MenuItem | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Hook to fetch single menu item by ID
 */
export function useMenuItem(itemId: string): UseMenuItemReturn {
  const { data, isLoading, error, refetch } = useQuery<ApiResponse<MenuItem>, Error>({
    queryKey: queryKeys.menuItem(itemId),
    queryFn: () => MenuService.getMenuItem(itemId),
    enabled: !!itemId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    item: data?.data ?? null,
    isLoading,
    error: error?.message ?? null,
    refetch,
  }
}

interface UseMenuReturn {
  data: MenuItem[] | null
  items: MenuItem[]
  categories: string[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Hook to fetch public menu (session-based)
 * No token needed - uses HttpOnly cookie automatically
 */
export function useMenu(tenantId?: string): UseMenuReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.menu(tenantId),
    queryFn: async () => {
      if (!tenantId) {
        throw new Error('Tenant ID is required')
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[useMenu] fetching menu for tenant:', tenantId)
      }
      
      const response = await MenuService.getPublicMenu(tenantId)
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch menu')
      }
      
      return response.data
    },
    enabled: !!tenantId,
    staleTime: 2 * 60 * 1000, // 2 minutes - menu doesn't change often
    refetchOnWindowFocus: false,
  })

  return {
    data: data?.items ?? null,
    items: data?.items ?? [],
    categories: data?.categories ?? [],
    isLoading,
    error: error?.message ?? null,
    refetch,
  }
}

  useEffect(() => {
    fetchMenu()
  }, [tenantId])

  return {
    data: items,
    items,
    categories,
    isLoading,
    error,
    refetch: fetchMenu,
  }
}
