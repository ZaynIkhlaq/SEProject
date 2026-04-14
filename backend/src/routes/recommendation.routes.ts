import { Router } from 'express';
import { authMiddleware, roleCheck } from '../middleware/auth';

const router = Router();

// US-4.1: Get Recommended Influencers
router.get('/:campaignId', authMiddleware, roleCheck(['BRAND']), async (req, res) => {
  res.json({ message: 'GET recommendations - TODO' });
});

// US-4.2: Campaign Search & Filter
router.get('/', authMiddleware, roleCheck(['INFLUENCER']), async (req, res) => {
  res.json({ message: 'GET campaigns with filters - TODO' });
});

export default router;
