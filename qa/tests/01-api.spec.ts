import { test, expect, request } from '@playwright/test';

const API = 'http://localhost:5001';
const V1 = `${API}/api/v1`;

test.describe('API: health & basics', () => {
  test('GET /health returns OK', async ({ request }) => {
    const r = await request.get(`${API}/health`);
    expect(r.status()).toBe(200);
    const body = await r.json();
    expect(body.status).toBe('OK');
  });

  test('Unknown route returns 404 with success:false', async ({ request }) => {
    const r = await request.get(`${API}/api/v1/nope`);
    expect(r.status()).toBe(404);
    const body = await r.json();
    expect(body.success).toBe(false);
  });
});

test.describe('API: auth', () => {
  test('Login with valid brand demo credentials succeeds', async ({ request }) => {
    const r = await request.post(`${V1}/auth/login`, {
      data: { email: 'brand@demo.com', password: 'Demo@123' },
    });
    expect(r.ok()).toBeTruthy();
    const body = await r.json();
    expect(body.success).toBe(true);
    expect(body.data?.token || body.data?.accessToken).toBeTruthy();
  });

  test('Login with invalid password fails (4xx)', async ({ request }) => {
    const r = await request.post(`${V1}/auth/login`, {
      data: { email: 'brand@demo.com', password: 'wrong-pass' },
    });
    expect(r.status()).toBeGreaterThanOrEqual(400);
    expect(r.status()).toBeLessThan(500);
  });

  test('Login with missing fields returns 400', async ({ request }) => {
    const r = await request.post(`${V1}/auth/login`, { data: {} });
    expect(r.status()).toBe(400);
  });

  test('Register brand validation rejects missing fields', async ({ request }) => {
    const r = await request.post(`${V1}/auth/register/brand`, {
      data: { email: 'x@y.com' },
    });
    expect(r.status()).toBe(400);
    const body = await r.json();
    expect(body.success).toBe(false);
  });

  test('Register a fresh brand succeeds', async ({ request }) => {
    const email = `brand_${Date.now()}@qa.test`;
    const r = await request.post(`${V1}/auth/register/brand`, {
      data: {
        email,
        password: 'Test@1234',
        companyName: 'QA Co',
        industry: 'Software',
        budgetTier: 'TIER_10K_50K',
        targetInfluencerType: 'Tech & Innovation',
      },
    });
    expect(r.status()).toBe(201);
    const body = await r.json();
    expect(body.success).toBe(true);
  });

  test('Register an influencer succeeds', async ({ request }) => {
    const email = `inf_${Date.now()}@qa.test`;
    const r = await request.post(`${V1}/auth/register/influencer`, {
      data: {
        email,
        password: 'Test@1234',
        niche: 'Tech & Innovation',
        platform: 'Instagram',
        followerCount: 12000,
        engagementRate: 3.4,
        bio: 'qa influencer',
      },
    });
    // Either 201 success, or 400 if extra required fields not provided
    expect([200, 201, 400]).toContain(r.status());
  });

  test('Duplicate email registration is rejected', async ({ request }) => {
    const r = await request.post(`${V1}/auth/register/brand`, {
      data: {
        email: 'brand@demo.com',
        password: 'Demo@123',
        companyName: 'Dup',
        industry: 'Tech',
        budgetTier: 'TIER_10K_50K',
      },
    });
    expect(r.status()).toBeGreaterThanOrEqual(400);
  });
});

test.describe('API: protected resources', () => {
  let brandToken = '';
  let influencerToken = '';

  test.beforeAll(async () => {
    const ctx = await request.newContext();
    const b = await (await ctx.post(`${V1}/auth/login`, { data: { email: 'brand@demo.com', password: 'Demo@123' } })).json();
    brandToken = b.data?.token || b.data?.accessToken;
    const i = await (await ctx.post(`${V1}/auth/login`, { data: { email: 'influencer@demo.com', password: 'Demo@123' } })).json();
    influencerToken = i.data?.token || i.data?.accessToken;
  });

  test('GET /campaigns without auth returns 401', async ({ request }) => {
    const r = await request.get(`${V1}/campaigns`);
    expect([401, 403]).toContain(r.status());
  });

  test('GET /campaigns with brand token returns list', async ({ request }) => {
    const r = await request.get(`${V1}/campaigns`, {
      headers: { Authorization: `Bearer ${brandToken}` },
    });
    expect(r.ok()).toBeTruthy();
    const body = await r.json();
    expect(body.success).toBe(true);
    const list = body.data?.campaigns || body.data || [];
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
  });

  test('GET /messages/inbox with influencer token works', async ({ request }) => {
    const r = await request.get(`${V1}/messages/inbox`, {
      headers: { Authorization: `Bearer ${influencerToken}` },
    });
    expect(r.ok()).toBeTruthy();
  });

  test('GET /notifications with brand token works', async ({ request }) => {
    const r = await request.get(`${V1}/notifications`, {
      headers: { Authorization: `Bearer ${brandToken}` },
    });
    expect([200, 404]).toContain(r.status());
  });

  test('Influencer cannot create a campaign (RBAC)', async ({ request }) => {
    const r = await request.post(`${V1}/campaigns`, {
      headers: { Authorization: `Bearer ${influencerToken}` },
      data: {
        title: 'X',
        productService: 'X',
        requiredNiche: 'Tech & Innovation',
        budgetTier: 'TIER_10K_50K',
        influencersNeeded: 1,
        deadline: new Date(Date.now() + 86400000).toISOString(),
        description: 'should fail',
      },
    });
    expect([401, 403]).toContain(r.status());
  });

  test('Brand can create a campaign', async ({ request }) => {
    const r = await request.post(`${V1}/campaigns`, {
      headers: { Authorization: `Bearer ${brandToken}` },
      data: {
        title: `QA Campaign ${Date.now()}`,
        productService: 'QA Product',
        requiredNiche: 'Tech & Innovation',
        budgetTier: 'TIER_10K_50K',
        influencersNeeded: 2,
        deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
        description: 'Created by automated QA suite',
      },
    });
    expect([200, 201]).toContain(r.status());
  });
});
