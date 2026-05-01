import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NotificationService {
  // Create a notification
  static async createNotification(
    campaignId: string,
    fromUserId: string,
    toUserId: string,
    type: string,
    message: string
  ) {
    return await prisma.notification.create({
      data: {
        campaignId,
        fromUserId,
        toUserId,
        type,
        message
      },
      include: {
        fromUser: { select: { id: true, email: true } },
        campaign: { select: { id: true, title: true } }
      }
    });
  }

  // Get user's notifications
  static async getNotifications(userId: string, limit: number = 50) {
    return await prisma.notification.findMany({
      where: { toUserId: userId },
      include: {
        fromUser: { select: { id: true, email: true } },
        campaign: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  // Get unread notifications count
  static async getUnreadCount(userId: string) {
    return await prisma.notification.count({
      where: {
        toUserId: userId,
        isRead: false
      }
    });
  }

  // Mark notification as read
  static async markAsRead(notificationId: string) {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });
  }

  // Mark all notifications as read for user
  static async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: {
        toUserId: userId,
        isRead: false
      },
      data: { isRead: true }
    });
  }

  // Delete notification
  static async deleteNotification(notificationId: string) {
    return await prisma.notification.delete({
      where: { id: notificationId }
    });
  }
}
