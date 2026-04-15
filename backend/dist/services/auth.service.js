"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../index");
// Validate JWT secrets at startup
const JWT_SECRET = process.env.JWT_SECRET || '';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '';
if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error('FATAL: JWT_SECRET and JWT_REFRESH_SECRET must be set in environment variables');
}
// Password validation function
function validatePassword(password) {
    if (!password || password.length < 8) {
        return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
        return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
        return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
        return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*]/.test(password)) {
        return 'Password must contain at least one special character (!@#$%^&*)';
    }
    return null;
}
class AuthService {
    static async registerBrand(data) {
        // Validate password
        const passwordError = validatePassword(data.password);
        if (passwordError) {
            throw new Error(passwordError);
        }
        // Check if user exists
        const existingUser = await index_1.prisma.user.findUnique({
            where: { email: data.email }
        });
        if (existingUser) {
            throw new Error('Email already registered');
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
        // Create user and brand profile
        const user = await index_1.prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                role: 'BRAND',
                isActive: true,
                brandProfile: {
                    create: {
                        companyName: data.companyName,
                        industry: data.industry,
                        budgetTier: data.budgetTier,
                        targetInfluencerType: data.targetInfluencerType
                    }
                }
            },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true
            }
        });
        const accessToken = this.generateAccessToken(user.id, user.email, user.role);
        const refreshToken = this.generateRefreshToken(user.id);
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt.toISOString()
            }
        };
    }
    static async registerInfluencer(data) {
        // Validate password
        const passwordError = validatePassword(data.password);
        if (passwordError) {
            throw new Error(passwordError);
        }
        const existingUser = await index_1.prisma.user.findUnique({
            where: { email: data.email }
        });
        if (existingUser) {
            throw new Error('Email already registered');
        }
        const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
        const user = await index_1.prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                role: 'INFLUENCER',
                isActive: true,
                influencerProfile: {
                    create: {
                        niche: data.niche,
                        platform: data.platform,
                        followerCount: data.followerCount,
                        engagementRate: data.engagementRate
                    }
                }
            },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true
            }
        });
        const accessToken = this.generateAccessToken(user.id, user.email, user.role);
        const refreshToken = this.generateRefreshToken(user.id);
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt.toISOString()
            }
        };
    }
    static async login(email, password) {
        const user = await index_1.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                role: true,
                isActive: true,
                createdAt: true
            }
        });
        if (!user) {
            throw new Error('Invalid email or password');
        }
        if (!user.isActive) {
            throw new Error('Account has been deactivated');
        }
        const passwordMatch = await bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch) {
            throw new Error('Invalid email or password');
        }
        const accessToken = this.generateAccessToken(user.id, user.email, user.role);
        const refreshToken = this.generateRefreshToken(user.id);
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt.toISOString()
            }
        };
    }
    static async refreshToken(refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, JWT_REFRESH_SECRET);
            const user = await index_1.prisma.user.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    isActive: true
                }
            });
            if (!user || !user.isActive) {
                throw new Error('User not found or inactive');
            }
            const accessToken = this.generateAccessToken(user.id, user.email, user.role);
            return { accessToken };
        }
        catch (error) {
            throw new Error('Invalid refresh token');
        }
    }
    static generateAccessToken(id, email, role) {
        return jsonwebtoken_1.default.sign({ id, email, role }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY || '15m' });
    }
    static generateRefreshToken(id) {
        return jsonwebtoken_1.default.sign({ id }, JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map