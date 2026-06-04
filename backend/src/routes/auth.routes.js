import { Router } from 'express';
import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js';
import {
  updateProfile,
  addSavedAddress,
  updateSavedAddress,
  deleteSavedAddress,
  setDefaultSavedAddress,
  getCheckoutPrefill,
} from '../controllers/profile.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile);
router.get('/checkout-prefill', protect, getCheckoutPrefill);
router.post('/addresses', protect, addSavedAddress);
router.patch('/addresses/:id', protect, updateSavedAddress);
router.delete('/addresses/:id', protect, deleteSavedAddress);
router.patch('/addresses/:id/default', protect, setDefaultSavedAddress);

export default router;
