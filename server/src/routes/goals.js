import { Router } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import * as ctrl from '../controllers/goalsController.js';

const router = Router();
router.use(requireAuth);

const objectId = z.string().refine((v) => mongoose.isValidObjectId(v), 'Invalid id');

const goalBody = z.object({
  title: z.string().min(1).max(200),
  metric: z.enum(['problems', 'streak', 'projects']),
  target: z.number().int().min(1).max(100000),
  filter: z
    .object({
      difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
      topic: z.string().max(100).optional(),
    })
    .optional(),
  startDate: z.string().datetime({ offset: true }).optional(),
  deadline: z.string().datetime({ offset: true }).optional(),
  status: z.enum(['active', 'completed', 'archived']).optional(),
});

const createSchema = z.object({ body: goalBody });
const idParamSchema = z.object({ params: z.object({ id: objectId }) });
const updateSchema = z.object({
  params: z.object({ id: objectId }),
  body: goalBody.partial(),
});

router.get('/', ctrl.list);
router.post('/', validate(createSchema), ctrl.create);
router.get('/:id', validate(idParamSchema), ctrl.getOne);
router.put('/:id', validate(updateSchema), ctrl.update);
router.delete('/:id', validate(idParamSchema), ctrl.remove);

export default router;
