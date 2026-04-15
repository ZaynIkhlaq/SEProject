import { Review, CreateReviewRequest } from '../shared/types';
export declare class ReviewService {
    static createReview(reviewerId: string, data: CreateReviewRequest): Promise<Review>;
    static getUserReviews(userId: string): Promise<{
        id: string;
        campaignId: string;
        reviewerId: string;
        reviewedUserId: string;
        rating: number;
        comment: string;
        isReported: boolean;
        reportReason: string | undefined;
        createdAt: string;
    }[]>;
    static getReviewStats(userId: string): Promise<{
        averageRating: number;
        reviewCount: number;
    }>;
    static reportReview(reviewId: string, reason: string): Promise<Review>;
}
//# sourceMappingURL=review.service.d.ts.map