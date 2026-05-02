import { customAlphabet } from 'nanoid';

// ─── Slug ─────────────────────────────────────────────────────────────────────

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);

export function generateSlug(name: string): string {
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

export function paginate(page: number, limit: number) {
  const take = Math.min(Math.max(limit, 1), 100);
  const skip = (Math.max(page, 1) - 1) * take;
  return { take, skip };
}

export function buildPaginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ─── Date ─────────────────────────────────────────────────────────────────────

export function toDateString(date: Date): string {
  return date.toISOString().split('T')[0]!;
}

export function yesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toDateString(d);
}

// ─── Currency ─────────────────────────────────────────────────────────────────

export function formatGHS(amount: number): string {
  const value = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
  }).format(value);
}

// ─── Plan rank ────────────────────────────────────────────────────────────────

export const PLAN_RANK: Record<string, number> = {
  starter: 1,
  pro: 2,
  business: 3,
};

export function planSatisfies(current: string, required: string): boolean {
  return (PLAN_RANK[current] ?? 0) >= (PLAN_RANK[required] ?? 0);
}

// ─── Branch limits ────────────────────────────────────────────────────────────

export const BRANCH_LIMITS: Record<string, number> = {
  starter: 1,
  pro: 3,
  business: Infinity,
};
