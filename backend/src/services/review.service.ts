import { prisma } from '../index';
import { Review, CreateReviewRequest } from '../shared/types';

export class ReviewService {
  // US-6.1: Leave a Rating and Review
  static async createReview(reviewerId: string, data: CreateReviewRequest): Promise<Review> {
    // Verify campaign is completed
    const campaign = await prisma.campaign.findUnique({
      where: { id: data.campaignId }
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status !== 'COMPLETED') {
      throw new Error('Can only review completed campaigns');
    }

    // Verify reviewer was involved
    const application = await prisma.campaignApplication.findFirst({
      where: {
        campaignId: data.campaignId,
        OR: [
          { influencerId: reviewerId },
          { campaign: { brandId: reviewerId } }
        ]
      }
    });

    if (!application && campaign.brandId !== reviewerId) {
      throw new Error('You were not part of this campaign');
    }

    // Check if already reviewed
    const existing = await prisma.review.findUnique({
      where: {
        campaignId_reviewerId_reviewedUserId: {
          campaignId: data.campaignId,
          reviewerId,
          reviewedUserId: data.reviewedUserId
        }
      }
    });

    if (existing) {
      throw new Error('You have already reviewed this user for this campaign');
    }

    const review = await prisma.review.create({
      data: {
        campaignId: data.campaignId,
        reviewerId,
        reviewedUserId: data.reviewedUserId,
        rating: Math.max(1, Math.min(5, data.rating)), // Ensure 1-5
        comment: data.comment
      }
    });

    return {
      id: review.id,
      campaignId: review.campaignId,
      reviewerId: review.reviewerId,
      reviewedUserId: review.reviewedUserId,
      rating: review.rating,
      comment: review.comment,
      isReported: review.isReported,
      reportReason: review.reportReason ?? undefined,
      createdAt: review.createdAt.toISOString()
    };
  }

  // US-6.2: Get Reviews for User
  static async getUserReviews(userId: string) {
    const reviews = await prisma.review.findMany({
      where: { reviewedUserId: userId },
      include: {
        reviewer: { select: { id: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return reviews.map(r => ({
      id: r.id,
      campaignId: r.campaignId,
      reviewerId: r.reviewerId,
      reviewedUserId: r.reviewedUserId,
      rating: r.rating,
      comment: r.comment,
      isReported: r.isReported,
      reportReason: r.reportReason ?? undefined,
      createdAt: r.createdAt.toISOString()
    }));
  }

  // Get Review Stats (Average rating)
  static async getReviewStats(userId: string) {
    const reviews = await prisma.review.findMany({
      where: { reviewedUserId: userId },
      select: { rating: true }
    });

    if (reviews.length === 0) {
      return { averageRating: 0, reviewCount: 0 };
    }

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      averageRating: sum / reviews.length,
      reviewCount: reviews.length
    };
  }

  // US-6.3: Report Review
  static async reportReview(reviewId: string, reason: string): Promise<Review> {
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        isReported: true,
        reportReason: reason
      }
    });

    return {
      id: review.id,
      campaignId: review.campaignId,
      reviewerId: review.reviewerId,
      reviewedUserId: review.reviewedUserId,
      rating: review.rating,
      comment: review.comment,
      isReported: review.isReported,
      reportReason: review.reportReason ?? undefined,
      createdAt: review.createdAt.toISOString()
    };
  }
}
