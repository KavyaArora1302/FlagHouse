# MongoDB Atlas setup (FlagHouse)

Follow these steps to use a **free M0** cloud database and connect this backend.

## Part 1 — Create Atlas account & cluster

### 1. Sign up

1. Open [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with Google, GitHub, or email.
3. Complete verification if asked.

### 2. Answer the onboarding questions (optional)

Atlas may ask about your goal, stack, etc. You can choose:

- **Goal:** Learning / building a project  
- **Language:** JavaScript / Node.js  
- **Type:** Free tier is fine  

You can skip or accept defaults.

### 3. Create a free cluster

1. You should see **Deploy a database** (or **Build a database**).
2. Choose **M0 FREE** (Free Shared).
3. **Provider / Region:** Pick a region close to you (e.g. **AWS Mumbai `ap-south-1`** if available). Closer region = slightly lower latency.
4. **Cluster name:** e.g. `FlagHouse` (any name is fine).
5. Click **Create** / **Create Deployment**.
6. Wait **1–3 minutes** until the cluster status is **Active**.

> **Cost:** M0 stays **$0** for the cluster tier. You are not choosing M10/M20 paid tiers.

---

## Part 2 — Security (required before connecting)

### 4. Create a database user

1. Atlas will prompt **Create your first database user**, or go to:
   - **Security** → **Database Access** → **Add New Database User**
2. **Authentication:** Password  
3. **Username:** e.g. `flaghouse_admin`  
4. **Password:** Generate a strong password → **copy and save it** (you need it once for `.env`).  
5. **Database User Privileges:** **Read and write to any database** (or **Atlas admin** for dev only).  
6. Click **Add User**.

### 5. Allow your computer to connect (IP access)

1. Go to **Security** → **Network Access** → **Add IP Address**
2. For development on your Mac, either:
   - **Add Current IP Address** (recommended), or  
   - **Allow Access from Anywhere** → `0.0.0.0/0` (easier, less secure — only for learning; remove before real launch)
3. Click **Confirm**.

> If seed/API fails with “connection timed out”, your IP is usually not whitelisted.

---

## Part 3 — Get the connection string

### 6. Copy connection URI

1. Go to **Database** (or **Clusters**).
2. On your cluster, click **Connect**.
3. Choose **Drivers** (or **Connect your application**).
4. **Driver:** Node.js  
5. **Version:** 6.7 or later (any recent version is fine)
6. Copy the connection string. It looks like:

```text
mongodb+srv://flaghouse_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

7. **Edit the string for FlagHouse:**
   - Replace `<password>` with your real password (no angle brackets).
   - If the password has special characters (`@`, `#`, `%`, etc.), [URL-encode](https://www.urlencoder.org/) them.
   - Add the database name **`flaghouse`** before the `?`:

```text
mongodb+srv://flaghouse_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/flaghouse?retryWrites=true&w=majority
```

---

## Part 4 — Connect the FlagHouse backend

### 7. Update `backend/.env`

Open `/Users/kavyaarora/Desktop/kavyacompany/backend/.env` and set:

```env
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/flaghouse?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5174
```

- Do **not** commit `.env` to git (it is already in `.gitignore`).
- Never paste your real password in chat or screenshots.

### 8. Seed products into Atlas

In a terminal:

```bash
cd backend
npm run seed
```

Expected output:

```text
MongoDB connected: flaghouse
Cleared X existing products
Seeded 16 products into MongoDB
```

### 9. Start the API

```bash
npm run dev
```

or:

```bash
npm start
```

### 10. Verify connection

Open in the browser:

- [http://localhost:5000/api/health](http://localhost:5000/api/health)

You should see:

```json
{
  "status": "ok",
  "service": "FlagHouse API",
  "database": "connected",
  ...
}
```

---

## Part 5 — View your data clearly

### Option A — Atlas website (easiest)

1. In Atlas, go to **Database** → your cluster.
2. Click **Browse Collections**.
3. Database: **`flaghouse`**
4. Collection: **`products`**
5. You should see **16 documents** with fields like `name`, `category`, `price`, `legacyId`, `featured`.

### Option B — MongoDB Compass (desktop app)

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass).
2. Open Compass → **New Connection**.
3. Paste the same `MONGODB_URI` from `.env` (with real password).
4. Connect → open **`flaghouse`** → **`products`**.

---

## Troubleshooting

| Problem | What to try |
|--------|-------------|
| `authentication failed` | Wrong username/password in URI; re-check Database Access user |
| `connection timed out` | Add your IP under Network Access; check VPN/firewall |
| `bad auth` / special chars in password | URL-encode the password in the connection string |
| Seed works but health says disconnected | Restart API after changing `.env` |
| Cluster paused | Atlas UI → resume the M0 cluster |

---

## After setup

- Local MongoDB on your Mac is **no longer required** if `MONGODB_URI` points to Atlas.
- Next project step: **Products API** + connect the React frontend to `http://localhost:5000`.
