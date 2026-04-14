import { Router } from 'express';
import { authMiddleware, roleCheck } from '../middleware/auth';

const router = Router();

// US-1.5: Get All Users
router.get('/users', authMiddleware, roleCheck(['ADMIN']), async (req, res) => {
  res.json({ message: 'GET all users - TODO' });
});

// US-1.5: Deactivate User
router.patch('/users/:userId/deactivate', authMiddleware, roleCheck(['ADMIN']), async (req, res) => {
  res.json({ message: 'PATCH deactivate user - TODO' });
});

// US-1.5: Delete User
router.delete('/users/:userId', authMiddleware, roleCheck(['ADMIN']), async (req, res) => {
  res.json({ message: 'DELETE user - TODO' });
});

export default router;
