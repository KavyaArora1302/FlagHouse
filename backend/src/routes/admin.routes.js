import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/requireAdmin.middleware.js';
import { getAdminStatus } from '../controllers/admin.controller.js';

const router = Router();

router.use(protect, requireAdmin);

router.get('/status', getAdminStatus);

export default router;
