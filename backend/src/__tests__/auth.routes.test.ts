import express from 'express';
import request from 'supertest';
import authRoutes from '../routes/auth.routes';
import { AuthService } from '../services/auth.service';

jest.mock('../services/auth.service', () => ({
  AuthService: {
    registerBrand: jest.fn(),
    registerInfluencer: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
  },
}));

const mockedAuthService = AuthService as jest.Mocked<typeof AuthService>;

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', authRoutes);
  return app;
};

describe('Auth Routes - User Story Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Story 1: Brand Registration', () => {
    it('should accept all required brand registration fields and return brand user details for dashboard access', async () => {
      mockedAuthService.registerBrand.mockResolvedValue({
        accessToken: 'brand-access-token',
        refreshToken: 'brand-refresh-token',
        user: {
          id: 'brand-1',
          email: 'owner@acme.com',
          role: 'BRAND',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      });

      const app = createTestApp();
      const response = await request(app)
        .post('/api/v1/auth/register/brand')
        .send({
          email: 'owner@acme.com',
          password: 'StrongPass1!',
          companyName: 'Acme Foods',
          industry: 'Food & Beverage',
          budgetTier: 'TIER_10K_50K',
          targetInfluencerType: 'Micro Influencers',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('BRAND');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(mockedAuthService.registerBrand).toHaveBeenCalledWith({
        email: 'owner@acme.com',
        password: 'StrongPass1!',
        companyName: 'Acme Foods',
        industry: 'Food & Beverage',
        budgetTier: 'TIER_10K_50K',
        targetInfluencerType: 'Micro Influencers',
      });
    });

    it('should reject brand registration when a required field is missing', async () => {
      const app = createTestApp();
      const response = await request(app)
        .post('/api/v1/auth/register/brand')
        .send({
          email: 'owner@acme.com',
          password: 'StrongPass1!',
          companyName: 'Acme Foods',
          industry: 'Food & Beverage',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
      expect(mockedAuthService.registerBrand).not.toHaveBeenCalled();
    });
  });

  describe('User Story 2: Influencer Registration', () => {
    it('should use influencer registration endpoint and return influencer user details for dashboard access', async () => {
      mockedAuthService.registerInfluencer.mockResolvedValue({
        accessToken: 'influencer-access-token',
        refreshToken: 'influencer-refresh-token',
        user: {
          id: 'influencer-1',
          email: 'creator@social.com',
          role: 'INFLUENCER',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      });

      const app = createTestApp();
      const response = await request(app)
        .post('/api/v1/auth/register/influencer')
        .send({
          email: 'creator@social.com',
          password: 'StrongPass1!',
          niche: 'Fashion',
          platform: 'Instagram',
          followerCount: 12000,
          engagementRate: 5.8,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('INFLUENCER');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(mockedAuthService.registerInfluencer).toHaveBeenCalledWith({
        email: 'creator@social.com',
        password: 'StrongPass1!',
        niche: 'Fashion',
        platform: 'Instagram',
        followerCount: 12000,
        engagementRate: 5.8,
      });
    });

    it('should keep influencer registration separate from brand registration flow', async () => {
      mockedAuthService.registerInfluencer.mockResolvedValue({
        accessToken: 'influencer-access-token',
        refreshToken: 'influencer-refresh-token',
        user: {
          id: 'influencer-2',
          email: 'separate@flow.com',
          role: 'INFLUENCER',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      });

      const app = createTestApp();
      await request(app)
        .post('/api/v1/auth/register/influencer')
        .send({
          email: 'separate@flow.com',
          password: 'StrongPass1!',
          niche: 'Tech',
          platform: 'YouTube',
          followerCount: 45000,
          engagementRate: 3.2,
        });

      expect(mockedAuthService.registerInfluencer).toHaveBeenCalledTimes(1);
      expect(mockedAuthService.registerBrand).not.toHaveBeenCalled();
    });

    it('should reject influencer registration when required fields are missing', async () => {
      const app = createTestApp();
      const response = await request(app)
        .post('/api/v1/auth/register/influencer')
        .send({
          email: 'creator@social.com',
          password: 'StrongPass1!',
          niche: 'Fashion',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
      expect(mockedAuthService.registerInfluencer).not.toHaveBeenCalled();
    });
  });

  describe('User Story 3: Login', () => {
    it('should login successfully with correct credentials and return brand role for brand dashboard routing', async () => {
      mockedAuthService.login.mockResolvedValue({
        accessToken: 'brand-login-token',
        refreshToken: 'brand-login-refresh-token',
        user: {
          id: 'brand-3',
          email: 'brand@login.com',
          role: 'BRAND',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      });

      const app = createTestApp();
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'brand@login.com',
          password: 'StrongPass1!',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('BRAND');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(mockedAuthService.login).toHaveBeenCalledWith('brand@login.com', 'StrongPass1!');
    });

    it('should login successfully with correct credentials and return influencer role for influencer dashboard routing', async () => {
      mockedAuthService.login.mockResolvedValue({
        accessToken: 'influencer-login-token',
        refreshToken: 'influencer-login-refresh-token',
        user: {
          id: 'influencer-3',
          email: 'influencer@login.com',
          role: 'INFLUENCER',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      });

      const app = createTestApp();
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'influencer@login.com',
          password: 'StrongPass1!',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('INFLUENCER');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(mockedAuthService.login).toHaveBeenCalledWith('influencer@login.com', 'StrongPass1!');
    });

    it('should show error on wrong credentials', async () => {
      mockedAuthService.login.mockRejectedValue(new Error('Invalid email or password'));

      const app = createTestApp();
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'wrong@login.com',
          password: 'WrongPass1!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid email or password');
    });

    it('should reject login request when email or password is missing', async () => {
      const app = createTestApp();
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'missing@password.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email and password are required');
      expect(mockedAuthService.login).not.toHaveBeenCalled();
    });
  });
});
