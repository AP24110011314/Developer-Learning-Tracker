import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validate.js';
import * as ctrl from '../controllers/publicController.js';

const router = Router();

// No auth on this router. Dedicated tight limit against scraping.
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

const showSchema = z.object({
  params: z.object({ username: z.string().min(1).max(30) }),
  query: z.object({
    year: z.coerce.number().int().min(2000).max(2100).optional(),
  }),
});

router.get('/:username', publicLimiter, validate(showSchema), ctrl.show);

export default router;
