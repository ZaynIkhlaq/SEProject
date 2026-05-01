import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { NotificationService } from '../services/notification.service';

const router = Router();

// Get all notifications for user
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await NotificationService.getNotifications(req.user!.id, 50);
    
    res.json({
      success: true,
      data: notifications
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get unread count
router.get('/count/unread', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const count = await NotificationService.getUnreadCount(req.user!.id);
    
    res.json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Mark notification as read
router.put('/:notificationId/read', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const notification = await NotificationService.markAsRead(req.params.notificationId);
    
    res.json({
      success: true,
      data: notification
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Mark all notifications as read
router.put('/all/read', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await NotificationService.markAllAsRead(req.user!.id);
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Delete notification
router.delete('/:notificationId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await NotificationService.deleteNotification(req.params.notificationId);
    
    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
