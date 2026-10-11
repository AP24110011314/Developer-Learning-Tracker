import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import * as ctrl from '../controllers/authController.js';

const router = Router();

const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, underscore only'),
    email: z.string().email(),
    password: z.string().min(8).max(128),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

const updateMeSchema = z.object({
  body: z.object({
    bio: z.string().max(500).optional(),
    avatar: z.string().max(2000).optional(),
    timezone: z.string().min(1).max(100).optional(),
    handles: z
      .object({
        leetcode: z.string().max(100).optional(),
        codeforces: z.string().max(100).optional(),
      })
      .optional(),
    privacy: z
      .object({
        profilePublic: z.boolean().optional(),
        showHeatmap: z.boolean().optional(),
        showProjects: z.boolean().optional(),
      })
      .optional(),
  }),
});

router.post('/register', authLimiter, validate(registerSchema), ctrl.register);
router.post('/login', authLimiter, validate(loginSchema), ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', ctrl.logout);
router.get('/me', requireAuth, ctrl.me);
router.patch('/me', requireAuth, validate(updateMeSchema), ctrl.updateMe);

export default router;
