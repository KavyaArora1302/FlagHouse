import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.routes.js';
import productRoutes from './routes/product.routes.js';
import authRoutes from './routes/auth.routes.js';
import orderRoutes from './routes/order.routes.js';
import adminRoutes from './routes/admin.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import contactRoutes from './routes/contact.routes.js';

const app = express();

const extraOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim())
  : [];

const defaultOrigins = [
  'http://localhost:5174',
  'http://localhost:5175',
  ...extraOrigins,
];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (defaultOrigins.includes(origin)) return true;
  // Vite may use the next free port if 5174 is taken (e.g. other project)
  if (/^http:\/\/localhost:\d+$/.test(origin)) return true;
  // Vercel production + preview deployments
  try {
    const { hostname } = new URL(origin);
    if (hostname === 'flag-house.vercel.app' || hostname.endsWith('.vercel.app')) {
      return true;
    }
  } catch {
    // ignore invalid origin URL
  }
  return false;
};

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    message: 'FlagHouse API is running',
    health: '/api/health',
    products: '/api/products',
    auth: '/api/auth',
    orders: '/api/orders',
    admin: '/api/admin',
    payments: '/api/payments',
    contact: '/api/contact',
  });
});

app.use('/api/health', healthRoutes);
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/contact', contactRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

export default app;
