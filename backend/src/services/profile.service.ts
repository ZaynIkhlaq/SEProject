import { prisma } from '../index';
import { BrandProfile, BrandProfileUpdate, InfluencerProfile, InfluencerProfileUpdate, PortfolioItem, PortfolioItemCreate } from '../shared/types';

// Helper to convert null to undefined for compatibility
const normalizeBrandProfile = (profile: any): BrandProfile => ({
  ...profile,
  bio: profile.bio ?? undefined,
  website: profile.website ?? undefined,
  targetInfluencerType: profile.targetInfluencerType ?? undefined,
});

const normalizeInfluencerProfile = (profile: any): InfluencerProfile => ({
  ...profile,
  motto: profile.motto ?? undefined,
  bio: profile.bio ?? undefined,
  location: profile.location ?? undefined,
  profilePhoto: profile.profilePhoto ?? undefined,
});

export class ProfileService {
  // ===== BRAND PROFILES =====
  static async getBrandProfile(userId: string): Promise<BrandProfile> {
    const profile = await prisma.brandProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      throw new Error('Brand profile not found');
    }

    return normalizeBrandProfile(profile);
  }

  static async updateBrandProfile(userId: string, data: BrandProfileUpdate): Promise<BrandProfile> {
    const profile = await prisma.brandProfile.update({
      where: { userId },
      data
    });

    return normalizeBrandProfile(profile);
  }

  // ===== INFLUENCER PROFILES =====
  static async getInfluencerProfile(userId: string): Promise<InfluencerProfile> {
    const profile = await prisma.influencerProfile.findUnique({
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

  static async updateInfluencerProfile(userId: string, data: InfluencerProfileUpdate): Promise<InfluencerProfile> {
    const profile = await prisma.influencerProfile.update({
      where: { userId },
      data,
      include: {
        portfolioItems: true
      }
    });

    return normalizeInfluencerProfile(profile);
  }

  // ===== PORTFOLIO ITEMS (US-2.3) =====
  static async addPortfolioItem(userId: string, item: PortfolioItemCreate): Promise<PortfolioItem> {
    // Get influencer profile first
    const profile = await prisma.influencerProfile.findUnique({
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

    const portfolioItem = await prisma.portfolioItem.create({
      data: {
        influencerProfileId: profile.id,
        url: item.url,
        description: item.description
      }
    });

    return portfolioItem;
  }

  static async updatePortfolioItem(itemId: string, data: PortfolioItemCreate): Promise<PortfolioItem> {
    if (data.description.length > 200) {
      throw new Error('Description must be 200 characters or less');
    }

    const item = await prisma.portfolioItem.update({
      where: { id: itemId },
      data: {
        url: data.url,
        description: data.description
      }
    });

    return item;
  }

  static async deletePortfolioItem(itemId: string): Promise<void> {
    await prisma.portfolioItem.delete({
      where: { id: itemId }
    });
  }

  static async getPortfolioItems(userId: string): Promise<PortfolioItem[]> {
    const profile = await prisma.influencerProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      throw new Error('Influencer profile not found');
    }

    return await prisma.portfolioItem.findMany({
      where: { influencerProfileId: profile.id }
    });
  }

  // ===== PUBLIC PROFILES (US-2.4) =====
  static async getPublicBrandProfile(userId: string) {
    const user = await prisma.user.findUnique({
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

  static async getPublicInfluencerProfile(userId: string) {
    const user = await prisma.user.findUnique({
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
