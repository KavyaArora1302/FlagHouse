import { Router } from 'express';
import { getProducts, getProductByLegacyId } from '../controllers/product.controller.js';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductByLegacyId);

export default router;
