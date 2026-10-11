import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import problemRoutes from './routes/problems.js';
import statsRoutes from './routes/stats.js';
import goalRoutes from './routes/goals.js';
import projectRoutes from './routes/projects.js';
import syncRoutes from './routes/sync.js';
import publicRoutes from './routes/public.js';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(globalLimiter);

  app.get('/api/health', (req, res) => res.json({ ok: true, env: env.NODE_ENV }));

  app.use('/api/auth', authRoutes);
  app.use('/api/problems', problemRoutes);
  app.use('/api/stats', statsRoutes);
  app.use('/api/goals', goalRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/sync', syncRoutes);
  app.use('/api/public', publicRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
