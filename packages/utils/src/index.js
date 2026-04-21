"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BRANCH_LIMITS = exports.PLAN_RANK = void 0;
exports.generateSlug = generateSlug;
exports.paginate = paginate;
exports.buildPaginationMeta = buildPaginationMeta;
exports.toDateString = toDateString;
exports.yesterdayString = yesterdayString;
exports.formatGHS = formatGHS;
exports.planSatisfies = planSatisfies;
const nanoid_1 = require("nanoid");
// ─── Slug ─────────────────────────────────────────────────────────────────────
const nanoid = (0, nanoid_1.customAlphabet)('abcdefghijklmnopqrstuvwxyz0123456789', 8);
function generateSlug(name) {
    const base = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 40);
    return `${base}-${nanoid()}`;
}
// ─── Pagination ───────────────────────────────────────────────────────────────
function paginate(page, limit) {
    const take = Math.min(Math.max(limit, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;
    return { take, skip };
}
function buildPaginationMeta(total, page, limit) {
    return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}
// ─── Date ─────────────────────────────────────────────────────────────────────
function toDateString(date) {
    return date.toISOString().split('T')[0];
}
function yesterdayString() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return toDateString(d);
}
// ─── Currency ─────────────────────────────────────────────────────────────────
function formatGHS(amount) {
    return new Intl.NumberFormat('en-GH', {
        style: 'currency',
        currency: 'GHS',
    }).format(amount);
}
// ─── Plan rank ────────────────────────────────────────────────────────────────
exports.PLAN_RANK = {
    starter: 1,
    pro: 2,
    business: 3,
};
function planSatisfies(current, required) {
    return (exports.PLAN_RANK[current] ?? 0) >= (exports.PLAN_RANK[required] ?? 0);
}
// ─── Branch limits ────────────────────────────────────────────────────────────
exports.BRANCH_LIMITS = {
    starter: 1,
    pro: 3,
    business: Infinity,
};
//# sourceMappingURL=index.js.map