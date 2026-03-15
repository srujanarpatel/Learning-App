import { Router } from 'express';
import { getVideoById } from './videos.controller';
import { authenticateUser } from '../../middleware/authMiddleware';

const router = Router();

router.get('/:videoId', authenticateUser, getVideoById);

export default router;
