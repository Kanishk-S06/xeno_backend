import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getSummary } from '../controllers/insightsController';

const router = Router();

router.get('/summary', authMiddleware, getSummary);

export default router;
