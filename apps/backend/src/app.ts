import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';

import authRoutes from './routes/auth';
import disciplineRoutes from './routes/disciplines';
import resultRoutes from './routes/results';
import recordRoutes from './routes/records';
import userRoutes from './routes/users';
import statisticsRoutes from './routes/statistics';
import gamesRoutes from './routes/games';
import videoRoutes from './routes/videos';

const app = express();

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

// Static files
app.use('/uploads', express.static(path.resolve(config.upload.uploadDir)));

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '2.0.0' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/disciplines', disciplineRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/users', userRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/videos', videoRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
    logger.info(`🚀 AWF Records API v2.0 running on port ${config.port}`);
    logger.info(`📊 Environment: ${config.nodeEnv}`);
});

export default app;
