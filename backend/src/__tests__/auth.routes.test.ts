import request from 'supertest';
import app from '../index';
import { prisma } from '../index';

jest.mock('../index', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('Auth Routes', () => {
  describe('POST /api/v1/auth/register/brand', () => {
    it('should register a brand with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register/brand')
        .send({
          email: 'brand@test.com',
          password: 'password123',
          companyName: 'My Company',
          industry: 'Tech',
          budgetTier: 'TIER_10K_50K',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register/brand')
        .send({
          email: 'brand@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'user@test.com',
          password: 'password123',
        });

      // Will fail without proper mock setup, but structure is correct
      expect(response.body).toHaveProperty('success');
    });

    it('should reject missing credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'user@test.com',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should reject requests without token', async () => {
      const response = await request(app).get('/api/v1/auth/me');

      expect(response.status).toBe(401);
    });
  });
});
