import { prisma } from '../index';
import { Campaign, CreateCampaignRequest, UpdateCampaignRequest, CampaignStatus } from '../shared/types';

export class CampaignService {
  // US-3.1: Post a Campaign
  static async createCampaign(brandId: string, data: CreateCampaignRequest): Promise<Campaign> {
    const campaign = await prisma.campaign.create({
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
  static async updateCampaign(campaignId: string, brandId: string, data: UpdateCampaignRequest): Promise<Campaign> {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.brandId !== brandId) {
      throw new Error('Unauthorized: only campaign creator can edit');
    }

    const updated = await prisma.campaign.update({
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
  static async closeCampaign(campaignId: string, brandId: string): Promise<Campaign> {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.brandId !== brandId) {
      throw new Error('Unauthorized');
    }

    const updated = await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'CLOSED' }
    });

    return this.formatCampaign(updated);
  }

  // US-3.3: Browse Campaigns
  static async browseActiveCampaigns(filters?: { niche?: string; budgetTier?: string; platform?: string }) {
    const where: any = {
      status: { in: ['OPEN', 'IN_PROGRESS'] }
    };

    if (filters?.niche) {
      where.requiredNiche = { contains: filters.niche, mode: 'insensitive' };
    }

    if (filters?.budgetTier) {
      where.budgetTier = filters.budgetTier;
    }

    const campaigns = await prisma.campaign.findMany({
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
  static async getCampaignById(campaignId: string) {
    const campaign = await prisma.campaign.findUnique({
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
  static async getCampaignStatus(campaignId: string): Promise<{ status: CampaignStatus; approvedInfluencers: number }> {
    const campaign = await prisma.campaign.findUnique({
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
      status: campaign.status as CampaignStatus,
      approvedInfluencers: campaign.applications.length
    };
  }

  private static formatCampaign(campaign: any) {
    return {
      ...campaign,
      createdAt: campaign.createdAt.toISOString(),
      updatedAt: campaign.updatedAt.toISOString(),
      deadline: campaign.deadline.toISOString()
    };
  }
}
