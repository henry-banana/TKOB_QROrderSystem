/**
 * Menu React Query Hooks
 * Uses factory pattern to switch between mock and API adapters
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuAdapter } from '../data/factory';
import type { 
  CreateMenuCategoryDto, 
  UpdateMenuCategoryDto,
  CreateMenuItemDto,
  UpdateMenuItemDto,
  CreateModifierGroupDto,
  UpdateModifierGroupDto
} from '@/services/generated/models';

/**
 * Menu Categories Hooks
 */
export const useMenuCategories = () => {
  return useQuery({
    queryKey: ['menu', 'categories'],
    queryFn: () => menuAdapter.categories.findAll(),
  });
};

export const useCreateCategory = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMenuCategoryDto) => menuAdapter.categories.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'categories'] });
      options?.mutation?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};

export const useUpdateCategory = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMenuCategoryDto }) => 
      menuAdapter.categories.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'categories'] });
      options?.mutation?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};

export const useDeleteCategory = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => menuAdapter.categories.delete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'categories'] });
      options?.mutation?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};

/**
 * Menu Items Hooks
 */

interface UseMenuItemsParams {
  categoryId?: string;
  status?: string;
  availability?: 'available' | 'unavailable';
  chefRecommended?: boolean;
  searchQuery?: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}

export const useMenuItems = (params?: UseMenuItemsParams) => {
  return useQuery({
    queryKey: ['menu', 'items', params],
    queryFn: () => {
      // Pass pagination and filter params to adapter
      return menuAdapter.items.findAll(params);
    },
  });
};

export const useCreateMenuItem = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMenuItemDto) => menuAdapter.items.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'items'] });
      options?.mutation?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};

export const useUpdateMenuItem = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMenuItemDto }) => 
      menuAdapter.items.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'items'] });
      options?.mutation?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};

export const useDeleteMenuItem = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => menuAdapter.items.delete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'items'] });
      options?.mutation?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};

/**
 * Modifiers Hooks
 */
export const useModifiers = (params?: { activeOnly?: boolean }) => {
  return useQuery({
    queryKey: ['menu', 'modifiers', params],
    queryFn: () => menuAdapter.modifiers.findAll(),
  });
};

export const useCreateModifier = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => menuAdapter.modifiers.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'modifiers'] });
      options?.mutation?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};

export const useUpdateModifier = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      menuAdapter.modifiers.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'modifiers'] });
      options?.mutation?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};

export const useDeleteModifier = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => menuAdapter.modifiers.delete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'modifiers'] });
      options?.mutation?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};

/**
 * Menu Items - FindOne Hook
 */
export const useMenuItem = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['menu', 'items', id],
    queryFn: () => menuAdapter.items.findOne(id),
    enabled: options?.enabled ?? !!id,
  });
};

/**
 * Menu Items - Toggle Availability Hook
 */
export const useToggleItemAvailability = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      menuAdapter.items.toggleAvailability(id, { isAvailable }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'items'] });
      options?.mutation?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};

/**
 * Menu Categories - FindOne Hook
 */
export const useCategory = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['menu', 'categories', id],
    queryFn: () => menuAdapter.categories.findOne(id),
    enabled: options?.enabled ?? !!id,
  });
};

/**
 * Menu Photos Hooks
 */
export const useUploadPhoto = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, file }: { itemId: string; file: File }) =>
      menuAdapter.photos.upload(itemId, { file }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'items'] });
      queryClient.invalidateQueries({ queryKey: ['menu', 'photos'] });
      options?.mutation?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};

export const useDeletePhoto = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, photoId }: { itemId: string; photoId: string }) =>
      menuAdapter.photos.delete(itemId, photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'items'] });
      queryClient.invalidateQueries({ queryKey: ['menu', 'photos'] });
      options?.mutation?.onSuccess?.();
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};

export const useItemPhotos = (itemId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['menu', 'photos', itemId],
    queryFn: () => menuAdapter.photos.getPhotos(itemId),
    enabled: options?.enabled ?? !!itemId,
  });
};

export const useSetPrimaryPhoto = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, photoId }: { itemId: string; photoId: string }) =>
      menuAdapter.photos.setPrimary(itemId, photoId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'items'] });
      queryClient.invalidateQueries({ queryKey: ['menu', 'photos'] });
      options?.mutation?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};
