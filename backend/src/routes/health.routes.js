import { Router } from 'express';
import { getDbStatus } from '../config/db.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'FlagHouse API',
    database: getDbStatus(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
