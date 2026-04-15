export declare class AdminService {
    static getAllUsers(page?: number, pageSize?: number): Promise<{
        users: {
            id: string;
            email: string;
            role: string;
            isActive: boolean;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    static deactivateUser(userId: string): Promise<void>;
    static deleteUser(userId: string): Promise<void>;
    static getUserDetails(userId: string): Promise<{
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
        adminProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            permissions: string;
        } | null;
        postedCampaigns: {
            id: string;
            title: string;
        }[];
    } & {
        id: string;
        email: string;
        password: string;
        role: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
//# sourceMappingURL=admin.service.d.ts.map