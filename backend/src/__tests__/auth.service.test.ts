import { AuthService } from '../services/auth.service';
import { prisma } from '../index';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock Prisma
jest.mock('../index', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerBrand', () => {
    it('should register a brand successfully', async () => {
      const mockUser = {
        id: '123',
        email: 'brand@test.com',
        role: 'BRAND',
        isActive: true,
        createdAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('token');

      const result = await AuthService.registerBrand({
        email: 'brand@test.com',
        password: 'password123',
        companyName: 'My Company',
        industry: 'Tech',
        budgetTier: 'TIER_10K_50K',
      });

      expect(result.user.email).toBe('brand@test.com');
      expect(result.accessToken).toBe('token');
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '123' });

      await expect(
        AuthService.registerBrand({
          email: 'existing@test.com',
          password: 'password123',
          companyName: 'My Company',
          industry: 'Tech',
          budgetTier: 'TIER_10K_50K',
        })
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockUser = {
        id: '123',
        email: 'user@test.com',
        password: 'hashed_password',
        role: 'BRAND',
        isActive: true,
        createdAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('token');

      const result = await AuthService.login('user@test.com', 'password123');

      expect(result.user.email).toBe('user@test.com');
      expect(result.accessToken).toBe('token');
    });

    it('should throw error for invalid credentials', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        AuthService.login('nonexistent@test.com', 'password123')
      ).rejects.toThrow('Invalid email or password');
    });
  });
});
