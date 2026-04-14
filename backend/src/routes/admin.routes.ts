import { Router, Response } from 'express';
import { authMiddleware, AuthRequest, roleCheck } from '../middleware/auth';
import { AdminService } from '../services/admin.service';

const router = Router();

// US-1.5: Get All Users
router.get('/users', authMiddleware, roleCheck(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    const result = await AdminService.getAllUsers(page, pageSize);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get User Details
router.get('/users/:userId', authMiddleware, roleCheck(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const user = await AdminService.getUserDetails(req.params.userId);

    res.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

// US-1.5: Deactivate User
router.patch('/users/:userId/deactivate', authMiddleware, roleCheck(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    await AdminService.deactivateUser(req.params.userId);

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// US-1.5: Delete User
router.delete('/users/:userId', authMiddleware, roleCheck(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    await AdminService.deleteUser(req.params.userId);

    res.json({
      success: true,
      message: 'User deleted permanently'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
