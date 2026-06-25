import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import modelRoutes from './routes/modelRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(express.json({ limit: '1mb' }));

  const origins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: origins.length ? origins : true,
      credentials: true,
    }),
  );

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('tiny'));
  }

  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'study-sphere-backend', time: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/models', modelRoutes);
  app.use('/api/chat', chatRoutes);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Centralized error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    const status = err.status || 500;
    const message = status === 500 ? 'Internal server error' : err.message;
    res.status(status).json({ error: message });
  });

  return app;
}
