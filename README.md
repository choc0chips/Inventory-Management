# StockWise — Inventory Management System

> **Full documentation:** See [`PROJECT_DOCUMENTATION.md`](./PROJECT_DOCUMENTATION.md) — living source of truth (must be updated with every code change).

## Overview

**StockWise** is a production-ready inventory management system built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, and **SQLite**. It tracks products, stock movements, suppliers, and provides analytics dashboards with CSV export capabilities.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | SQLite via Prisma ORM |
| Validation | Zod + react-hook-form |
| Auth | bcryptjs + cookie-based sessions |
| Notifications | Sonner (toast) |
| Icons | Lucide React |

---

## Architecture

```
inventory/
├── app/
│   ├── layout.tsx              # Root layout — sets up AppShell, computes alertCount
│   ├── page.tsx                # Dashboard — KPI cards + stock movement ledger
│   ├── alerts/page.tsx         # Out-of-stock alerts with quick restock
│   ├── products/page.tsx       # Product catalog with CRUD
│   ├── categories/page.tsx     # Category management (expandable rows)
│   ├── suppliers/page.tsx       # Supplier directory with product links
│   ├── reports/page.tsx        # Analytics, charts, CSV export
│   ├── auth/
│   │   ├── layout.tsx          # Auth wrapper (no sidebar)
│   │   └── page.tsx            # Login / Register tabs with form validation
│   └── api/auth/check/route.ts  # Session check endpoint
├── components/
│   ├── layout/
│   │   ├── app-shell.tsx       # Main shell — Sidebar + MobileHeader + content
│   │   ├── sidebar.tsx          # Collapsible sidebar (desktop + mobile overlay)
│   │   ├── mobile-header.tsx    # Sticky top bar (mobile only, md:hidden)
│   │   └── sidebar-context.tsx  # Sidebar open/close state via React Context
│   ├── dashboard/
│   │   └── dashboard-client.tsx # Client: KPI cards + filterable movement table
│   ├── products/
│   │   └── product-client.tsx   # Product CRUD + stock adjustment modals
│   ├── categories/
│   │   └── category-client.tsx  # Category CRUD + expandable product rows
│   ├── suppliers/
│   │   └── supplier-client.tsx   # Supplier CRUD + expandable product list
│   ├── reports/
│   │   ├── reports-client.tsx    # Charts and tables wrapper
│   │   ├── category-donut-chart.tsx
│   │   ├── movement-bar-chart.tsx
│   │   ├── trend-line-chart.tsx
│   │   └── csv-export-button.tsx
│   └── alerts/
│       └── quick-restock-button.tsx
├── lib/
│   ├── db.ts                   # Prisma singleton with better-sqlite3 adapter
│   ├── utils.ts               # cn(), formatCurrency(), formatDate(), exportToCsv()
│   ├── validators.ts          # Zod schemas + ProductType/MovementType enums
│   └── actions/
│       ├── product-actions.ts   # createProduct, updateProduct, deleteProduct
│       ├── category-actions.ts  # createCategory, updateCategory, deleteCategory
│       ├── supplier-actions.ts  # createSupplier, updateSupplier, deleteSupplier
│       ├── movement-actions.ts  # createMovement (atomic transaction)
│       ├── auth-actions.ts      # registerUser, loginUser, logoutUser
│       └── auth-config.ts       # AUTH_COOKIE_NAME constant
├── hooks/
│   └── use-debounce.ts         # Debounce hook for search inputs
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── seed.ts                 # Seed data (16 products, 32 movements, 5 suppliers)
│   └── fix-dates.ts            # Date utility for seed script
├── middleware.ts               # Auth guard — redirects unauthenticated users to /auth
└── next.config.ts             # Next.js configuration
```

---

## Database Schema

### Models

| Model | Fields | Relations |
|---|---|---|
| **Product** | id, name, sku (unique), productType, price, costPrice, quantity, lowStockAlert, unit, isArchived, createdAt, updatedAt | belongsTo Category, optionally Supplier; has-many StockMovement |
| **Category** | id, name (unique) | has-many Product (cascade) |
| **Supplier** | id, name, email, phone, address | has-many Product (setNull) |
| **StockMovement** | id, productId, type, quantity, note, date | belongsTo Product (cascade) |
| **User** | id, username (unique), email (unique), password, createdAt, updatedAt | — |

