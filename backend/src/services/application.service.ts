import { prisma } from '../index';
import { CampaignApplication, ApplicationStatus } from '../shared/types';

export class ApplicationService {
  // US-3.3: Apply to Campaign
  static async applyToCampaign(campaignId: string, influencerId: string): Promise<CampaignApplication> {
    // Check if campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Check if already applied
    const existing = await prisma.campaignApplication.findUnique({
      where: {
        campaignId_influencerId: { campaignId, influencerId }
      }
    });

    if (existing) {
      throw new Error('Already applied to this campaign');
    }

    const application = await prisma.campaignApplication.create({
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
      status: application.status as ApplicationStatus,
      createdAt: application.createdAt.toISOString()
    };
  }

  // Accept Application
  static async acceptApplication(applicationId: string, brandId: string): Promise<CampaignApplication> {
    const application = await prisma.campaignApplication.findUnique({
      where: { id: applicationId },
      include: { campaign: true }
    });

    if (!application) {
      throw new Error('Application not found');
    }

    if (application.campaign.brandId !== brandId) {
      throw new Error('Unauthorized');
    }

    const updated = await prisma.campaignApplication.update({
      where: { id: applicationId },
      data: { status: 'ACCEPTED' }
    });

    return {
      id: updated.id,
      campaignId: updated.campaignId,
      influencerId: updated.influencerId,
      status: updated.status as ApplicationStatus,
      createdAt: updated.createdAt.toISOString()
    };
  }

  // Reject Application
  static async rejectApplication(applicationId: string, brandId: string): Promise<CampaignApplication> {
    const application = await prisma.campaignApplication.findUnique({
      where: { id: applicationId },
      include: { campaign: true }
    });

    if (!application) {
      throw new Error('Application not found');
    }

    if (application.campaign.brandId !== brandId) {
      throw new Error('Unauthorized');
    }

    const updated = await prisma.campaignApplication.update({
      where: { id: applicationId },
      data: { status: 'REJECTED' }
    });

    return {
      id: updated.id,
      campaignId: updated.campaignId,
      influencerId: updated.influencerId,
      status: updated.status as ApplicationStatus,
      createdAt: updated.createdAt.toISOString()
    };
  }

  // Get Applications for Campaign (Brand view)
  static async getCampaignApplications(campaignId: string, brandId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.brandId !== brandId) {
      throw new Error('Unauthorized');
    }

    const applications = await prisma.campaignApplication.findMany({
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
  static async getInfluencerApplications(influencerId: string) {
    return await prisma.campaignApplication.findMany({
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
