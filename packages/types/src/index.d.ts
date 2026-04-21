export declare const Plan: {
    readonly STARTER: "starter";
    readonly PRO: "pro";
    readonly BUSINESS: "business";
};
export type Plan = typeof Plan[keyof typeof Plan];
export declare const SubStatus: {
    readonly ACTIVE: "active";
    readonly EXPIRED: "expired";
    readonly CANCELLED: "cancelled";
};
export type SubStatus = typeof SubStatus[keyof typeof SubStatus];
export declare const OrderStatus: {
    readonly PENDING: "pending";
    readonly CONFIRMED: "confirmed";
    readonly READY: "ready";
    readonly DONE: "done";
    readonly CANCELLED: "cancelled";
};
export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];
export declare const PaymentMethod: {
    readonly ONLINE: "online";
    readonly COUNTER: "counter";
};
export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];
export declare const PaymentStatus: {
    readonly UNPAID: "unpaid";
    readonly PAID: "paid";
    readonly REFUNDED: "refunded";
};
export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];
export declare const StaffRole: {
    readonly MANAGER: "manager";
    readonly CASHIER: "cashier";
    readonly KITCHEN: "kitchen";
};
export type StaffRole = typeof StaffRole[keyof typeof StaffRole];
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
        logoUrl: string | null;
    };
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