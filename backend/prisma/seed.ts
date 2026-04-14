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

  // Create demo campaign
  const campaign = await prisma.campaign.create({
    data: {
      brandId: brand.id,
      title: 'Product Launch Campaign',
      productService: 'New Smartphone',
      requiredNiche: 'Tech & Innovation',
      budgetTier: 'TIER_50K_200K',
      influencersNeeded: 5,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      description: 'We are looking for tech influencers to promote our latest smartphone launch',
      status: 'OPEN'
    }
  });

  console.log('✅ Created campaign:', campaign.title);

  // Create application
  const application = await prisma.campaignApplication.create({
    data: {
      campaignId: campaign.id,
      influencerId: influencer.id,
      status: 'ACCEPTED'
    }
  });

  console.log('✅ Created application');

  // Create messages
  const message1 = await prisma.message.create({
    data: {
      campaignId: campaign.id,
      senderId: brand.id,
      receiverId: influencer.id,
      text: 'Hi! We love your content. Would you be interested in promoting our new phone?',
      isRead: false
    }
  });

  const message2 = await prisma.message.create({
    data: {
      campaignId: campaign.id,
      senderId: influencer.id,
      receiverId: brand.id,
      text: 'Thanks for reaching out! I\'m definitely interested. What\'s the timeline and deliverables?',
      isRead: true
    }
  });

  console.log('✅ Created messages');

  // Create review
  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { status: 'COMPLETED' }
  });

  const review = await prisma.review.create({
    data: {
      campaignId: campaign.id,
      reviewerId: brand.id,
      reviewedUserId: influencer.id,
      rating: 5,
      comment: 'Excellent work! The influencer delivered high-quality content and was very professional.'
    }
  });

  console.log('✅ Created review');

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
