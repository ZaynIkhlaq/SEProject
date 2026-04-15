import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthService } from '../services/auth.service';
import { RegisterBrandRequest, RegisterInfluencerRequest, LoginRequest } from '../shared/types';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute window
  max: 5, // 5 attempts max
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  skip: (req) => process.env.NODE_ENV === 'development', // Skip in dev
});

// US-1.1: Brand Registration
router.post('/register/brand', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password, companyName, industry, budgetTier, targetInfluencerType } = req.body;

    // Validation
    if (!email || !password || !companyName || !industry || !budgetTier) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, password, companyName, industry, budgetTier'
      });
    }

    const result = await AuthService.registerBrand({
      email,
      password,
      companyName,
      industry,
      budgetTier,
      targetInfluencerType
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// US-1.2: Influencer Registration
router.post('/register/influencer', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password, niche, platform, followerCount, engagementRate } = req.body;

    // Validation
    if (!email || !password || !niche || !platform || followerCount === undefined || engagementRate === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, password, niche, platform, followerCount, engagementRate'
      });
    }

    const result = await AuthService.registerInfluencer({
      email,
      password,
      niche,
      platform,
      followerCount,
      engagementRate
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// US-1.3: Login with Email & Password
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const result = await AuthService.login(email, password);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message || 'Invalid credentials'
    });
  }
});

// Refresh Token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    const result = await AuthService.refreshToken(refreshToken);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      success: true,
      data: req.user
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
