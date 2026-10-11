import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { syncCooldown } from '../middleware/syncCooldown.js';
import * as ctrl from '../controllers/syncController.js';

const router = Router();
router.use(requireAuth);

const platformSchema = z.object({
  params: z.object({ platform: z.enum(['codeforces', 'leetcode']) }),
});

router.get('/status', ctrl.status);
router.post('/:platform', ctrl.withSyncLimiter(), validate(platformSchema), syncCooldown, ctrl.syncNow);

export default router;
