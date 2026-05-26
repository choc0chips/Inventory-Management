# StockWise Inventory Management System

## Project Overview

**Project Name:** StockWise
**Directory Path:** `C:\Users\Anusha\Desktop\Kenmark Projects\inventory`
**Framework:** Next.js 16 (App Router)
**Version:** 1.0.0

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **UI Components** | Custom Tailwind CSS + Lucide Icons |
| **Database ORM** | Prisma ORM |
| **Database** | SQLite (configurable for MySQL) |
| **State Management** | React Hooks + Next.js Server Components |
| **Data Validation** | Zod |
| **Charts** | Recharts |
| **Authentication** | bcryptjs + Cookie-based Sessions |
| **Form Handling** | React Hook Form + Zod Resolvers |

---

## Core Features Manual

### 1. Dashboard (`/`)

**Purpose:** Unified landing page providing real-time inventory overview and stock movement tracking.

**Components:**
- **KPI Cards Grid (4 cards):**
  - `Total Products` - Count of all products in inventory
  - `Stock Value` - Total retail value (price × quantity)
  - `Low Stock Alerts` - Products below their low-stock threshold
  - `Suppliers` - Count of registered suppliers

- **Recent Stock Movements Ledger:**
  - Displays latest inventory changes ordered by date descending
  - Shows product name, SKU, Transaction Action badge, quantity change, notes, and timestamp

- **Interactive Filters:**
  - Product dropdown (matches product names)
  - Transaction Action selector (RESTOCK, SALE, DAMAGE, ADJUSTMENT, RETURN)
  - Start Date picker
  - End Date picker
  - Filters sync with URL search parameters for server-side re-fetch

**Data Flow:** Client-side filter changes trigger URL updates, Next.js server re-renders with filtered Prisma queries.

---

### 2. Products (`/products`)

**Purpose:** Full CRUD operations for inventory items.

**Features:**
- Product list with search/filter capabilities
- Create/Edit product modal with form validation
- Fields: Name, SKU, Asset Classification, Price, Cost Price, Quantity, Low Stock Alert, Unit, Category, Supplier
- Delete confirmation with cascade handling
- Real-time revalidation of dashboard and products page

**Server Actions:** `createProduct`, `updateProduct`, `deleteProduct` in `lib/actions/product-actions.ts`

**Error Handling:** Prisma P2002 constraint errors display: "Error: A product with this SKU already exists."

---

### 3. Categories (`/categories`)

**Purpose:** Master-detail view for product classification.

**Layout Structure:**
- Left: Category list in table format with expandable rows
- Inline "Add Category" button in header

**Dynamic Expansion:**
- Click category row to expand/collapse nested product sub-table
- Shows: Product Name, SKU, Quantity (highlighted if low), Price, Status badge
- Status badges: "In Stock" (emerald) or "Low Stock" (red with alert icon)

**Actions:**
- Create new category
- Edit existing category
- Delete category (cascades to products)

---

### 4. Suppliers (`/suppliers`)

**Purpose:** Manage vendor relationships.

**Features:**
- Supplier listing with contact information
- Create/Edit/Delete supplier operations
- Links to associated products

---

### 5. Stock Movements (`/movements`)

**Purpose:** Track all inventory changes.

**Movement Types:**
| Type | Icon | Color | Effect |
|------|------|-------|--------|
| RESTOCK | Plus | Emerald | +Quantity |
| SALE | ArrowUpRight | Blue | -Quantity |
| DAMAGE | Minus | Red | -Quantity |
| ADJUSTMENT | RotateCcw | Amber | ±Quantity |
| RETURN | ArrowDownRight | Violet | +Quantity |

**Features:**
- Filterable by product, type, and date range
- Sorted by date descending
- Notes field for context
- Links to product details

---

### 6. Reports (`/reports`)

**Purpose:** Analytics and financial metrics.

**Financial Metrics Cards:**
| Metric | Calculation | Color |
|--------|------------|-------|
| Current Value of Inventory | Retail Price × Quantity | Indigo |
| Cost of Inventory | Cost Price × Quantity | Emerald |
| Profit Margin | ((Retail - Cost) / Retail) × 100% | Amber |

