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
| POST | `/api/auth/forgot-password` | Request reset link (`email`) — sends email via Resend |
| POST | `/api/auth/reset-password` | Set new password (`token`, `password`) |
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
| POST | `/api/payments/razorpay/webhook` | Razorpay server webhook (signature verified) |
| POST | `/api/contact` | Submit contact form (`name`, `email`, `message`, optional `subject`) |

## Contact form

Submissions are emailed to `CONTACT_EMAIL`, or the first `ADMIN_EMAIL` if unset. Requires `RESEND_API_KEY`.

## Razorpay (test mode)

Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`. Online checkout (UPI/card/netbanking) uses Razorpay; COD uses `POST /api/orders`.

### Webhooks (recommended for production)

Server-side backup when the browser never calls `/razorpay/verify` (tab closed, network drop).

1. In [Razorpay Dashboard](https://dashboard.razorpay.com/) → **Webhooks** → **Add New Webhook**
2. **Webhook URL:** `https://flaghouse-api.onrender.com/api/payments/razorpay/webhook`
3. **Secret:** generate and copy → set as `RAZORPAY_WEBHOOK_SECRET` on Render
4. **Active events:** `payment.captured`, `payment.failed`
5. Redeploy backend after adding the env var

The client `/razorpay/verify` flow still works; webhooks confirm payment even if the user closes the checkout modal early.

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
| `CONTACT_EMAIL` | —                                | Inbox for contact form (defaults to first `ADMIN_EMAIL`) |
| `RAZORPAY_KEY_ID` | —                              | Razorpay test/live key id |
| `RAZORPAY_KEY_SECRET` | —                          | Razorpay secret |
| `RAZORPAY_WEBHOOK_SECRET` | —                      | Webhook signing secret from Razorpay dashboard |
| `RESEND_API_KEY` | —                                 | Resend API key for password reset emails |
| `EMAIL_FROM` | `FlagHouse <onboarding@resend.dev>`     | Sender address (must be verified in Resend) |

## Password reset emails (Resend)

1. Sign up at [resend.com](https://resend.com) and create an API key.
2. Add to `.env`:
   ```env
   RESEND_API_KEY=re_xxxxxxxx
   EMAIL_FROM=FlagHouse <onboarding@resend.dev>
   ```
3. **Testing:** Resend’s `onboarding@resend.dev` can only send to **your own Resend account email** until you verify a domain.
4. **Production:** Verify your domain in Resend and set `EMAIL_FROM` to e.g. `FlagHouse <hello@yourdomain.com>`.
5. Ensure `CLIENT_URL` includes your live frontend URL so reset links point to the correct site.

Without `RESEND_API_KEY`, forgot-password still works locally — the reset link is printed in the server console.

Order confirmation emails are sent automatically after COD checkout and after successful Razorpay payment verification.
