import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/requireAdmin.middleware.js';
import { getAdminStatus } from '../controllers/admin.controller.js';
import {
  listAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
} from '../controllers/admin.product.controller.js';
import {
  listAdminOrders,
  getAdminOrderById,
  updateAdminOrder,
} from '../controllers/admin.order.controller.js';

const router = Router();

router.use(protect, requireAdmin);

router.get('/status', getAdminStatus);

router.get('/products', listAdminProducts);
router.post('/products', createAdminProduct);
router.patch('/products/:id', updateAdminProduct);
router.delete('/products/:id', deleteAdminProduct);

router.get('/orders', listAdminOrders);
router.get('/orders/:id', getAdminOrderById);
router.patch('/orders/:id', updateAdminOrder);

export default router;
