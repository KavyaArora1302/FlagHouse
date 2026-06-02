# FlagHouse Backend

Node.js + Express + MongoDB API for the FlagHouse storefront.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- **MongoDB Atlas** (recommended, free M0) or local MongoDB

**Cloud setup:** see **[ATLAS_SETUP.md](./ATLAS_SETUP.md)** for full step-by-step Atlas instructions.

## Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` if your MongoDB URL or ports differ.

## Seed the database

Loads all 16 products from the catalog into MongoDB:

```bash
npm run seed
```

## Run the API

Development (auto-restart on file changes):

```bash
npm run dev
```

Production:

```bash
npm start
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health + DB status |
| GET | `/api/products` | All products (`?featured=true`, `?category=Sports`) |
| GET | `/api/products/:id` | One product by `legacyId` + related items |
| POST | `/api/auth/register` | Create account (`name`, `email`, `password`) |
| POST | `/api/auth/login` | Sign in → `{ user, token }` |
| GET | `/api/auth/me` | Current user (header: `Authorization: Bearer <token>`) |
| POST | `/api/orders` | Place order (auth required) |
| GET | `/api/orders` | List your orders (auth required) |
| GET | `/api/admin/status` | Admin check (admin role + Bearer token) |
| GET | `/api/admin/products` | List all products (admin) |
| POST | `/api/admin/products` | Create product (admin) |
| PATCH | `/api/admin/products/:id` | Update product by `legacyId` (admin) |
| DELETE | `/api/admin/products/:id` | Delete product (admin) |
| GET | `/api/admin/orders` | List all orders (admin) |
| GET | `/api/admin/orders/:id` | One order (admin) |
| PATCH | `/api/admin/orders/:id` | Update order / payment status (admin) |
| POST | `/api/payments/razorpay/create` | Start Razorpay payment (auth) |
| POST | `/api/payments/razorpay/verify` | Verify Razorpay payment (auth) |

## Razorpay (test mode)

Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`. Online checkout (UPI/card/netbanking) uses Razorpay; COD uses `POST /api/orders`.

## Admin setup

1. Set `ADMIN_EMAIL` in `.env` (comma-separated for multiple admins).
2. Promote an existing account:

```bash
npm run promote-admin
# or: npm run promote-admin -- you@example.com
```

New registrations with an `ADMIN_EMAIL` address get `role: "admin"` automatically.

## Verify

- Root: `http://localhost:5000/`
- Health: `http://localhost:5000/api/health`
- Products: `http://localhost:5000/api/products`

Expected health response when MongoDB is connected:

```json
{
  "status": "ok",
  "service": "FlagHouse API",
  "database": "connected",
  "timestamp": "..."
}
```

## Environment variables

| Variable     | Default                              | Description        |
|-------------|---------------------------------------|--------------------|
| `PORT`      | `5000`                                | API server port    |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/flaghouse` | MongoDB connection |
| `CLIENT_URL` | `http://localhost:5174`            | Frontend (CORS)    |
| `JWT_SECRET` | (required)                         | Sign auth tokens   |
| `JWT_EXPIRES_IN` | `7d`                           | Token lifetime     |
| `ADMIN_EMAIL` | —                                  | Emails granted admin role |
| `RAZORPAY_KEY_ID` | —                              | Razorpay test/live key id |
| `RAZORPAY_KEY_SECRET` | —                          | Razorpay secret |
