import { Router, Response } from 'express';
import { authMiddleware, AuthRequest, roleCheck } from '../middleware/auth';
import { ApplicationService } from '../services/application.service';

const router = Router();

// US-3.3: Apply to Campaign
router.post('/', authMiddleware, roleCheck(['INFLUENCER']), async (req: AuthRequest, res: Response) => {
  try {
    const { campaignId } = req.body;

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID is required'
      });
    }

    const application = await ApplicationService.applyToCampaign(campaignId, req.user!.id);

    res.status(201).json({
      success: true,
      data: application
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Accept Application
router.patch('/:applicationId/accept', authMiddleware, roleCheck(['BRAND']), async (req: AuthRequest, res: Response) => {
  try {
    const application = await ApplicationService.acceptApplication(req.params.applicationId, req.user!.id);

    res.json({
      success: true,
      data: application
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Reject Application
router.patch('/:applicationId/reject', authMiddleware, roleCheck(['BRAND']), async (req: AuthRequest, res: Response) => {
  try {
    const application = await ApplicationService.rejectApplication(req.params.applicationId, req.user!.id);

    res.json({
      success: true,
      data: application
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get Campaign Applications (Brand)
router.get('/campaign/:campaignId', authMiddleware, roleCheck(['BRAND']), async (req: AuthRequest, res: Response) => {
  try {
    const applications = await ApplicationService.getCampaignApplications(req.params.campaignId, req.user!.id);

    res.json({
      success: true,
      data: applications
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get Influencer Applications
router.get('/influencer/my-applications', authMiddleware, roleCheck(['INFLUENCER']), async (req: AuthRequest, res: Response) => {
  try {
    const applications = await ApplicationService.getInfluencerApplications(req.user!.id);

    res.json({
      success: true,
      data: applications
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
