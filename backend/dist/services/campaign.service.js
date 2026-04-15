"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignService = void 0;
const index_1 = require("../index");
const VALID_NICHES = ['Fashion', 'Beauty', 'Tech', 'Fitness', 'Food', 'Travel', 'Lifestyle', 'Gaming'];
const VALID_BUDGETS = ['TIER_10K_50K', 'TIER_50K_200K', 'TIER_200K_PLUS'];
class CampaignService {
    // US-3.1: Post a Campaign
    static async createCampaign(brandId, data) {
        const campaign = await index_1.prisma.campaign.create({
            data: {
                brandId,
                title: data.title,
                productService: data.productService,
                requiredNiche: data.requiredNiche,
                budgetTier: data.budgetTier,
                influencersNeeded: data.influencersNeeded,
                deadline: new Date(data.deadline),
                description: data.description,
                status: 'OPEN'
            }
        });
        return this.formatCampaign(campaign);
    }
    // US-3.2: Edit Campaign
    static async updateCampaign(campaignId, brandId, data) {
        const campaign = await index_1.prisma.campaign.findUnique({
            where: { id: campaignId }
        });
        if (!campaign) {
            throw new Error('Campaign not found');
        }
        if (campaign.brandId !== brandId) {
            throw new Error('Unauthorized: only campaign creator can edit');
        }
        const updated = await index_1.prisma.campaign.update({
            where: { id: campaignId },
            data: {
                title: data.title ?? undefined,
                productService: data.productService ?? undefined,
                requiredNiche: data.requiredNiche ?? undefined,
                budgetTier: data.budgetTier ?? undefined,
                influencersNeeded: data.influencersNeeded ?? undefined,
                deadline: data.deadline ? new Date(data.deadline) : undefined,
                description: data.description ?? undefined,
                status: data.status ?? undefined
            }
        });
        return this.formatCampaign(updated);
    }
    // US-3.2: Close Campaign
    static async closeCampaign(campaignId, brandId) {
        const campaign = await index_1.prisma.campaign.findUnique({
            where: { id: campaignId }
        });
        if (!campaign) {
            throw new Error('Campaign not found');
        }
        if (campaign.brandId !== brandId) {
            throw new Error('Unauthorized');
        }
        const updated = await index_1.prisma.campaign.update({
            where: { id: campaignId },
            data: { status: 'CLOSED' }
        });
        return this.formatCampaign(updated);
    }
    // US-3.3: Browse Campaigns
    static async browseActiveCampaigns(filters) {
        const where = {
            status: { in: ['OPEN', 'IN_PROGRESS'] }
        };
        if (filters?.niche) {
            if (!VALID_NICHES.includes(filters.niche)) {
                throw new Error(`Invalid niche. Must be one of: ${VALID_NICHES.join(', ')}`);
            }
            where.requiredNiche = filters.niche;
        }
        if (filters?.budgetTier) {
            if (!VALID_BUDGETS.includes(filters.budgetTier)) {
                throw new Error('Invalid budget tier');
            }
            where.budgetTier = filters.budgetTier;
        }
        const campaigns = await index_1.prisma.campaign.findMany({
            where,
            include: {
                brand: {
                    select: { id: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return campaigns.map(c => this.formatCampaign(c));
    }
    // Get Campaign by ID
    static async getCampaignById(campaignId) {
        const campaign = await index_1.prisma.campaign.findUnique({
            where: { id: campaignId },
            include: {
                brand: {
                    select: { id: true, email: true, brandProfile: true }
                },
                applications: {
                    select: { id: true, status: true, influencer: { select: { id: true, email: true } } }
                }
            }
        });
        if (!campaign) {
            throw new Error('Campaign not found');
        }
        return campaign;
    }
    // US-3.4: Get Campaign Status
    static async getCampaignStatus(campaignId) {
        const campaign = await index_1.prisma.campaign.findUnique({
            where: { id: campaignId },
            select: {
                status: true,
                applications: {
                    where: { status: 'ACCEPTED' },
                    select: { id: true }
                }
            }
        });
        if (!campaign) {
            throw new Error('Campaign not found');
        }
        return {
            status: campaign.status,
            approvedInfluencers: campaign.applications.length
        };
    }
    static formatCampaign(campaign) {
        return {
            ...campaign,
            createdAt: campaign.createdAt.toISOString(),
            updatedAt: campaign.updatedAt.toISOString(),
            deadline: campaign.deadline.toISOString()
        };
    }
}
exports.CampaignService = CampaignService;
//# sourceMappingURL=campaign.service.js.map