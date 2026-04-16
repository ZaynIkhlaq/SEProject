import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo brand
  const hashedPassword = await bcrypt.hash('password123', 10);

  const brand = await prisma.user.upsert({
    where: { email: 'brand@demo.com' },
    update: {},
    create: {
      email: 'brand@demo.com',
      password: hashedPassword,
      role: 'BRAND',
      isActive: true,
      brandProfile: {
        create: {
          companyName: 'Tech Startup Inc.',
          industry: 'Technology',
          bio: 'Innovative tech company looking for influencers',
          website: 'https://techstartup.com',
          budgetTier: 'TIER_50K_200K',
          targetInfluencerType: 'Tech & Innovation'
        }
      }
    }
  });

  console.log('✅ Created brand:', brand.email);

  // Create demo influencer
  const influencer = await prisma.user.upsert({
    where: { email: 'influencer@demo.com' },
    update: {},
    create: {
      email: 'influencer@demo.com',
      password: hashedPassword,
      role: 'INFLUENCER',
      isActive: true,
      influencerProfile: {
        create: {
          motto: 'Making tech accessible to everyone',
          bio: 'Tech enthusiast and content creator',
          niche: 'Tech & Innovation',
          platform: 'Instagram',
          followerCount: 50000,
          engagementRate: 4.5,
          location: 'Karachi, Pakistan',
          portfolioItems: {
            create: [
              {
                url: 'https://instagram.com/p/tech1',
                description: 'Product launch coverage for leading tech brand'
              },
              {
                url: 'https://instagram.com/p/tech2',
                description: 'Tutorial on latest gadgets and apps'
              }
            ]
          }
        }
      }
    }
  });

  console.log('✅ Created influencer:', influencer.email);

  // Create multiple demo campaigns with different niches and products
  const campaigns = await Promise.all([
    // Campaign 1: Tech & Innovation
    prisma.campaign.create({
      data: {
        brandId: brand.id,
        title: 'Product Launch Campaign',
        productService: 'New Smartphone',
        requiredNiche: 'Tech & Innovation',
        budgetTier: 'TIER_50K_200K',
        influencersNeeded: 5,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        description: 'We are looking for tech influencers to promote our latest smartphone launch with high-quality content',
        status: 'OPEN'
      }
    }),
    // Campaign 2: Fashion & Lifestyle
    prisma.campaign.create({
      data: {
        brandId: brand.id,
        title: 'Summer Fashion Collection',
        productService: 'Fashion & Apparel',
        requiredNiche: 'Fashion & Lifestyle',
        budgetTier: 'TIER_10K_50K',
        influencersNeeded: 8,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        description: 'Launch our new summer clothing line with fashion influencers and style content creators',
        status: 'OPEN'
      }
    }),
    // Campaign 3: Beauty & Wellness
    prisma.campaign.create({
      data: {
        brandId: brand.id,
        title: 'Natural Skincare Range',
        productService: 'Organic Beauty Products',
        requiredNiche: 'Beauty & Wellness',
        budgetTier: 'TIER_50K_200K',
        influencersNeeded: 6,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        description: 'Promote our new natural skincare line through beauty and wellness influencers',
        status: 'OPEN'
      }
    }),
    // Campaign 4: Fitness & Health
    prisma.campaign.create({
      data: {
        brandId: brand.id,
        title: 'Fitness Equipment Brand',
        productService: 'Home Gym Equipment',
        requiredNiche: 'Fitness & Health',
        budgetTier: 'TIER_10K_50K',
        influencersNeeded: 4,
        deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        description: 'Partner with fitness influencers to showcase our innovative home gym equipment',
        status: 'OPEN'
      }
    }),
    // Campaign 5: Food & Beverage
    prisma.campaign.create({
      data: {
        brandId: brand.id,
        title: 'Healthy Beverage Launch',
        productService: 'Energy Drinks',
        requiredNiche: 'Food & Beverage',
        budgetTier: 'TIER_50K_200K',
        influencersNeeded: 7,
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        description: 'Launch our new line of organic energy drinks with food and lifestyle content creators',
        status: 'OPEN'
      }
    }),
    // Campaign 6: Gaming & Entertainment (completed campaign)
    prisma.campaign.create({
      data: {
        brandId: brand.id,
        title: 'Gaming Console Sponsorship',
        productService: 'Gaming Hardware',
        requiredNiche: 'Gaming & Entertainment',
        budgetTier: 'TIER_200K_PLUS',
        influencersNeeded: 10,
        deadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        description: 'A completed campaign sponsoring gaming influencers for console launch',
        status: 'COMPLETED'
      }
    })
  ]);

  console.log(`✅ Created ${campaigns.length} campaigns`);

  // Create application for the first campaign
  const application = await prisma.campaignApplication.create({
    data: {
      campaignId: campaigns[0].id,
      influencerId: influencer.id,
      status: 'ACCEPTED'
    }
  });

  console.log('✅ Created application');

  // Create messages
  const message1 = await prisma.message.create({
    data: {
      campaignId: campaigns[0].id,
      senderId: brand.id,
      receiverId: influencer.id,
      text: 'Hi! We love your content. Would you be interested in promoting our new phone?',
      isRead: false
    }
  });

  const message2 = await prisma.message.create({
    data: {
      campaignId: campaigns[0].id,
      senderId: influencer.id,
      receiverId: brand.id,
      text: 'Thanks for reaching out! I\'m definitely interested. What\'s the timeline and deliverables?',
      isRead: true
    }
  });

  console.log('✅ Created messages');

  // Create application and review on the completed campaign
  const completedApplication = await prisma.campaignApplication.create({
    data: {
      campaignId: campaigns[5].id,
      influencerId: influencer.id,
      status: 'ACCEPTED'
    }
  });

  const review = await prisma.review.create({
    data: {
      campaignId: campaigns[5].id,
      reviewerId: brand.id,
      reviewedUserId: influencer.id,
      rating: 5,
      comment: 'Excellent work! The influencer delivered high-quality content and was very professional.'
    }
  });

  console.log('✅ Created review on completed campaign');

  console.log('✨ Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