**Charts:**
- **Category Donut Chart** - Product distribution with custom tooltip showing category name and bulleted product list
- **Movement Bar Chart** - Monthly volume by movement type
- **6-Month Trend Line** - Stock value over time

**Data Tables:**
- Inventory Valuation with export functionality
- Most Active Products ranking

**CSV Export:** Uses native Blob API for cross-browser compatibility.

---

### 7. Alerts (`/alerts`)

**Purpose:** Critical inventory alerts page for monitoring and quickly restocking depleted items.

**Features:**
- Server-side query fetches all products where `quantity === 0`
- Displays product name, SKU, category, supplier, and price
- Real-time badge count in sidebar navigation showing number of out-of-stock items
- **Quick Restock Action:** Inline quantity input with RESTOCK button to instantly create a stock movement
- Automatic page revalidation after restock — items immediately disappear from the alerts list
- Empty state placeholder when no products are out of stock

**Technical Implementation:**
- `app/alerts/page.tsx` — Server Component performs Prisma query for zero-quantity products
- `components/alerts/quick-restock-button.tsx` — Client Component wraps `createMovement` server action with `useTransition`
- Sonner toast notifications for success/error feedback
- Sidebar badge updates dynamically based on alert count computed in root layout

**Dynamic Sidebar Integration:**
- Root layout (`app/layout.tsx`) computes `alertCount` via `db.product.count({ where: { quantity: 0 } })`
- Passes `alertCount` to `<AppShell />` → `<Sidebar />`
- Alerts nav item displays badge with count (or "99+" if > 99)

---

### 8. Authentication (`/auth`)

**Purpose:** Secure, database-backed user registration and login portal.

**UI Layout:** Dual-tab interface with animated tab switching:
- **Sign In tab:** Email and Password fields with login validation
- **Register tab:** Username, Email, and Password fields with registration validation

**Features:**
- Glassmorphism card design with gradient background orbs
- Eye-icon toggle for password visibility on both forms
- Loading spinner overlay during form submission to prevent double-submits
- Sonner toast notifications for success/error feedback
- React Hook Form integration with Zod resolver for client-side validation
- Automatic session detection — redirects authenticated users to dashboard
- Middleware-protected routes redirect unauthenticated users to `/auth`

**Authentication Pipeline:**
1. **Registration:** Username + Email + Password → Zod validation → Duplicate check → bcryptjs hash (10 salt rounds) → `User` record creation → Session cookie → Redirect to `/`
2. **Login:** Email + Password → Zod validation → User lookup → `bcrypt.compare()` verification → Session cookie → Redirect to `/`
3. **Logout:** Cookie deletion → `revalidatePath("/")` → Redirect to `/auth`

**Security Measures:**
- Passwords are never stored in plain text; bcryptjs with 10 salt rounds
- Generic "Invalid email or password" error on login to prevent user enumeration
- HttpOnly, SameSite=Lax session cookies
- Secure flag enabled in production
- 24-hour session expiry

**Dynamic Sidebar Behavior:**
- Sidebar receives `isAuthenticated` prop from root layout (computed from session cookie)
- **Authenticated users:** See "Log Out" button (red highlight on hover, LogOut icon)
- **Unauthenticated users:** See "Log In" button (purple gradient styling, LogIn icon)
- Includes dynamic Alerts badge showing count of out-of-stock items

---

## Terminology Differentiation

### Asset Classifications vs Transaction Actions

StockWise differentiates between two distinct "Type" concepts to prevent user confusion:

