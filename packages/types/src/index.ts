export const Plan = { STARTER: 'starter', PRO: 'pro', BUSINESS: 'business' } as const;
export type PlanType = typeof Plan[keyof typeof Plan];

export const SubStatus = { ACTIVE: 'active', EXPIRED: 'expired', CANCELLED: 'cancelled' } as const;
export type SubStatusType = typeof SubStatus[keyof typeof SubStatus];

export const OrderStatus = { PENDING: 'pending', CONFIRMED: 'confirmed', READY: 'ready', DONE: 'done', CANCELLED: 'cancelled' } as const;
export type OrderStatusType = typeof OrderStatus[keyof typeof OrderStatus];

export const PaymentMethod = { ONLINE: 'online', COUNTER: 'counter' } as const;
export type PaymentMethodType = typeof PaymentMethod[keyof typeof PaymentMethod];

export const PaymentStatus = { UNPAID: 'unpaid', PAID: 'paid', REFUNDED: 'refunded' } as const;
export type PaymentStatusType = typeof PaymentStatus[keyof typeof PaymentStatus];

export const StaffRole = { MANAGER: 'manager', CASHIER: 'cashier', KITCHEN: 'kitchen' } as const;
export type StaffRoleType = typeof StaffRole[keyof typeof StaffRole];

export interface ApiResponse<T> { data: T; meta?: Record<string, unknown> }
export interface PaginatedResponse<T> { data: T[]; meta: { total: number; page: number; limit: number; totalPages: number } }
export interface ApiError { statusCode: number; message: string | string[]; error: string; timestamp: string; path: string }

export interface JwtPayload {
  sub: string;
  email: string;
  onboardComplete?: boolean;
  /** Set when the user is a staff member (not an owner) */
  staffRole?: 'manager' | 'cashier' | 'kitchen';
  /** The branch the staff member belongs to */
  branchId?: string;
  iat?: number;
  exp?: number;
}

export interface JwtTokens { accessToken: string; refreshToken: string }

export interface ResolvedMenuItem { id: string; name: string; description: string | null; imageUrl: string | null; price: number; isAvailable: boolean; sortOrder: number }
export interface ResolvedMenuCategory { id: string; name: string; sortOrder: number; items: ResolvedMenuItem[] }
export interface ResolvedMenu { branch: { id: string; name: string; logoUrl: string | null; paystackPublicKey: string | null; paystackSubaccountCode: string | null }; categories: ResolvedMenuCategory[] }
export interface DailySnapshot { branchId: string; date: string; totalOrders: number; totalRevenue: number; avgOrderValue: number; ordersByHour: Record<number, number>; topItems: Array<{ itemId: string; name: string; qty: number; revenue: number }> }
