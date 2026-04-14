// shared/types.ts - Shared TypeScript types for frontend & backend

// ===== USER & AUTH =====
export type UserRole = 'BRAND' | 'INFLUENCER' | 'ADMIN' | 'USER';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface RegisterBrandRequest {
  email: string;
  password: string;
  companyName: string;
  industry: string;
  budgetTier: BudgetTier;
  targetInfluencerType?: string;
}

export interface RegisterInfluencerRequest {
  email: string;
  password: string;
  niche: string;
  platform: string;
  followerCount: number;
  engagementRate: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ===== PROFILES =====
export type BudgetTier = 'TIER_10K_50K' | 'TIER_50K_200K' | 'TIER_200K_PLUS';

export interface BrandProfile {
  id: string;
  userId: string;
  companyName: string;
  industry: string;
  bio?: string;
  website?: string;
  budgetTier: BudgetTier;
  targetInfluencerType?: string;
}

export interface BrandProfileUpdate {
  companyName?: string;
  industry?: string;
  bio?: string;
  website?: string;
  budgetTier?: BudgetTier;
  targetInfluencerType?: string;
}

export interface InfluencerProfile {
  id: string;
  userId: string;
  motto?: string;
  bio?: string;
  niche: string;
  platform: string;
  followerCount: number;
  engagementRate: number;
  location?: string;
  profilePhoto?: string;
  portfolioItems?: PortfolioItem[];
}

export interface InfluencerProfileUpdate {
  motto?: string;
  bio?: string;
  niche?: string;
  platform?: string;
  followerCount?: number;
  engagementRate?: number;
  location?: string;
  profilePhoto?: string;
}

export interface PortfolioItem {
  id: string;
  influencerProfileId: string;
  url: string;
  description: string;
}

export interface PortfolioItemCreate {
  url: string;
  description: string;
}

// ===== CAMPAIGNS =====
export type CampaignStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED';

export interface Campaign {
  id: string;
  brandId: string;
  title: string;
  productService: string;
  requiredNiche: string;
  budgetTier: BudgetTier;
  influencersNeeded: number;
  deadline: string;
  description: string;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignRequest {
  title: string;
  productService: string;
  requiredNiche: string;
  budgetTier: BudgetTier;
  influencersNeeded: number;
  deadline: string;
  description: string;
}

export interface UpdateCampaignRequest {
  title?: string;
  productService?: string;
  requiredNiche?: string;
  budgetTier?: BudgetTier;
  influencersNeeded?: number;
  deadline?: string;
  description?: string;
  status?: CampaignStatus;
}

// ===== CAMPAIGN APPLICATIONS =====
export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface CampaignApplication {
  id: string;
  campaignId: string;
  influencerId: string;
  status: ApplicationStatus;
  createdAt: string;
}

// ===== MESSAGING =====
export interface Message {
  id: string;
  campaignId: string;
  senderId: string;
  receiverId: string;
  text: string;
  isRead: boolean;
  createdAt: string;
}

export interface MessageThread {
  campaignId: string;
  otherPartyId: string;
  otherPartyName: string;
  lastMessage?: Message;
  unreadCount: number;
}

export interface SendMessageRequest {
  campaignId: string;
  receiverId: string;
  text: string;
}

// ===== REVIEWS & RATINGS =====
export interface Review {
  id: string;
  campaignId: string;
  reviewerId: string;
  reviewedUserId: string;
  rating: number;
  comment: string;
  isReported: boolean;
  reportReason?: string;
  createdAt: string;
}

export interface CreateReviewRequest {
  campaignId: string;
  reviewedUserId: string;
  rating: number;
  comment: string;
}

export interface ReportReviewRequest {
  reason: string;
}

// ===== RECOMMENDATIONS =====
export interface RecommendedInfluencer {
  id: string;
  profile: InfluencerProfile;
  score: number;
  matchDetails: {
    nicheMatch: boolean;
    budgetMatch: boolean;
    engagementScore: number;
    completenessScore: number;
    reviewScore: number;
  };
}

export interface RecommendationRequest {
  campaignId: string;
  topN?: number; // default 15
}

// ===== ADMIN =====
export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface AdminUserListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
}

// ===== API RESPONSES =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ValidationError {
  field: string;
  message: string;
}
