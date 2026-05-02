# NestJS API Endpoint Security & Error Handling Analysis

## Target Endpoints

- **GET** `/api/v1/restaurants/{restaurantId}/categories`
- **GET** `/api/v1/restaurants/{restaurantId}/items`

---

## Files Involved

### Controller

- **[menu.controller.ts](apps/api/src/modules/menu/menu.controller.ts)** - Lines 25-26, 52-53

### Service

- **[menu.service.ts](apps/api/src/modules/menu/menu.service.ts)** - Lines 27-55, 100-106

### Guards (Available but NOT used)

- **[restaurant-access.guard.ts](apps/api/src/common/guards/restaurant-access.guard.ts)** - RestaurantAccessGuard (not applied)

### Database Schema

- **[schema.prisma](apps/api/prisma/schema.prisma)** - MenuCategory & MenuItem models

---

## Endpoint Implementations

### 1. GET /restaurants/:restaurantId/categories

**Controller:** [menu.controller.ts](apps/api/src/modules/menu/menu.controller.ts#L25-L26)

```typescript
@Get('categories')
findCategories(@Param('restaurantId') rId: string) {
  return this.svc.findCategories(rId);
}
```

**Service:** [menu.service.ts](apps/api/src/modules/menu/menu.service.ts#L27-L55)

```typescript
findCategories(restaurantId: string) {
  return this.prisma.menuCategory.findMany({
    where: { restaurantId, parentId: null },
    include: {
      _count: { select: { menuItems: true, subCategories: true } },
      subCategories: {
        orderBy: { sortOrder: 'asc' },
        include: {
          _count: { select: { menuItems: true } },
          menuItems: {
            select: { /* 8 fields */ },
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
      menuItems: {
        select: { /* 8 fields */ },
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });
}
```

---

### 2. GET /restaurants/:restaurantId/items

**Controller:** [menu.controller.ts](apps/api/src/modules/menu/menu.controller.ts#L52-L53)

```typescript
@Get('items')
findItems(@Param('restaurantId') rId: string) {
  return this.svc.findItems(rId);
}
```

**Service:** [menu.service.ts](apps/api/src/modules/menu/menu.service.ts#L100-L106)

```typescript
findItems(restaurantId: string) {
  return this.prisma.menuItem.findMany({
    where: { restaurantId },
    include: { category: { select: { id: true, name: true } } },
    orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
  });
}
```

---

## Critical Security & Error Handling Issues

### 🔴 Issue #1: Missing RestaurantAccessGuard (CRITICAL)

**Problem:**

- Both endpoints are **NOT protected** by `RestaurantAccessGuard`
- Any authenticated user can access categories/items for ANY restaurant
- No authorization check to verify the user owns the restaurant

**Evidence:**

- Available guard at [restaurant-access.guard.ts](apps/api/src/common/guards/restaurant-access.guard.ts) is imported but NOT used
- Controller only imports `BranchAccessGuard` (line 9), not `RestaurantAccessGuard`
- Only branch override endpoints use guards (line 74, 84)

**Impact:**

- Unauthorized information disclosure
- Any user can see all categories and items from any restaurant
- Should require user to be restaurant owner

**Comparison:**

- ✅ Branch override endpoints ARE protected: `@UseGuards(BranchAccessGuard)` [line 74, 84](apps/api/src/modules/menu/menu.controller.ts#L74-L84)

---

### 🔴 Issue #2: No Restaurant Existence Validation

**Problem:**

- No validation that `restaurantId` parameter actually exists
- Invalid UUID will just return empty array (no error)
- Could query non-existent restaurants indefinitely

**Example Attack:**

```bash
# Valid UUID but non-existent restaurant
GET /restaurants/00000000-0000-0000-0000-000000000001/categories
# Returns: []  (no error thrown)
```

**Expected Behavior:**

- Should verify restaurant exists before querying
- Should throw `NotFoundException` if restaurant doesn't exist

**Comparison:**

- ✅ `resolveMenuForSlug()` does this correctly [menu.service.ts#L160](apps/api/src/modules/menu/menu.service.ts#L160):
  ```typescript
  if (!branch || !branch.isActive) throw new NotFoundException('Menu not found');
  ```

---

### 🟡 Issue #3: Missing Error Handling in Core Methods

**Affected Methods:**

1. [findCategories](apps/api/src/modules/menu/menu.service.ts#L27) - ❌ No error handling
2. [findItems](apps/api/src/modules/menu/menu.service.ts#L100) - ❌ No error handling
3. [findCategory](apps/api/src/modules/menu/menu.service.ts#L57) - ❌ No null checks
4. [updateCategory](apps/api/src/modules/menu/menu.service.ts#L68) - ❌ No error handling (could fail if categoryId doesn't exist)
5. [updateItem](apps/api/src/modules/menu/menu.service.ts#L115) - ❌ No error handling (could fail if itemId doesn't exist)
6. [deleteCategory](apps/api/src/modules/menu/menu.service.ts#L79) - ❌ No error handling, no cascade checks
7. [deleteItem](apps/api/src/modules/menu/menu.service.ts#L127) - ❌ No error handling, no cascade checks

**Raw Prisma Exceptions:**

- If categoryId/itemId doesn't exist, Prisma throws unhandled errors
- Could leak database schema in error responses

---

### 🟡 Issue #4: Null Reference Risk in findCategory

**Problem:**

```typescript
findCategory(id: string) {
  return this.prisma.menuCategory.findUnique({
    where: { id },
    // ... returns null if not found
  });
}
```

**Risk:**

- Returns `null` instead of throwing `NotFoundException`
- Frontend/clients might not handle null responses
- Controller doesn't validate response

**Expected:**

```typescript
async findCategory(id: string) {
  const category = await this.prisma.menuCategory.findUnique({
    where: { id },
    include: { /* ... */ },
  });
  if (!category) throw new NotFoundException('Category not found');
  return category;
}
```

---

## Database Query Analysis

### MenuCategory Model

- **File:** [schema.prisma#L145-L169](apps/api/prisma/schema.prisma#L145-L169)
- Supports hierarchical categories (parentId field)
- `isActive` flag for soft-delete logic (but not enforced in queries!)
- Foreign key cascade on delete

**⚠️ Note:** `findCategories()` query doesn't filter by `isActive: true`, but `resolveMenuForSlug()` does [line 165](apps/api/src/modules/menu/menu.service.ts#L165)

---

### MenuItem Model

- **File:** [schema.prisma#L175-L219](apps/api/prisma/schema.prisma#L175-L219)
- Related to MenuCategory via `categoryId`
- Has `branchOverrides` relationship (per-branch availability)
- Supports `availableFrom`/`availableTo` time windows (not enforced in queries)

---

## Recommendations

### PRIORITY 1: Apply RestaurantAccessGuard

```typescript
// menu.controller.ts

import { RestaurantAccessGuard } from '../../common/guards/restaurant-access.guard';

@Controller('restaurants/:restaurantId')
@UseGuards(RestaurantAccessGuard) // ← ADD THIS
export class MenuController {
  // ... endpoints
}
```

### PRIORITY 2: Add Restaurant Existence Validation

```typescript
// menu.service.ts

async findCategories(restaurantId: string) {
  // Validate restaurant exists
  const restaurant = await this.prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { id: true },
  });
  if (!restaurant) throw new NotFoundException('Restaurant not found');

  return this.prisma.menuCategory.findMany({
    where: { restaurantId, parentId: null },
    // ... rest of query
  });
}
```

### PRIORITY 3: Add Null Checks & Error Handling

```typescript
// For findCategory, updateCategory, deleteCategory, etc.

async findCategory(id: string) {
  const category = await this.prisma.menuCategory.findUnique({
    where: { id },
    include: { /* ... */ },
  });
  if (!category) throw new NotFoundException('Category not found');
  return category;
}

async updateCategory(id: string, dto: UpdateCategoryDto) {
  try {
    return await this.prisma.menuCategory.update({
      where: { id },
      data: dto,
      include: { /* ... */ },
    });
  } catch (error) {
    if (error.code === 'P2025') {
      throw new NotFoundException('Category not found');
    }
    throw error;
  }
}
```

### PRIORITY 4: Enforce isActive Status

```typescript
// Consider filtering inactive items/categories in queries
findCategories(restaurantId: string) {
  return this.prisma.menuCategory.findMany({
    where: { restaurantId, parentId: null, isActive: true },  // ← Add isActive check
    // ... rest of query
  });
}
```

---

## Summary

| Issue                                       | Severity    | Impact                                       | Status    |
| ------------------------------------------- | ----------- | -------------------------------------------- | --------- |
| Missing RestaurantAccessGuard               | 🔴 CRITICAL | Unauthorized access to any restaurant's data | Not Fixed |
| No restaurant existence validation          | 🔴 CRITICAL | Invalid/non-existent restaurants accepted    | Not Fixed |
| Missing null/error handling in findCategory | 🟡 HIGH     | Potential null reference issues              | Not Fixed |
| Update/delete without error handling        | 🟡 HIGH     | Unhandled Prisma exceptions                  | Not Fixed |
| No isActive enforcement                     | 🟡 MEDIUM   | Soft-deleted items might be exposed          | Not Fixed |
