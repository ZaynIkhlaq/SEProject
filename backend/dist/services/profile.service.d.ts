import { BrandProfile, BrandProfileUpdate, InfluencerProfile, InfluencerProfileUpdate, PortfolioItem, PortfolioItemCreate } from '../shared/types';
export declare class ProfileService {
    static getBrandProfile(userId: string): Promise<BrandProfile>;
    static updateBrandProfile(userId: string, data: BrandProfileUpdate): Promise<BrandProfile>;
    static getInfluencerProfile(userId: string): Promise<InfluencerProfile>;
    static updateInfluencerProfile(userId: string, data: InfluencerProfileUpdate): Promise<InfluencerProfile>;
    static addPortfolioItem(userId: string, item: PortfolioItemCreate): Promise<PortfolioItem>;
    static updatePortfolioItem(itemId: string, data: PortfolioItemCreate): Promise<PortfolioItem>;
    static deletePortfolioItem(itemId: string): Promise<void>;
    static getPortfolioItems(userId: string): Promise<PortfolioItem[]>;
    static getPublicBrandProfile(userId: string): Promise<{
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
        receivedReviews: {
            id: string;
            rating: number;
            comment: string;
            reviewer: {
                email: string;
            };
        }[];
    }>;
    static getPublicInfluencerProfile(userId: string): Promise<{
        id: string;
        email: string;
        influencerProfile: ({
            portfolioItems: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                influencerProfileId: string;
                url: string;
                description: string;
            }[];
        } & {
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
        }) | null;
        receivedReviews: {
            id: string;
            rating: number;
            comment: string;
            reviewer: {
                email: string;
            };
        }[];
    }>;
}
//# sourceMappingURL=profile.service.d.ts.map