"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_service_1 = require("../services/auth.service");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Rate limiting for auth routes
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minute window
    max: 5, // 5 attempts max
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
    standardHeaders: true, // Return rate limit info in RateLimit-* headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
    skip: (req) => process.env.NODE_ENV === 'development', // Skip in dev
});
// US-1.1: Brand Registration
router.post('/register/brand', authLimiter, async (req, res) => {
    try {
        const { email, password, companyName, industry, budgetTier, targetInfluencerType } = req.body;
        // Validation
        if (!email || !password || !companyName || !industry || !budgetTier) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: email, password, companyName, industry, budgetTier'
            });
        }
        const result = await auth_service_1.AuthService.registerBrand({
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
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});
// US-1.2: Influencer Registration
router.post('/register/influencer', authLimiter, async (req, res) => {
    try {
        const { email, password, niche, platform, followerCount, engagementRate } = req.body;
        // Validation
        if (!email || !password || !niche || !platform || followerCount === undefined || engagementRate === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: email, password, niche, platform, followerCount, engagementRate'
            });
        }
        const result = await auth_service_1.AuthService.registerInfluencer({
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
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});
// US-1.3: Login with Email & Password
router.post('/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }
        const result = await auth_service_1.AuthService.login(email, password);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: error.message || 'Invalid credentials'
        });
    }
});
// Refresh Token
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token is required'
            });
        }
        const result = await auth_service_1.AuthService.refreshToken(refreshToken);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: error.message
        });
    }
});
// Get current user
router.get('/me', auth_1.authMiddleware, async (req, res) => {
    try {
        res.json({
            success: true,
            data: req.user
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map