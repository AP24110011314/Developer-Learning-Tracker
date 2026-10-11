import { Router } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import * as ctrl from '../controllers/problemsController.js';

const router = Router();
router.use(requireAuth);

const difficulty = z.enum(['easy', 'medium', 'hard']);
const status = z.enum(['solved', 'revisit', 'stuck']);

const listSchema = z.object({
  query: z.object({
    difficulty: difficulty.optional(),
    topic: z.string().max(100).optional(),
    status: status.optional(),
    from: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    to: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    page: z.coerce.number().int().min(1).max(1000).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});

const objectId = z.string().refine((v) => mongoose.isValidObjectId(v), 'Invalid id');

const createSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(300),
    platform: z.string().max(50).optional(),
    url: z.string().max(2000).optional(),
    difficulty: difficulty.optional(),
    topics: z.array(z.string().max(50)).max(30).optional(),
    status: status.optional(),
    timeMinutes: z.number().min(0).max(100000).optional(),
    notes: z.string().max(5000).optional(),
    solvedAt: z.string().datetime({ offset: true }).optional(),
    source: z.enum(['manual', 'sync']).optional(),
    externalId: z.string().max(200).optional(),
  }),
});

const idParamSchema = z.object({
  params: z.object({ id: objectId }),
});

const updateSchema = z.object({
  params: z.object({ id: objectId }),
  body: createSchema.shape.body.partial(),
});

router.get('/', validate(listSchema), ctrl.list);
router.post('/', validate(createSchema), ctrl.create);
router.get('/:id', validate(idParamSchema), ctrl.getOne);
router.put('/:id', validate(updateSchema), ctrl.update);
router.delete('/:id', validate(idParamSchema), ctrl.remove);

export default router;
