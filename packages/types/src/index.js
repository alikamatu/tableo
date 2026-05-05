"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffRole = exports.PaymentStatus = exports.PaymentMethod = exports.OrderType = exports.OrderStatus = exports.SubStatus = exports.Plan = void 0;
exports.Plan = { STARTER: 'starter', PRO: 'pro', BUSINESS: 'business' };
exports.SubStatus = { ACTIVE: 'active', EXPIRED: 'expired', CANCELLED: 'cancelled' };
exports.OrderStatus = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    READY: 'ready',
    DONE: 'done',
    CANCELLED: 'cancelled',
};
exports.OrderType = {
    DINE_IN: 'dine_in',
    TAKEAWAY: 'takeaway',
    DELIVERY: 'delivery',
};
exports.PaymentMethod = { ONLINE: 'online', COUNTER: 'counter' };
exports.PaymentStatus = { UNPAID: 'unpaid', PAID: 'paid', REFUNDED: 'refunded' };
exports.StaffRole = { MANAGER: 'manager', CASHIER: 'cashier', KITCHEN: 'kitchen' };
//# sourceMappingURL=index.js.map