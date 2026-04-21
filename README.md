# 🍽️ Tableo

> All-in-one SaaS platform for restaurant owners to manage digital menus, QR ordering, branches, staff, and analytics.

![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)
![NestJS](https://img.shields.io/badge/NestJS-10-e0234e?logo=nestjs)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)

---

## 📋 Overview

Tableo is a multi-tenant restaurant management platform designed for the Ghanaian market. Restaurant owners can:

- **Manage restaurants & branches** — multi-location support with plan-based limits
- **Build digital menus** — categories, items, branch-specific overrides
- **QR code ordering** — customers scan, browse, and place orders from their phones
- **Track orders in real-time** — live order board with status management
- **View analytics** — daily snapshots, revenue trends, top-selling items
- **Manage staff** — invite team members with role-based access (manager, cashier, kitchen)
- **Handle subscriptions** — Paystack-powered billing with Starter, Pro, and Business plans

## 🏗️ Architecture

```
tableo/
├── apps/
│   ├── api/          # NestJS 10 REST API
│   └── web/          # Next.js 15 dashboard + public menu
├── packages/
│   ├── types/        # Shared TypeScript types & enums
│   ├── utils/        # Shared utilities (slug, pagination, currency)
│   ├── config/       # Shared ESLint & TypeScript configs
│   └── ui/           # Shared UI components (future)
├── infra/
│   ├── docker/       # Dockerfiles for API & Web
│   └── nginx/        # Nginx reverse proxy config
└── turbo.json        # Turborepo pipeline config
```

### Tech Stack

| Layer        | Technology                                         |
| ------------ | -------------------------------------------------- |
| Monorepo     | Turborepo + npm workspaces                         |
| API          | NestJS 10, Prisma 5, PostgreSQL 16, Redis, BullMQ  |
| Web          | Next.js 15, React 19, HeroUI, Redux Toolkit, Zod   |
| Charts       | Recharts                                           |
| Auth         | JWT (access + refresh tokens), Passport.js         |
| Payments     | Paystack (subscriptions + webhooks)                |
| File Uploads | Cloudinary                                         |
| DevOps       | Docker Compose, Nginx, GitHub Actions              |

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 20.0.0
- **npm** ≥ 10.0.0
- **PostgreSQL** 16 (or use Docker)
- **Redis** 7 (or use Docker)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/tableo.git
cd tableo
npm install
```

### 2. Set up environment

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/api/.env` with your database URL, JWT secrets, Cloudinary keys, and Paystack keys.

### 3. Database setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Seed with sample data
npm run db:seed
```

### 4. Start development

```bash
npm run dev
```

This starts both the API (port 4000) and Web (port 3000) in watch mode via Turborepo.

- **API**: http://localhost:4000/api/v1
- **Swagger Docs**: http://localhost:4000/docs
- **Web Dashboard**: http://localhost:3000

### 5. Using Docker

```bash
cd infra
docker compose up --build
```

This starts PostgreSQL, Redis, API, Web, and Nginx. Access the app at http://localhost.

## 📡 API Endpoints

### Auth
| Method | Endpoint           | Description     | Auth |
| ------ | ------------------ | --------------- | ---- |
| POST   | `/auth/register`   | Create account  | ❌   |
| POST   | `/auth/login`      | Sign in         | ❌   |
| POST   | `/auth/refresh`    | Refresh tokens  | ✅   |
| GET    | `/auth/me`         | Current user    | ✅   |

### Restaurants
| Method | Endpoint             | Description        | Auth |
| ------ | -------------------- | ------------------ | ---- |
| POST   | `/restaurants`       | Create restaurant  | ✅   |
| GET    | `/restaurants`       | List restaurants   | ✅   |
| GET    | `/restaurants/:id`   | Get restaurant     | ✅   |
| PATCH  | `/restaurants/:id`   | Update restaurant  | ✅   |
| DELETE | `/restaurants/:id`   | Delete restaurant  | ✅   |

### Branches
| Method | Endpoint                                           | Description    | Auth |
| ------ | -------------------------------------------------- | -------------- | ---- |
| POST   | `/restaurants/:id/branches`                        | Create branch  | ✅   |
| GET    | `/restaurants/:id/branches`                        | List branches  | ✅   |
| GET    | `/restaurants/:id/branches/:branchId`              | Get branch     | ✅   |
| PATCH  | `/restaurants/:id/branches/:branchId`              | Update branch  | ✅   |
| DELETE | `/restaurants/:id/branches/:branchId`              | Delete branch  | ✅   |
| GET    | `/restaurants/:id/branches/:branchId/qrcode`       | Get QR code    | ✅   |

### Menu
| Method | Endpoint                                               | Description        | Auth |
| ------ | ------------------------------------------------------ | ------------------ | ---- |
| POST   | `/restaurants/:id/categories`                          | Create category    | ✅   |
| GET    | `/restaurants/:id/categories`                          | List categories    | ✅   |
| POST   | `/restaurants/:id/items`                               | Create item        | ✅   |
| GET    | `/restaurants/:id/items`                               | List items         | ✅   |
| PATCH  | `/restaurants/:id/items/:itemId`                       | Update item        | ✅   |
| GET    | `/menu/:slug`                                          | Public menu        | ❌   |

### Orders
| Method | Endpoint                                               | Description        | Auth |
| ------ | ------------------------------------------------------ | ------------------ | ---- |
| POST   | `/orders`                                              | Place order        | ❌   |
| GET    | `/branches/:branchId/orders`                           | List orders        | ✅   |
| GET    | `/branches/:branchId/orders/:orderId`                  | Get order          | ✅   |
| PATCH  | `/branches/:branchId/orders/:orderId/status`           | Update status      | ✅   |
| PATCH  | `/branches/:branchId/orders/:orderId/payment`          | Update payment     | ✅   |

### Staff
| Method | Endpoint                                    | Description    | Auth |
| ------ | ------------------------------------------- | -------------- | ---- |
| POST   | `/branches/:branchId/staff`                 | Invite staff   | ✅   |
| GET    | `/branches/:branchId/staff`                 | List staff     | ✅   |
| PATCH  | `/branches/:branchId/staff/:staffId`        | Update staff   | ✅   |
| DELETE | `/branches/:branchId/staff/:staffId`        | Remove staff   | ✅   |

### Analytics
| Method | Endpoint                                    | Description    | Auth |
| ------ | ------------------------------------------- | -------------- | ---- |
| GET    | `/branches/:branchId/analytics`             | Snapshots      | ✅   |
| GET    | `/branches/:branchId/analytics/live`        | Live stats     | ✅   |

### Subscriptions
| Method | Endpoint                                             | Description      | Auth |
| ------ | ---------------------------------------------------- | ---------------- | ---- |
| POST   | `/subscriptions/init`                                | Start checkout   | ✅   |
| POST   | `/subscriptions/webhook`                             | Paystack webhook | ❌   |
| GET    | `/restaurants/:id/subscription`                      | Current plan     | ✅   |
| POST   | `/restaurants/:id/subscription/cancel`               | Cancel plan      | ✅   |

### Uploads
| Method | Endpoint           | Description    | Auth |
| ------ | ------------------ | -------------- | ---- |
| POST   | `/uploads/image`   | Upload image   | ✅   |
| DELETE | `/uploads/image`   | Delete image   | ✅   |

## 🔧 Environment Variables

### API (`apps/api/.env`)

| Variable                | Description                    |
| ----------------------- | ------------------------------ |
| `DATABASE_URL`          | PostgreSQL connection string   |
| `REDIS_HOST/PORT`       | Redis connection               |
| `JWT_SECRET`            | Access token secret            |
| `JWT_REFRESH_SECRET`    | Refresh token secret           |
| `CLOUDINARY_*`          | Cloudinary API credentials     |
| `PAYSTACK_SECRET_KEY`   | Paystack secret key            |
| `PAYSTACK_WEBHOOK_SECRET` | Webhook HMAC secret          |

### Web (`apps/web/.env.local`)

| Variable                  | Description              |
| ------------------------- | ------------------------ |
| `NEXT_PUBLIC_API_URL`     | API base URL             |
| `NEXT_PUBLIC_APP_URL`     | Frontend base URL        |

## 📜 Scripts

```bash
npm run dev          # Start all apps in dev mode
npm run build        # Build all apps
npm run lint         # Lint all packages
npm run typecheck    # Type-check all packages
npm run test         # Run tests
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
npm run format       # Format all files with Prettier
```

## 📄 License

Private — All rights reserved.
