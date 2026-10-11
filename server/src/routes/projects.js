import { Router } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import * as ctrl from '../controllers/projectsController.js';

const router = Router();
router.use(requireAuth);

const objectId = z.string().refine((v) => mongoose.isValidObjectId(v), 'Invalid id');

const projectBody = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  stack: z.array(z.string().max(50)).max(30).optional(),
  repoUrl: z.string().max(2000).optional(),
  liveUrl: z.string().max(2000).optional(),
  status: z.enum(['planned', 'in-progress', 'completed', 'archived']).optional(),
  learnings: z.string().max(5000).optional(),
  featured: z.boolean().optional(),
});

const createSchema = z.object({ body: projectBody });
const idParamSchema = z.object({ params: z.object({ id: objectId }) });
const updateSchema = z.object({
  params: z.object({ id: objectId }),
  body: projectBody.partial(),
});

router.get('/', ctrl.list);
router.post('/', validate(createSchema), ctrl.create);
router.get('/:id', validate(idParamSchema), ctrl.getOne);
router.put('/:id', validate(updateSchema), ctrl.update);
router.delete('/:id', validate(idParamSchema), ctrl.remove);

export default router;