### Key Design Decisions

- **Soft Delete (`isArchived`)**: Products are never hard-deleted. `deleteProduct` runs a transaction that (a) clears remaining stock as a SALE movement, (b) sets `quantity = 0`, (c) sets `isArchived = true`. Archived products are excluded from dashboard, products list, and alerts, but preserved in reports for historical accuracy.
- **Cascade**: Deleting a Category removes all its products. Deleting a Product removes all its stock movements.
- **SetNull**: Removing a Supplier sets `supplierId` to null on linked products.

---

## Page Reference

| Route | Description | Server/Client |
|---|---|---|
| `/` | Dashboard: KPIs + filterable stock movement ledger | Server |
| `/alerts` | Out-of-stock products with quick restock | Server |
| `/products` | Full product catalog with CRUD + stock adjustments | Server wrapper + Client component |
| `/categories` | Category management with expandable product rows | Server wrapper + Client component |
| `/suppliers` | Supplier cards with expandable product list | Server wrapper + Client component |
| `/reports` | Analytics: charts, valuation table, most active products | Server wrapper + Client component |
| `/auth` | Login / Register tabs with Zod validation | Client |

---

## isArchived Filtering

All active-view queries exclude archived products (`where: { isArchived: false }`):

| Location | Query |
|---|---|
| `app/layout.tsx` (alertCount) | `db.product.count({ where: { quantity: 0, isArchived: false } })` |
| `app/page.tsx` (dashboard) | `db.product.count({ where: { isArchived: false } })` |
| `app/products/page.tsx` | `db.product.findMany({ where: { isArchived: false }, ... })` |
| `app/alerts/page.tsx` | `db.product.findMany({ where: { quantity: 0, isArchived: false }, ... })` |
| `app/reports/page.tsx` | **No filter** — reads all products for historical charts |

---

## Server Actions

### Product Actions (`lib/actions/product-actions.ts`)

| Action | Behavior |
|---|---|
| `createProduct(formData)` | Validates with Zod, creates product, revalidates `/products` and `/` |
| `updateProduct(id, formData)` | Validates with Zod, updates product, revalidates paths |
| `deleteProduct(id)` | Atomic transaction: if quantity > 0 creates SALE movement, then sets `quantity=0, isArchived=true` |

### Movement Actions (`lib/actions/movement-actions.ts`)

| Action | Behavior |
|---|---|
| `createMovement(formData)` | Atomic transaction: validates stock, calculates new quantity, prevents negative stock, creates movement |

### Auth Actions (`lib/actions/auth-actions.ts`)

| Action | Behavior |
|---|---|
| `registerUser(formData)` | Checks duplicate email/username, bcrypt hashes password, creates user, sets session cookie, redirects |
| `loginUser(formData)` | Looks up user, bcrypt compares password, sets session cookie, redirects |
| `logoutUser()` | Deletes session cookie, revalidates, redirects to `/auth` |

---

## Authentication Flow

1. **Middleware** (`middleware.ts`) checks every request against `AUTH_COOKIE_NAME`.
2. Unauthenticated requests to protected routes redirect to `/auth?from=<pathname>`.
3. Authenticated users are redirected from `/auth` to `/`.
4. Session cookie is `httpOnly`, `sameSite: lax`, 24-hour max-age.
5. `/api/auth/check` endpoint exposes session status for client-side redirect logic.

---

## Validators (`lib/validators.ts`)

| Schema | Rules |
|---|---|
| `productSchema` | name(2-100), sku(2-50), productType(enum), price(positive), costPrice(positive), quantity(non-neg int), lowStockAlert(non-neg int), unit(1-20), categoryId(required), supplierId(optional→null) |
| `categorySchema` | name(2-50 chars) |
| `supplierSchema` | name(2-100), email(valid), phone(7-20), address(5-300) |
| `stockMovementSchema` | productId(required), type(enum), quantity(positive int), note(max 500→null) |
| `loginSchema` | email(valid), password(6-100) |
| `registerSchema` | username(3-30, alphanumeric), email(valid), password(6-100) |

---

## Commands

```bash
# Start development server
npm run dev

# Apply schema changes to database
npx prisma db push --force-reset

# Seed database with sample data
npx prisma db seed

# Regenerate Prisma client types
npx prisma generate

# Build for production
npm run build
```