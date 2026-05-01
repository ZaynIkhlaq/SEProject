// @ts-nocheck
import { Router, Response } from 'express';
import { authMiddleware, AuthRequest, roleCheck } from '../middleware/auth';
import { RecommendationService } from '../services/recommendation.service';
import { CampaignService } from '../services/campaign.service';
import { NotificationService } from '../services/notification.service';

const router = Router();

// US-4.1: Get Recommended Influencers
router.get('/:campaignId', authMiddleware, roleCheck(['BRAND']), async (req: AuthRequest, res: Response) => {
  try {
    const topN = parseInt(req.query.topN as string) || 15;
    const recommendations = await RecommendationService.getRecommendedInfluencers(req.params.campaignId, topN);

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// US-4.3: Express Interest in Influencer (Brand notifies Influencer)
router.post('/:campaignId/interest/:influencerId', authMiddleware, roleCheck(['BRAND']), async (req: AuthRequest, res: Response) => {
  try {
    const { campaignId, influencerId } = req.params;
    
    // Get campaign details for the notification message
    const campaign = await CampaignService.getCampaignById(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    // Create notification for the influencer
    const notification = await NotificationService.createNotification(
      campaignId,
      req.user!.id,
      influencerId,
      'BRAND_INTEREST',
      `${campaign.brand.email} is interested in you for their campaign "${campaign.title}". Check it out and apply if interested!`
    );

    res.json({
      success: true,
      data: notification,
      message: 'Interest notification sent to influencer'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// US-4.2: Campaign Search & Filter (Influencer view)
router.get('/search/campaigns', authMiddleware, roleCheck(['INFLUENCER']), async (req: AuthRequest, res: Response) => {
  try {
    const filters = {
      niche: req.query.niche as string | undefined,
      budgetTier: req.query.budgetTier as string | undefined,
      platform: req.query.platform as string | undefined
    };

    const campaigns = await CampaignService.browseActiveCampaigns(filters);

    res.json({
      success: true,
      data: campaigns
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
