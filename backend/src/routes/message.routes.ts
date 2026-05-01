// @ts-nocheck
import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { MessageService } from '../services/message.service';

const router = Router();

// US-5.1: Send Message
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { campaignId, receiverId, text } = req.body;

    if (!campaignId || !receiverId || !text) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID, receiver ID, and text are required'
      });
    }

    const message = await MessageService.sendMessage(campaignId, req.user!.id, receiverId, text);

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// US-5.2: View Inbox
router.get('/inbox', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const threads = await MessageService.getInbox(req.user!.id);
    
    // Also get conversation opportunities (approved applications with no messages yet)
    const opportunities = await MessageService.getConversationOpportunities(req.user!.id);
    
    // Merge threads and opportunities, avoiding duplicates
    // Use otherPartyId as key to ensure one conversation per unique person
    const threadMap = new Map<string, any>();
    
    // Add existing message threads first (they have priority)
    for (const thread of threads) {
      const key = thread.otherPartyId; // Only key by otherPartyId
      if (!threadMap.has(key)) {
        threadMap.set(key, thread);
      }
    }
    
    // Add opportunities if they don't already have a conversation
    for (const opp of opportunities) {
      const key = opp.otherPartyId;
      if (!threadMap.has(key)) {
        threadMap.set(key, opp);
      }
    }

    res.json({
      success: true,
      data: Array.from(threadMap.values())
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// US-5.2: Get Thread
router.get('/thread/:campaignId/:otherUserId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const messages = await MessageService.getMessageThread(
      req.params.campaignId,
      req.user!.id,
      req.params.otherUserId
    );

    res.json({
      success: true,
      data: messages
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// US-5.3: Unread Badge
router.get('/unread/count', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const count = await MessageService.getUnreadCount(req.user!.id);

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

export default router;
