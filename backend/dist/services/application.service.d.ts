import { CampaignApplication } from '../shared/types';
export declare class ApplicationService {
    static applyToCampaign(campaignId: string, influencerId: string): Promise<CampaignApplication>;
    static acceptApplication(applicationId: string, brandId: string): Promise<CampaignApplication>;
    static rejectApplication(applicationId: string, brandId: string): Promise<CampaignApplication>;
    static getCampaignApplications(campaignId: string, brandId: string): Promise<({
        influencer: {
            id: string;
            email: string;
            influencerProfile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                bio: string | null;
                motto: string | null;
                niche: string;
                platform: string;
                followerCount: number;
                engagementRate: number;
                location: string | null;
                profilePhoto: string | null;
                userId: string;
            } | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        campaignId: string;
        status: string;
        influencerId: string;
    })[]>;
    static getInfluencerApplications(influencerId: string): Promise<({
        campaign: {
            id: string;
            budgetTier: string;
            title: string;
            requiredNiche: string;
            status: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        campaignId: string;
        status: string;
        influencerId: string;
    })[]>;
}
//# sourceMappingURL=application.service.d.ts.map