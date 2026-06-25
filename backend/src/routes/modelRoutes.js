import { Router } from 'express';
import { getPublicCatalog } from '../config/models.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

/**
 * Returns the dynamic plan/model catalog.
 * Only public fields are returned (no provider names or keys).
 */
router.get('/', authMiddleware, (_req, res) => {
  res.json(getPublicCatalog());
});

export default router;
