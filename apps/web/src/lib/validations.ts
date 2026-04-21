import { z } from 'zod';

const passwordRule = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
  .regex(/\d/, 'Password must contain at least one number.');

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});
export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters.'),
  email: z.string().email('Enter a valid email address.'),
  password: passwordRule,
  phone: z.string().optional(),
});
export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
});
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordRule,
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ─── Restaurant ───────────────────────────────────────────────────────────────

export const createRestaurantSchema = z.object({
  name: z.string().min(1, 'Name is required.').max(120),
  logoUrl: z.string().url().optional().or(z.literal('')),
});
export type CreateRestaurantFormData = z.infer<typeof createRestaurantSchema>;

// ─── Branch ───────────────────────────────────────────────────────────────────

export const createBranchSchema = z.object({
  name: z.string().min(1, 'Name is required.').max(120),
  address: z.string().optional(),
  phone: z.string().optional(),
});
export type CreateBranchFormData = z.infer<typeof createBranchSchema>;

// ─── Menu ─────────────────────────────────────────────────────────────────────

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required.').max(80),
  sortOrder: z.coerce.number().min(0).optional(),
});
export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;

export const createMenuItemSchema = z.object({
  categoryId: z.string().uuid('Select a category.'),
  name: z.string().min(1, 'Name is required.').max(120),
  description: z.string().max(500).optional(),
  basePrice: z.coerce.number().min(0, 'Price must be positive.'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isAvailable: z.boolean().optional(),
  sortOrder: z.coerce.number().min(0).optional(),
});
export type CreateMenuItemFormData = z.infer<typeof createMenuItemSchema>;

// ─── Staff ────────────────────────────────────────────────────────────────────

export const inviteStaffSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  role: z.enum(['manager', 'cashier', 'kitchen']),
});
export type InviteStaffFormData = z.infer<typeof inviteStaffSchema>;
