// @ts-nocheck
import { Router, Response } from 'express';
import { authMiddleware, AuthRequest, roleCheck } from '../middleware/auth';
import { ProfileService } from '../services/profile.service';

const router = Router();

// ===== BRAND PROFILE ROUTES =====

// US-2.1: Get Brand Profile
router.get('/brand', authMiddleware, roleCheck(['BRAND']), async (req: AuthRequest, res: Response) => {
  try {
    const profile = await ProfileService.getBrandProfile(req.user!.id);
    res.json({
      success: true,
      data: profile
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

// US-2.1: Update Brand Profile
router.put('/brand', authMiddleware, roleCheck(['BRAND']), async (req: AuthRequest, res: Response) => {
  try {
    const { companyName, industry, bio, website, budgetTier, targetInfluencerType } = req.body;
    
    const profile = await ProfileService.updateBrandProfile(req.user!.id, {
      companyName,
      industry,
      bio,
      website,
      budgetTier,
      targetInfluencerType
    });

    res.json({
      success: true,
      data: profile
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ===== INFLUENCER PROFILE ROUTES =====

// US-2.2: Get Influencer Profile
router.get('/influencer', authMiddleware, roleCheck(['INFLUENCER']), async (req: AuthRequest, res: Response) => {
  try {
    const profile = await ProfileService.getInfluencerProfile(req.user!.id);
    res.json({
      success: true,
      data: profile
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

// US-2.2: Update Influencer Profile
router.put('/influencer', authMiddleware, roleCheck(['INFLUENCER']), async (req: AuthRequest, res: Response) => {
  try {
    const { motto, bio, niche, platform, followerCount, engagementRate, location, profilePhoto } = req.body;
    
    const profile = await ProfileService.updateInfluencerProfile(req.user!.id, {
      motto,
      bio,
      niche,
      platform,
      followerCount,
      engagementRate,
      location,
      profilePhoto
    });

    res.json({
      success: true,
      data: profile
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ===== PORTFOLIO ITEMS (US-2.3) =====

// Add Portfolio Item
router.post('/portfolio', authMiddleware, roleCheck(['INFLUENCER']), async (req: AuthRequest, res: Response) => {
  try {
    const { url, description } = req.body;

    if (!url || !description) {
      return res.status(400).json({
        success: false,
        error: 'URL and description are required'
      });
    }

    const item = await ProfileService.addPortfolioItem(req.user!.id, { url, description });

    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get Portfolio Items
router.get('/portfolio', authMiddleware, roleCheck(['INFLUENCER']), async (req: AuthRequest, res: Response) => {
  try {
    const items = await ProfileService.getPortfolioItems(req.user!.id);
    res.json({
      success: true,
      data: items
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

// Update Portfolio Item
router.put('/portfolio/:itemId', authMiddleware, roleCheck(['INFLUENCER']), async (req: AuthRequest, res: Response) => {
  try {
    const { url, description } = req.body;

    if (!url || !description) {
      return res.status(400).json({
        success: false,
        error: 'URL and description are required'
      });
    }

    const item = await ProfileService.updatePortfolioItem(req.params.itemId, { url, description });

    res.json({
      success: true,
      data: item
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Delete Portfolio Item
router.delete('/portfolio/:itemId', authMiddleware, roleCheck(['INFLUENCER']), async (req: AuthRequest, res: Response) => {
  try {
    await ProfileService.deletePortfolioItem(req.params.itemId);

    res.json({
      success: true,
      message: 'Portfolio item deleted'
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

// ===== PUBLIC PROFILES (US-2.4) =====

// Get Public Brand Profile
router.get('/public/brand/:userId', async (req, res: Response) => {
  try {
    const profile = await ProfileService.getPublicBrandProfile(req.params.userId);
    res.json({
      success: true,
      data: profile
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

// Get Public Influencer Profile
router.get('/public/influencer/:userId', async (req, res: Response) => {
  try {
    const profile = await ProfileService.getPublicInfluencerProfile(req.params.userId);
    res.json({
      success: true,
      data: profile
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
