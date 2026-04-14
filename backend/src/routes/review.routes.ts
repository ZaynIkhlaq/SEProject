import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// US-6.1: Leave Review
router.post('/', authMiddleware, async (req, res) => {
  res.json({ message: 'POST review - TODO' });
});

// US-6.2: View Reviews
router.get('/user/:userId', async (req, res) => {
  res.json({ message: 'GET user reviews - TODO' });
});

// US-6.3: Report Review
router.post('/:reviewId/report', authMiddleware, async (req, res) => {
  res.json({ message: 'POST report review - TODO' });
});

export default router;
