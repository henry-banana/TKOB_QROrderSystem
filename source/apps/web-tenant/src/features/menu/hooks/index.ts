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
export const useMenuItems = () => {
  return useQuery({
    queryKey: ['menu', 'items'],
    queryFn: () => menuAdapter.items.findAll(),
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
 * Menu Photos Hooks
 */
export const useUploadPhoto = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => menuAdapter.photos.upload(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'items'] });
      options?.mutation?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};

export const useDeletePhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (photoId: string) => menuAdapter.photos.delete(photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'items'] });
    },
  });
};