| Concept | Location | Values | Purpose |
|---------|----------|--------|---------|
| **Asset Classification** | Products table & forms | TRADING, ASSET, CONSUMABLE | Categorizes the nature of the product itself (how it's tracked/used) |
| **Transaction Action** | Dashboard movements ledger & filters | RESTOCK, SALE, DAMAGE, ADJUSTMENT, RETURN | Represents historical inventory events (what happened to stock) |

**UI Updates:**
- Products table header: "Type" → "Asset Classification"
- Products filter dropdown: "All Types" → "All Classifications"
- Product form label: "Product Type" → "Asset Classification (Trading, Asset, Consumable)"
- Dashboard movements header: "Type" → "Transaction Action"
- Dashboard filter: "Type" → "Transaction Action", "All Types" → "All Actions"

---

## Database Blueprints

### Prisma Schema

```prisma
model Product {
  id            String          @id @default(cuid())
  name          String
  sku           String          @unique
  productType   String
  price         Float
  costPrice     Float
  quantity      Int             @default(0)
  lowStockAlert Int             @default(10)
  unit          String
  categoryId    String
  category      Category        @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  supplierId    String?
  supplier      Supplier?       @relation(fields: [supplierId], references: [id], onDelete: SetNull)
  movements     StockMovement[]
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
}

model Category {
  id       String    @id @default(cuid())
  name     String    @unique
  products Product[]
}

model Supplier {
  id       String    @id @default(cuid())
  name     String
  email    String
  phone    String
  address  String
  products Product[]
}

model StockMovement {
  id        String   @id @default(cuid())
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  type      String
  quantity  Int
  note      String?
  date      DateTime @default(now())
}

model User {
  id        String   @id @default(cuid())
  username  String   @unique
  email     String   @unique
  password  String   // Stores bcryptjs hashed passwords
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### User Model Constraints

| Field | Type | Constraint | Description |
|-------|------|------------|-------------|
| `id` | String | Primary Key, CUID | Unique user identifier |
| `username` | String | Unique | Alphanumeric, 3-30 characters |
| `email` | String | Unique | Valid email format |
| `password` | String | — | bcryptjs hash (10 salt rounds) |
| `createdAt` | DateTime | Auto-set | Account creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last modification timestamp |

### Relational Connections

```
Category (1) ──< Product (N)
Supplier (1) ──< Product (N)
Product (1) ──< StockMovement (N)
```

### Cascade Lifecycle Rules

| Parent | Child | On Delete |
|--------|-------|-----------|
| Category | Product | Cascade (products deleted with category) |
| Supplier | Product | SetNull (products retain, supplier set to null) |
| Product | StockMovement | Cascade (movements deleted with product) |

### Atomic Data Flow Rules

1. **Product Creation:** SKU must be unique; validation via Zod schema
2. **Stock Movements:** Always linked to existing product; quantity changes affect live inventory
3. **Category Deletion:** All products under category are cascade-deleted
4. **Supplier Removal:** Products remain but lose supplier reference

---

## API & Server Actions

### Product Actions (`lib/actions/product-actions.ts`)

```typescript
createProduct(formData: FormData): Promise<ActionResult>
updateProduct(id: string, formData: FormData): Promise<ActionResult>
deleteProduct(id: string): Promise<ActionResult>
```

### Category Actions (`lib/actions/category-actions.ts`)

```typescript
createCategory(formData: FormData): Promise<ActionResult>
updateCategory(id: string, formData: FormData): Promise<ActionResult>
deleteCategory(id: string): Promise<ActionResult>
```

### Supplier Actions (`lib/actions/supplier-actions.ts`)

```typescript
createSupplier(formData: FormData): Promise<ActionResult>
updateSupplier(id: string, formData: FormData): Promise<ActionResult>
deleteSupplier(id: string): Promise<ActionResult>
```

### Movement Actions (`lib/actions/movement-actions.ts`)

```typescript
createMovement(formData: FormData): Promise<ActionResult>
deleteMovement(id: string): Promise<ActionResult>
```

### Auth Actions (`lib/actions/auth-actions.ts`)

```typescript
registerUser(formData: FormData): Promise<AuthResult>
loginUser(formData: FormData): Promise<AuthResult>
logoutUser(): Promise<void>
checkAuth(): Promise<boolean>
```

**`logoutUser` Workflow:**
1. Access cookies via `next/headers`
2. Delete the `auth_token` session cookie
3. Call `revalidatePath("/")` to purge client router layout cache
4. Execute server-side `redirect("/auth")` to send unauthenticated user to sign-in portal
5. Integrated into the sidebar UI with `useTransition` state handling for pending feedback

**`registerUser` Pipeline:**
1. Parse fields with `registerSchema` (Zod)
2. Query database for existing email/username conflicts
3. Hash password with `bcrypt.hash(password, 10)`
4. Create `User` record via `prisma.user.create()`
5. Set session cookie, `revalidatePath("/")`, `redirect("/")`

**`loginUser` Pipeline:**
1. Parse fields with `loginSchema` (Zod)
2. Lookup user by email via `prisma.user.findUnique()`
3. Verify password with `bcrypt.compare()`
4. Set session cookie, `revalidatePath("/")`, `redirect("/")`

---

## Utility Functions (`lib/utils.ts`)

| Function | Purpose |
|----------|---------|
| `cn()` | Merge Tailwind classes |
| `formatCurrency()` | Format number as USD currency |
| `formatDate()` | Format date with time (e.g., "May 19, 2026 at 2:30 PM") |
| `formatShortDate()` | Format date without time |
| `exportToCsv()` | Generate and download CSV via Blob API |

---

## Validation Schemas (`lib/validators.ts`)

### registerSchema

| Field | Type | Constraints |
|-------|------|-------------|
| `username` | String | Min 3, Max 30, alphanumeric only (`/^[a-zA-Z0-9]+$/`) |
| `email` | String | Valid `.email()` format |
| `password` | String | Min 6, Max 100 characters |

### loginSchema

| Field | Type | Constraints |
|-------|------|-------------|
| `email` | String | Required, valid `.email()` format |
| `password` | String | Min 6, Max 100 characters |

---

## Project Structure

```
inventory/
├── app/
│   ├── page.tsx                 # Dashboard
│   ├── auth/
│   │   ├── layout.tsx           # Auth-specific layout (no sidebar)
│   │   └── page.tsx             # Dual-tab Login/Register portal
│   ├── products/
│   │   └── page.tsx
│   ├── categories/
│   │   └── page.tsx
│   ├── suppliers/
│   │   └── page.tsx
│   ├── movements/
│   │   └── page.tsx
│   ├── alerts/
│   │   └── page.tsx              # Out of stock alerts with quick restock
│   ├── reports/
│   │   └── page.tsx
│   ├── layout.tsx
│   └── generated/prisma/        # Prisma client output
├── components/
│   ├── dashboard/
│   │   └── dashboard-client.tsx
│   ├── categories/
│   │   └── category-client.tsx
│   ├── products/
│   ├── suppliers/
│   ├── movements/
│   ├── alerts/
│   │   └── quick-restock-button.tsx
│   └── reports/
│       ├── reports-client.tsx
│       ├── category-donut-chart.tsx
│       ├── movement-bar-chart.tsx
│       ├── trend-line-chart.tsx
│       └── csv-export-button.tsx
├── lib/
│   ├── actions/
│   │   ├── auth-actions.ts      # registerUser, loginUser, logoutUser, checkAuth
│   │   ├── auth-config.ts       # Cookie name constants
│   │   ├── product-actions.ts
│   │   ├── category-actions.ts
│   │   ├── supplier-actions.ts
│   │   └── movement-actions.ts
│   ├── db.ts
│   ├── utils.ts
│   └── validators.ts            # Includes loginSchema + registerSchema
├── hooks/
│   └── use-debounce.ts
├── middleware.ts                 # Route protection (cookie-based auth guard)
├── prisma/
│   └── schema.prisma            # Includes User model
├── STOCKWISE_PROJECT_DOCUMENTATION.md
└── [config files]
```

---

## Environment Configuration

**Database Provider:** SQLite (default)
**To Switch to MySQL:**
1. Update `prisma/schema.prisma` - change `provider = "sqlite"` to `provider = "mysql"`
2. Update `prisma.config.ts` - configure MySQL connection string
3. Run `npx prisma migrate dev`

---

## Build & Development

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Run ESLint
```

---

*Document generated: May 2026*
*StockWise v1.0.0*