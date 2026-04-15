"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const index_1 = require("../index");
class AdminService {
    // US-1.5: Get All Users (Paginated)
    static async getAllUsers(page = 1, pageSize = 20) {
        const skip = (page - 1) * pageSize;
        const [users, total] = await Promise.all([
            index_1.prisma.user.findMany({
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
            index_1.prisma.user.count()
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
    static async deactivateUser(userId) {
        const user = await index_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new Error('User not found');
        }
        await index_1.prisma.user.update({
            where: { id: userId },
            data: { isActive: false }
        });
    }
    // US-1.5: Delete User (Permanent Removal)
    static async deleteUser(userId) {
        const user = await index_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new Error('User not found');
        }
        // Delete all related data cascades automatically due to schema
        await index_1.prisma.user.delete({
            where: { id: userId }
        });
    }
    // Get User Details
    static async getUserDetails(userId) {
        const user = await index_1.prisma.user.findUnique({
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
exports.AdminService = AdminService;
//# sourceMappingURL=admin.service.js.map