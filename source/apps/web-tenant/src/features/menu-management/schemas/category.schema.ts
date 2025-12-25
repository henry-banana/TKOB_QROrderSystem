import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string()
    .min(2, 'Category name must be at least 2 characters')
    .max(50, 'Category name must not exceed 50 characters'),
  description: z.string().optional().nullable().default(null),
  displayOrder: z.union([
    z.coerce.number().int('Display order must be a whole number').nonnegative('Display order must be 0 or higher'),
    z.literal('')
  ]).optional().nullable().transform((val) => val === '' ? null : val).default(null),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
}) as any;

export type CategoryFormData = {
  name: string;
  description?: string | null;
  displayOrder?: number | string | null;
  status: 'ACTIVE' | 'INACTIVE';
};
