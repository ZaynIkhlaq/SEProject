"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationService = void 0;
const index_1 = require("../index");
class ApplicationService {
    // US-3.3: Apply to Campaign
    static async applyToCampaign(campaignId, influencerId) {
        // Check if campaign exists
        const campaign = await index_1.prisma.campaign.findUnique({
            where: { id: campaignId }
        });
        if (!campaign) {
            throw new Error('Campaign not found');
        }
        // Check if already applied
        const existing = await index_1.prisma.campaignApplication.findUnique({
            where: {
                campaignId_influencerId: { campaignId, influencerId }
            }
        });
        if (existing) {
            throw new Error('Already applied to this campaign');
        }
        const application = await index_1.prisma.campaignApplication.create({
            data: {
                campaignId,
                influencerId,
                status: 'PENDING'
            }
        });
        return {
            id: application.id,
            campaignId: application.campaignId,
            influencerId: application.influencerId,
            status: application.status,
            createdAt: application.createdAt.toISOString()
        };
    }
    // Accept Application
    static async acceptApplication(applicationId, brandId) {
        const application = await index_1.prisma.campaignApplication.findUnique({
            where: { id: applicationId },
            include: { campaign: true }
        });
        if (!application) {
            throw new Error('Application not found');
        }
        if (application.campaign.brandId !== brandId) {
            throw new Error('Unauthorized');
        }
        const updated = await index_1.prisma.campaignApplication.update({
            where: { id: applicationId },
            data: { status: 'ACCEPTED' }
        });
        return {
            id: updated.id,
            campaignId: updated.campaignId,
            influencerId: updated.influencerId,
            status: updated.status,
            createdAt: updated.createdAt.toISOString()
        };
    }
    // Reject Application
    static async rejectApplication(applicationId, brandId) {
        const application = await index_1.prisma.campaignApplication.findUnique({
            where: { id: applicationId },
            include: { campaign: true }
        });
        if (!application) {
            throw new Error('Application not found');
        }
        if (application.campaign.brandId !== brandId) {
            throw new Error('Unauthorized');
        }
        const updated = await index_1.prisma.campaignApplication.update({
            where: { id: applicationId },
            data: { status: 'REJECTED' }
        });
        return {
            id: updated.id,
            campaignId: updated.campaignId,
            influencerId: updated.influencerId,
            status: updated.status,
            createdAt: updated.createdAt.toISOString()
        };
    }
    // Get Applications for Campaign (Brand view)
    static async getCampaignApplications(campaignId, brandId) {
        const campaign = await index_1.prisma.campaign.findUnique({
            where: { id: campaignId }
        });
        if (!campaign) {
            throw new Error('Campaign not found');
        }
        if (campaign.brandId !== brandId) {
            throw new Error('Unauthorized');
        }
        const applications = await index_1.prisma.campaignApplication.findMany({
            where: { campaignId },
            include: {
                influencer: {
                    select: {
                        id: true,
                        email: true,
                        influencerProfile: true
                    }
                }
            }
        });
        return applications;
    }
    // Get Influencer's Applications
    static async getInfluencerApplications(influencerId) {
        return await index_1.prisma.campaignApplication.findMany({
            where: { influencerId },
            include: {
                campaign: {
                    select: {
                        id: true,
                        title: true,
                        budgetTier: true,
                        requiredNiche: true,
                        status: true
                    }
                }
            }
        });
    }
}
exports.ApplicationService = ApplicationService;
//# sourceMappingURL=application.service.js.map