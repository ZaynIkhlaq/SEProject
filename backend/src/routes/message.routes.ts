import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// US-5.1: Send Message
router.post('/', authMiddleware, async (req, res) => {
  res.json({ message: 'POST message - TODO' });
});

// US-5.2: View Inbox
router.get('/inbox', authMiddleware, async (req, res) => {
  res.json({ message: 'GET inbox - TODO' });
});

// US-5.2: Get Thread
router.get('/thread/:campaignId', authMiddleware, async (req, res) => {
  res.json({ message: 'GET message thread - TODO' });
});

// US-5.3: Unread Badge
router.get('/unread/count', authMiddleware, async (req, res) => {
  res.json({ message: 'GET unread count - TODO' });
});

export default router;
