import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { ENV } from './config/env';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import summaryRoutes from './modules/subjects/subjects.routes';
import progressRoutes from './modules/progress/progress.routes';
import videoRoutes from './modules/videos/videos.routes';

const app = express();

app.use(cors({
  origin: ENV.CORS_ORIGIN === '*' ? true : ENV.CORS_ORIGIN.split(','),
  credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subjects', summaryRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/progress', progressRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
