import { Router } from 'express';
import { getSubjectProgress, getVideoProgress, updateVideoProgress } from './progress.controller';
import { authenticateUser } from '../../middleware/authMiddleware';

const router = Router();

router.get('/subjects/:subjectId', authenticateUser, getSubjectProgress);
router.get('/videos/:videoId', authenticateUser, getVideoProgress);
router.post('/videos/:videoId', authenticateUser, updateVideoProgress);

export default router;
