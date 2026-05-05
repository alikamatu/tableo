export declare const Plan: {
  readonly STARTER: 'starter';
  readonly PRO: 'pro';
  readonly BUSINESS: 'business';
};
export type PlanType = (typeof Plan)[keyof typeof Plan];
export declare const SubStatus: {
  readonly ACTIVE: 'active';
  readonly EXPIRED: 'expired';
  readonly CANCELLED: 'cancelled';
};
export type SubStatusType = (typeof SubStatus)[keyof typeof SubStatus];
export declare const OrderStatus: {
  readonly PENDING: 'pending';
  readonly CONFIRMED: 'confirmed';
  readonly READY: 'ready';
  readonly DONE: 'done';
  readonly CANCELLED: 'cancelled';
};
export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus];
export declare const OrderType: {
  readonly DINE_IN: 'dine_in';
  readonly TAKEAWAY: 'takeaway';
  readonly DELIVERY: 'delivery';
};
export type OrderTypeType = (typeof OrderType)[keyof typeof OrderType];
export declare const PaymentMethod: {
  readonly ONLINE: 'online';
  readonly COUNTER: 'counter';
};
export type PaymentMethodType = (typeof PaymentMethod)[keyof typeof PaymentMethod];
export declare const PaymentStatus: {
  readonly UNPAID: 'unpaid';
  readonly PAID: 'paid';
  readonly REFUNDED: 'refunded';
};
export type PaymentStatusType = (typeof PaymentStatus)[keyof typeof PaymentStatus];
export declare const StaffRole: {
  readonly MANAGER: 'manager';
  readonly CASHIER: 'cashier';
  readonly KITCHEN: 'kitchen';
};
export type StaffRoleType = (typeof StaffRole)[keyof typeof StaffRole];
export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}
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
export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}
export interface ResolvedMenuItem {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  isAvailable: boolean;
  sortOrder: number;
}
export interface ResolvedMenuCategory {
  id: string;
  name: string;
  sortOrder: number;
  items: ResolvedMenuItem[];
}
export interface ResolvedMenu {
  branch: {
    id: string;
    name: string;
    slug?: string;
    logoUrl: string | null;
    address?: string | null;
    currency?: string;
    paystackPublicKey: string | null;
    paystackSubaccountCode: string | null;
    restaurantSlug?: string;
    restaurant?: {
      name: string;
      slug: string;
      branches?: {
        name: string;
        slug: string;
      }[];
    };
  };
  recommendations?: ResolvedMenuItem[];
  categories: ResolvedMenuCategory[];
}
export interface DailySnapshot {
  branchId: string;
  date: string;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  ordersByHour: Record<number, number>;
  topItems: Array<{
    itemId: string;
    name: string;
    qty: number;
    revenue: number;
  }>;
}
//# sourceMappingURL=index.d.ts.map
