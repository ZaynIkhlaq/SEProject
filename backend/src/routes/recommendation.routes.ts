// @ts-nocheck
import { Router, Response } from 'express';
import { authMiddleware, AuthRequest, roleCheck } from '../middleware/auth';
import { RecommendationService } from '../services/recommendation.service';
import { CampaignService } from '../services/campaign.service';

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
