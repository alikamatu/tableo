export declare function generateSlug(name: string): string;
export declare function paginate(page: number, limit: number): {
    take: number;
    skip: number;
};
export declare function buildPaginationMeta(total: number, page: number, limit: number): {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};
export declare function toDateString(date: Date): string;
export declare function yesterdayString(): string;
export declare function formatGHS(amount: number): string;
export declare const PLAN_RANK: Record<string, number>;
export declare function planSatisfies(current: string, required: string): boolean;
export declare const BRANCH_LIMITS: Record<string, number>;
//# sourceMappingURL=index.d.ts.map