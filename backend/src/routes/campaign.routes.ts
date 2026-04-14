import { Router } from 'express';
import { authMiddleware, roleCheck } from '../middleware/auth';

const router = Router();

// US-3.1: Post a Campaign
router.post('/', authMiddleware, roleCheck(['BRAND']), async (req, res) => {
  res.json({ message: 'POST campaign - TODO' });
});

// US-3.2: Edit or Close a Campaign
router.put('/:campaignId', authMiddleware, roleCheck(['BRAND']), async (req, res) => {
  res.json({ message: 'UPDATE campaign - TODO' });
});

// US-3.3: Browse and Apply to Campaigns
router.get('/', authMiddleware, async (req, res) => {
  res.json({ message: 'GET campaigns - TODO' });
});

router.get('/:campaignId', authMiddleware, async (req, res) => {
  res.json({ message: 'GET campaign details - TODO' });
});

// US-3.4: Campaign Status Tracking
router.get('/:campaignId/status', authMiddleware, async (req, res) => {
  res.json({ message: 'GET campaign status - TODO' });
});

export default router;
