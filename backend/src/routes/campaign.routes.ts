// @ts-nocheck
import { Router, Response } from 'express';
import { authMiddleware, AuthRequest, roleCheck } from '../middleware/auth';
import { CampaignService } from '../services/campaign.service';

const router = Router();

// US-3.1: Post a Campaign
router.post('/', authMiddleware, roleCheck(['BRAND']), async (req: AuthRequest, res: Response) => {
  try {
    const { title, productService, requiredNiche, budgetTier, influencersNeeded, deadline, description } = req.body;

    if (!title || !productService || !requiredNiche || !budgetTier || !influencersNeeded || !deadline) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const campaign = await CampaignService.createCampaign(req.user!.id, {
      title,
      productService,
      requiredNiche,
      budgetTier,
      influencersNeeded,
      deadline,
      description
    });

    res.status(201).json({
      success: true,
      data: campaign
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// US-3.2: Edit Campaign
router.put('/:campaignId', authMiddleware, roleCheck(['BRAND']), async (req: AuthRequest, res: Response) => {
  try {
    const campaign = await CampaignService.updateCampaign(req.params.campaignId, req.user!.id, req.body);

    res.json({
      success: true,
      data: campaign
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// US-3.2: Close Campaign
router.post('/:campaignId/close', authMiddleware, roleCheck(['BRAND']), async (req: AuthRequest, res: Response) => {
  try {
    const campaign = await CampaignService.closeCampaign(req.params.campaignId, req.user!.id);

    res.json({
      success: true,
      data: campaign
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// US-3.3: Browse Campaigns
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
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

// Get Campaign Details
router.get('/:campaignId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const campaign = await CampaignService.getCampaignById(req.params.campaignId);

    res.json({
      success: true,
      data: campaign
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

// US-3.4: Get Campaign Status
router.get('/:campaignId/status', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const status = await CampaignService.getCampaignStatus(req.params.campaignId);

    res.json({
      success: true,
      data: status
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
