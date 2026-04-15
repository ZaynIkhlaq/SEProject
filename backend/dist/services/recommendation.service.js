"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationService = void 0;
const index_1 = require("../index");
class RecommendationService {
    // US-4.1: Get Recommended Influencers
    static async getRecommendedInfluencers(campaignId, topN = 15) {
        const campaign = await index_1.prisma.campaign.findUnique({
            where: { id: campaignId }
        });
        if (!campaign) {
            throw new Error('Campaign not found');
        }
        // Get all active influencers
        const influencers = await index_1.prisma.user.findMany({
            where: { role: 'INFLUENCER', isActive: true },
            include: {
                influencerProfile: true,
                receivedReviews: true
            }
        });
        // Score each influencer
        const scored = influencers.map(influencer => {
            const profile = influencer.influencerProfile;
            const reviews = influencer.receivedReviews;
            // Niche Match (40%)
            const nicheMatch = profile.niche.toLowerCase() === campaign.requiredNiche.toLowerCase() ? 1 : 0;
            // Follower Tier Score (30%)
            let followerTierScore = 0;
            if (profile.followerCount >= 10000)
                followerTierScore = 1;
            else if (profile.followerCount >= 5000)
                followerTierScore = 0.7;
            else if (profile.followerCount >= 1000)
                followerTierScore = 0.4;
            // Profile Completeness (20%)
            let completenessScore = 0;
            const completenessFields = [
                profile.bio,
                profile.motto,
                profile.location,
                profile.profilePhoto
            ].filter(Boolean).length;
            completenessScore = Math.min(1, completenessFields / 4);
            // Review Score (10%)
            let reviewScore = 0;
            if (reviews.length > 0) {
                const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
                reviewScore = avgRating / 5; // Normalize to 0-1
            }
            // Weighted Score
            const totalScore = (nicheMatch * 0.4) +
                (Math.min(1, profile.engagementRate / 100) * 0.15) + // Engagement bonus
                (followerTierScore * 0.3) +
                (completenessScore * 0.2) +
                (reviewScore * 0.1);
            return {
                id: influencer.id,
                profile: {
                    id: profile.id,
                    userId: influencer.id,
                    motto: profile.motto || undefined,
                    bio: profile.bio || undefined,
                    niche: profile.niche,
                    platform: profile.platform,
                    followerCount: profile.followerCount,
                    engagementRate: profile.engagementRate,
                    location: profile.location || undefined,
                    profilePhoto: profile.profilePhoto || undefined,
                    portfolioItems: []
                },
                score: totalScore,
                matchDetails: {
                    nicheMatch: nicheMatch === 1,
                    budgetMatch: true, // Can add budget matching logic
                    engagementScore: Math.min(1, profile.engagementRate / 100),
                    completenessScore,
                    reviewScore
                }
            };
        });
        // Sort by score descending and return top N
        return scored
            .sort((a, b) => b.score - a.score)
            .slice(0, topN);
    }
}
exports.RecommendationService = RecommendationService;
//# sourceMappingURL=recommendation.service.js.map