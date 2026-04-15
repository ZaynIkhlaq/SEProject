import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { RegisterBrandRequest, RegisterInfluencerRequest, AuthResponse, User } from '../shared/types';

// Validate JWT secrets at startup
const JWT_SECRET: string = process.env.JWT_SECRET || '';
const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || '';

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('FATAL: JWT_SECRET and JWT_REFRESH_SECRET must be set in environment variables');
}

// Password validation function
function validatePassword(password: string): string | null {
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

export class AuthService {
  static async registerBrand(data: RegisterBrandRequest): Promise<AuthResponse> {
    // Validate password
    const passwordError = validatePassword(data.password);
    if (passwordError) {
      throw new Error(passwordError);
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user and brand profile
    const user = await prisma.user.create({
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
        role: user.role as any,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString()
      }
    };
  }

  static async registerInfluencer(data: RegisterInfluencerRequest): Promise<AuthResponse> {
    // Validate password
    const passwordError = validatePassword(data.password);
    if (passwordError) {
      throw new Error(passwordError);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
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
        role: user.role as any,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString()
      }
    };
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
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

    const passwordMatch = await bcrypt.compare(password, user.password);
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
        role: user.role as any,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString()
      }
    };
  }

  static async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
      
      const user = await prisma.user.findUnique({
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
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  private static generateAccessToken(id: string, email: string, role: string): string {
    return jwt.sign(
      { id, email, role },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '15m' } as any
    );
  }

  private static generateRefreshToken(id: string): string {
    return jwt.sign(
      { id },
      JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' } as any
    );
  }
}
