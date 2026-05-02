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
  restaurantId: z.string().uuid('Select a restaurant.'),
  name: z.string().min(1, 'Name is required.').max(120),
  address: z.string().optional(),
  phone: z.string().optional(),
  managerName: z.string().min(2, 'Manager name is required.'),
  managerEmail: z.string().email('Enter a valid manager email.'),
});
export type CreateBranchFormData = z.infer<typeof createBranchSchema>;

// ─── Menu ─────────────────────────────────────────────────────────────────────

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required.').max(80),
  parentId: z.string().uuid().optional().or(z.literal('')),
  coverUrl: z.string().url().optional().or(z.literal('')),
  description: z.string().max(300).optional(),
  sortOrder: z.coerce.number().min(0).optional(),
  isActive: z.boolean().optional(),
});
export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;

const priceVariantRowSchema = z.object({
  label: z.string().min(1, 'Variant label is required.').max(60),
  price: z.coerce.number().min(0, 'Variant price must be positive.'),
});

export const createMenuItemSchema = z.object({
  categoryId: z.string().uuid('Select a category.'),
  name: z.string().min(1, 'Name is required.').max(120),
  description: z.string().max(600).optional(),
  basePrice: z.coerce.number().min(0, 'Price must be positive.'),
  discountedPrice: z.coerce.number().min(0, 'Discount must be positive.').optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  galleryUrls: z.array(z.string().url()).optional(),
  priceVariants: z.array(priceVariantRowSchema).optional(),
  label: z
    .enum([
      'none',
      'new_item',
      'bestseller',
      'spicy',
      'vegetarian',
      'vegan',
      'gluten_free',
      'chef_special',
      'limited',
    ])
    .optional(),
  tags: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
  calories: z.coerce.number().int().min(0).max(9999).optional(),
  prepTime: z.coerce.number().int().min(0).optional(),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  availableFrom: z.string().optional(),
  availableTo: z.string().optional(),
  sortOrder: z.coerce.number().min(0).optional(),
});
export type CreateMenuItemFormData = z.infer<typeof createMenuItemSchema>;

// ─── Staff ────────────────────────────────────────────────────────────────────

export const inviteStaffSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  role: z.enum(['manager', 'cashier', 'kitchen']),
});
export type InviteStaffFormData = z.infer<typeof inviteStaffSchema>;
