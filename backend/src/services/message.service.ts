import { prisma } from '../index';
import { Message, MessageThread } from '../shared/types';
import xss from 'xss';

export class MessageService {
  // US-5.1: Send Message
  static async sendMessage(campaignId: string, senderId: string, receiverId: string, text: string): Promise<Message> {
    // Get campaign to verify it exists and status
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status === 'CLOSED' || campaign.status === 'COMPLETED') {
      throw new Error('Cannot message on closed campaigns');
    }

    // Verify sender is influencer OR brand on this campaign
    const senderApplication = await prisma.campaignApplication.findFirst({
      where: {
        campaignId,
        influencerId: senderId,
        status: 'ACCEPTED'
      }
    });

    const senderIsBrand = campaign.brandId === senderId;

    if (!senderApplication && !senderIsBrand) {
      throw new Error('You are not part of this campaign');
    }

    // Verify valid receiver relationship
    if (senderIsBrand) {
      // Brand messaging influencer
      const receiverApplication = await prisma.campaignApplication.findFirst({
        where: {
          campaignId,
          influencerId: receiverId,
          status: 'ACCEPTED'
        }
      });
      if (!receiverApplication) {
        throw new Error('Receiver is not part of this campaign');
      }
    } else {
      // Influencer messaging brand
      if (campaign.brandId !== receiverId) {
        throw new Error('Receiver must be the brand for this campaign');
      }
    }

    // Sanitize message text
    const sanitizedText = xss(text.trim(), {
      whiteList: {}, // Allow no HTML tags
      stripIgnoreTag: true,
    });

    if (sanitizedText.length === 0) {
      throw new Error('Message cannot be empty');
    }

    if (sanitizedText.length > 5000) {
      throw new Error('Message too long (max 5000 characters)');
    }

    const message = await prisma.message.create({
      data: {
        campaignId,
        senderId,
        receiverId,
        text: sanitizedText
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

    // Group by otherPartyId only (one conversation per unique person)
    const threadMap = new Map<string, MessageThread>();

    for (const msg of messages) {
      const otherPartyId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const threadKey = otherPartyId; // Key by otherPartyId only
      
      if (!threadMap.has(threadKey)) {
        const otherParty = msg.senderId === userId ? msg.receiver : msg.sender;
        threadMap.set(threadKey, {
          campaignId: msg.campaignId, // Use the campaign from the latest message
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

  // Get conversation opportunities (approved applications for messaging)
  static async getConversationOpportunities(userId: string): Promise<MessageThread[]> {
    try {
      // Get all ACCEPTED applications for this user (as influencer)
      const influencerApps = await prisma.campaignApplication.findMany({
        where: {
          influencerId: userId,
          status: 'ACCEPTED'
        },
        include: {
          campaign: {
            include: {
              brand: true
            }
          }
        }
      });

      // Get all campaigns where this user is the brand with ACCEPTED applications
      const brandCampaigns = await prisma.campaign.findMany({
        where: { brandId: userId }
      });

      let brandApps: any[] = [];
      
      // Only query if there are campaigns
      if (brandCampaigns.length > 0) {
        brandApps = await prisma.campaignApplication.findMany({
          where: {
            campaignId: { in: brandCampaigns.map(c => c.id) },
            status: 'ACCEPTED'
          },
          include: {
            influencer: true,
            campaign: true
          }
        });
      }

      // Use otherPartyId as key to deduplicate
      const opportunityMap = new Map<string, MessageThread>();

      // Add influencer's brand conversation opportunities
      for (const app of influencerApps) {
        const key = app.campaign.brandId; // Key by brandId
        if (!opportunityMap.has(key)) {
          opportunityMap.set(key, {
            campaignId: app.campaign.id,
            otherPartyId: app.campaign.brandId,
            otherPartyName: app.campaign.brand.email,
            lastMessage: undefined,
            unreadCount: 0
          });
        }
      }

      // Add brand's influencer conversation opportunities
      for (const app of brandApps) {
        const key = app.influencer.id; // Key by influencerId
        if (!opportunityMap.has(key)) {
          opportunityMap.set(key, {
            campaignId: app.campaign.id,
            otherPartyId: app.influencer.id,
            otherPartyName: app.influencer.email,
            lastMessage: undefined,
            unreadCount: 0
          });
        }
      }

      return Array.from(opportunityMap.values());
    } catch (error) {
      console.error('Error in getConversationOpportunities:', error);
      return [];
    }
  }
}
