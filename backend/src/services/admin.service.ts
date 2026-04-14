import { prisma } from '../index';

export class AdminService {
  // US-1.5: Get All Users (Paginated)
  static async getAllUsers(page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: pageSize,
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count()
    ]);

    return {
      users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  // US-1.5: Deactivate User
  static async deactivateUser(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    });
  }

  // US-1.5: Delete User (Permanent Removal)
  static async deleteUser(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Delete all related data cascades automatically due to schema
    await prisma.user.delete({
      where: { id: userId }
    });
  }

  // Get User Details
  static async getUserDetails(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        brandProfile: true,
        influencerProfile: true,
        adminProfile: true,
        postedCampaigns: { select: { id: true, title: true } }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
