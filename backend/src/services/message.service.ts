import { prisma } from '../index';
import { Message, MessageThread } from '../shared/types';

export class MessageService {
  // US-5.1: Send Message
  static async sendMessage(campaignId: string, senderId: string, receiverId: string, text: string): Promise<Message> {
    // Verify campaign exists and users are collaborators
    const application = await prisma.campaignApplication.findFirst({
      where: {
        campaignId,
        OR: [
          { influencerId: senderId },
          { influencerId: receiverId }
        ]
      }
    });

    if (!application) {
      throw new Error('No approved collaboration for this campaign');
    }

    const message = await prisma.message.create({
      data: {
        campaignId,
        senderId,
        receiverId,
        text
      }
    });

    return {
      id: message.id,
      campaignId: message.campaignId,
      senderId: message.senderId,
      receiverId: message.receiverId,
      text: message.text,
      isRead: message.isRead,
      createdAt: message.createdAt.toISOString()
    };
  }

  // US-5.2: Get Inbox (all message threads)
  static async getInbox(userId: string): Promise<MessageThread[]> {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, email: true } },
        receiver: { select: { id: true, email: true } }
      }
    });

    // Group by campaign and extract unique conversation partners
    const threadMap = new Map<string, MessageThread>();

    for (const msg of messages) {
      const threadKey = `${msg.campaignId}-${msg.senderId === userId ? msg.receiverId : msg.senderId}`;
      
      if (!threadMap.has(threadKey)) {
        const otherParty = msg.senderId === userId ? msg.receiver : msg.sender;
        threadMap.set(threadKey, {
          campaignId: msg.campaignId,
          otherPartyId: otherParty.id,
          otherPartyName: otherParty.email,
          lastMessage: undefined,
          unreadCount: 0
        });
      }

      const thread = threadMap.get(threadKey)!;
      if (!thread.lastMessage) {
        thread.lastMessage = {
          id: msg.id,
          campaignId: msg.campaignId,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          text: msg.text,
          isRead: msg.isRead,
          createdAt: msg.createdAt.toISOString()
        };
      }

      if (msg.receiverId === userId && !msg.isRead) {
        thread.unreadCount++;
      }
    }

    return Array.from(threadMap.values());
  }

  // US-5.2: Get Message Thread
  static async getMessageThread(campaignId: string, userId: string, otherUserId: string): Promise<Message[]> {
    const messages = await prisma.message.findMany({
      where: {
        campaignId,
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    // Mark as read
    await prisma.message.updateMany({
      where: {
        campaignId,
        receiverId: userId,
        senderId: otherUserId,
        isRead: false
      },
      data: { isRead: true }
    });

    return messages.map(m => ({
      id: m.id,
      campaignId: m.campaignId,
      senderId: m.senderId,
      receiverId: m.receiverId,
      text: m.text,
      isRead: m.isRead,
      createdAt: m.createdAt.toISOString()
    }));
  }

  // US-5.3: Get Unread Message Count
  static async getUnreadCount(userId: string): Promise<number> {
    const count = await prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false
      }
    });

    return count;
  }
}
