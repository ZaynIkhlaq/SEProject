import { Router, Response } from 'express';
import { authMiddleware, AuthRequest, roleCheck } from '../middleware/auth';
import { ReviewService } from '../services/review.service';

const router = Router();

// US-6.1: Leave Review
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { campaignId, reviewedUserId, rating, comment } = req.body;

    if (!campaignId || !reviewedUserId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: campaignId, reviewedUserId, rating, comment'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    const review = await ReviewService.createReview(req.user!.id, {
      campaignId,
      reviewedUserId,
      rating,
      comment
    });

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// US-6.2: View Reviews
router.get('/user/:userId', async (req: Response, res: Response) => {
  try {
    const reviews = await ReviewService.getUserReviews(req.params.userId);

    res.json({
      success: true,
      data: reviews
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get Review Stats
router.get('/stats/:userId', async (req, res: Response) => {
  try {
    const stats = await ReviewService.getReviewStats(req.params.userId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// US-6.3: Report Review
router.post('/:reviewId/report', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Report reason is required'
      });
    }

    const review = await ReviewService.reportReview(req.params.reviewId, reason);

    res.json({
      success: true,
      data: review
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
