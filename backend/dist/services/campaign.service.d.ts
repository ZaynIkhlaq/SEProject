import { Campaign, CreateCampaignRequest, UpdateCampaignRequest, CampaignStatus } from '../shared/types';
export declare class CampaignService {
    static createCampaign(brandId: string, data: CreateCampaignRequest): Promise<Campaign>;
    static updateCampaign(campaignId: string, brandId: string, data: UpdateCampaignRequest): Promise<Campaign>;
    static closeCampaign(campaignId: string, brandId: string): Promise<Campaign>;
    static browseActiveCampaigns(filters?: {
        niche?: string;
        budgetTier?: string;
        platform?: string;
    }): Promise<any[]>;
    static getCampaignById(campaignId: string): Promise<{
        brand: {
            id: string;
            email: string;
            brandProfile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                companyName: string;
                industry: string;
                bio: string | null;
                website: string | null;
                budgetTier: string;
                targetInfluencerType: string | null;
                userId: string;
            } | null;
        };
        applications: {
            id: string;
            status: string;
            influencer: {
                id: string;
                email: string;
            };
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        budgetTier: string;
        description: string;
        title: string;
        productService: string;
        requiredNiche: string;
        influencersNeeded: number;
        deadline: Date;
        status: string;
        brandId: string;
    }>;
    static getCampaignStatus(campaignId: string): Promise<{
        status: CampaignStatus;
        approvedInfluencers: number;
    }>;
    private static formatCampaign;
}
//# sourceMappingURL=campaign.service.d.ts.map