import { Router } from 'express';
import { getSubjects, getSubjectById, getSubjectTree } from './subjects.controller';
import { authenticateUser } from '../../middleware/authMiddleware';

const router = Router();

router.get('/', getSubjects);
router.get('/:subjectId', getSubjectById);
router.get('/:subjectId/tree', authenticateUser, getSubjectTree);

export default router;
