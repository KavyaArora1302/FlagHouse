import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '../controllers/payment.controller.js';

const router = Router();

router.use(protect);

router.post('/razorpay/create', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);

export default router;
