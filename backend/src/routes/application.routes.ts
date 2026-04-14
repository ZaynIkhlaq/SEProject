import { Router } from 'express';
import { authMiddleware, roleCheck } from '../middleware/auth';

const router = Router();

// US-3.3: Apply to Campaign
router.post('/', authMiddleware, roleCheck(['INFLUENCER']), async (req, res) => {
  res.json({ message: 'POST application - TODO' });
});

// Accept/Reject Application
router.patch('/:applicationId', authMiddleware, roleCheck(['BRAND']), async (req, res) => {
  res.json({ message: 'PATCH application status - TODO' });
});

export default router;
