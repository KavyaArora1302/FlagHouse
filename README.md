# FlagHouse

Wall-flag e-commerce storefront — browse by category, cart, checkout, auth, and order history. Full-stack MVP deployed on free hosting.

## Live demo

| | URL |
|---|-----|
| **Website** | [https://flag-house.vercel.app](https://flag-house.vercel.app) |
| **API** | [https://flaghouse-api.onrender.com](https://flaghouse-api.onrender.com) |
| **Health** | [https://flaghouse-api.onrender.com/api/health](https://flaghouse-api.onrender.com/api/health) |

## Stack

- **Frontend:** React 19, Vite, Tailwind CSS 4, React Router
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth
- **Database:** MongoDB Atlas
- **Hosting:** Vercel (frontend) + Render (API)

## Features

- Product catalog with categories (Sports, Gaming, Music, Travel)
- Cart (localStorage) and protected checkout
- Register / login with JWT
- Orders saved to MongoDB; **My Orders** page
- Responsive UI

## Project structure

```
flaghouse/
├── frontend/     # React storefront
├── backend/      # Express API
└── README.md
```

## Run locally

**Prerequisites:** Node.js 18+, MongoDB Atlas URI (or local MongoDB)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env: MONGODB_URI, JWT_SECRET, CLIENT_URL
npm run seed    # once, to load products (includes image URLs)
npm run dev     # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000
npm run dev     # http://localhost:5174
```

### 3. Verify

- API: `http://localhost:5000/api/health` → `"database": "connected"`
- App: open the Vite URL, shop and auth should hit the local API

## Environment variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing tokens |
| `CLIENT_URL` | Frontend origin(s), comma-separated (CORS) |
| `PORT` | Optional; default `5000` locally |
| `RESEND_API_KEY` | Resend API key for password reset emails |
| `EMAIL_FROM` | Sender for reset emails (verified in Resend) |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend base URL (no trailing slash) |

## API overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | — | Health + DB status |
| GET | `/api/products` | — | List products (`?featured=true`, `?category=`) |
| GET | `/api/products/:id` | — | Product + related |
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login |
| POST | `/api/auth/forgot-password` | — | Request password reset link |
| POST | `/api/auth/reset-password` | — | Set new password with reset token |
| GET | `/api/auth/me` | Bearer | Current user |
| PATCH | `/api/auth/profile` | Bearer | Update display name |
| GET | `/api/auth/checkout-prefill` | Bearer | Checkout address pre-fill |
| POST | `/api/auth/addresses` | Bearer | Add saved address |
| PATCH | `/api/auth/addresses/:id` | Bearer | Update saved address |
| DELETE | `/api/auth/addresses/:id` | Bearer | Delete saved address |
| PATCH | `/api/auth/addresses/:id/default` | Bearer | Set default saved address |
| POST | `/api/orders` | Bearer | Place order |
| GET | `/api/orders` | Bearer | Order history |
| POST | `/api/contact` | — | Submit contact form message |

## Deployment

- **Frontend:** Vercel, root directory `frontend`, `VITE_API_URL` → Render API URL
- **Backend:** Render, root directory `backend`, env vars from `.env.example`
- **Atlas:** Network access for Render; database name `flaghouse`

See `backend/README.md` and `backend/ATLAS_SETUP.md` for more detail.

## Roadmap

- [x] Storefront, cart, checkout, auth, orders
- [x] Deploy (Vercel + Render + Atlas)
- [x] Razorpay payments
- [x] Admin panel (products & orders)
- [x] Real product images
- [x] Password reset
- [x] Order confirmation emails
- [x] User profile & saved addresses (checkout pre-fill)
- [x] Admin dashboard stats

## License

Private / portfolio project — Kavya Arora.
