import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import * as ctrl from '../controllers/statsController.js';

const router = Router();
router.use(requireAuth);

const yearSchema = z.object({
  query: z.object({
    year: z.coerce.number().int().min(2000).max(2100).optional(),
  }),
});

const weeksSchema = z.object({
  query: z.object({
    weeks: z.coerce.number().int().min(1).max(52).optional(),
  }),
});

router.get('/overview', ctrl.overview);
router.get('/heatmap', validate(yearSchema), ctrl.heatmap);
router.get('/topics', ctrl.topics);
router.get('/weekly', validate(weeksSchema), ctrl.weekly);
router.get('/difficulty', ctrl.difficulty);

export default router;
