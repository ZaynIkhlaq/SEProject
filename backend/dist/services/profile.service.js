"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const index_1 = require("../index");
// Helper to convert null to undefined for compatibility
const normalizeBrandProfile = (profile) => ({
    ...profile,
    bio: profile.bio ?? undefined,
    website: profile.website ?? undefined,
    targetInfluencerType: profile.targetInfluencerType ?? undefined,
});
const normalizeInfluencerProfile = (profile) => ({
    ...profile,
    motto: profile.motto ?? undefined,
    bio: profile.bio ?? undefined,
    location: profile.location ?? undefined,
    profilePhoto: profile.profilePhoto ?? undefined,
});
class ProfileService {
    // ===== BRAND PROFILES =====
    static async getBrandProfile(userId) {
        const profile = await index_1.prisma.brandProfile.findUnique({
            where: { userId }
        });
        if (!profile) {
            throw new Error('Brand profile not found');
        }
        return normalizeBrandProfile(profile);
    }
    static async updateBrandProfile(userId, data) {
        const profile = await index_1.prisma.brandProfile.update({
            where: { userId },
            data
        });
        return normalizeBrandProfile(profile);
    }
    // ===== INFLUENCER PROFILES =====
    static async getInfluencerProfile(userId) {
        const profile = await index_1.prisma.influencerProfile.findUnique({
            where: { userId },
            include: {
                portfolioItems: true
            }
        });
        if (!profile) {
            throw new Error('Influencer profile not found');
        }
        return normalizeInfluencerProfile(profile);
    }
    static async updateInfluencerProfile(userId, data) {
        const profile = await index_1.prisma.influencerProfile.update({
            where: { userId },
            data,
            include: {
                portfolioItems: true
            }
        });
        return normalizeInfluencerProfile(profile);
    }
    // ===== PORTFOLIO ITEMS (US-2.3) =====
    static async addPortfolioItem(userId, item) {
        // Get influencer profile first
        const profile = await index_1.prisma.influencerProfile.findUnique({
            where: { userId },
            include: { portfolioItems: true }
        });
        if (!profile) {
            throw new Error('Influencer profile not found');
        }
        // Check max 10 items
        if (profile.portfolioItems.length >= 10) {
            throw new Error('Maximum 10 portfolio items allowed');
        }
        // Validate description length
        if (item.description.length > 200) {
            throw new Error('Description must be 200 characters or less');
        }
        const portfolioItem = await index_1.prisma.portfolioItem.create({
            data: {
                influencerProfileId: profile.id,
                url: item.url,
                description: item.description
            }
        });
        return portfolioItem;
    }
    static async updatePortfolioItem(itemId, data) {
        if (data.description.length > 200) {
            throw new Error('Description must be 200 characters or less');
        }
        const item = await index_1.prisma.portfolioItem.update({
            where: { id: itemId },
            data: {
                url: data.url,
                description: data.description
            }
        });
        return item;
    }
    static async deletePortfolioItem(itemId) {
        await index_1.prisma.portfolioItem.delete({
            where: { id: itemId }
        });
    }
    static async getPortfolioItems(userId) {
        const profile = await index_1.prisma.influencerProfile.findUnique({
            where: { userId }
        });
        if (!profile) {
            throw new Error('Influencer profile not found');
        }
        return await index_1.prisma.portfolioItem.findMany({
            where: { influencerProfileId: profile.id }
        });
    }
    // ===== PUBLIC PROFILES (US-2.4) =====
    static async getPublicBrandProfile(userId) {
        const user = await index_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                brandProfile: true,
                receivedReviews: {
                    select: {
                        id: true,
                        rating: true,
                        comment: true,
                        reviewer: { select: { email: true } }
                    }
                }
            }
        });
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    static async getPublicInfluencerProfile(userId) {
        const user = await index_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                influencerProfile: {
                    include: {
                        portfolioItems: true
                    }
                },
                receivedReviews: {
                    select: {
                        id: true,
                        rating: true,
                        comment: true,
                        reviewer: { select: { email: true } }
                    }
                }
            }
        });
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
}
exports.ProfileService = ProfileService;
//# sourceMappingURL=profile.service.js.map