"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const profile_service_1 = require("../services/profile.service");
const router = (0, express_1.Router)();
// ===== BRAND PROFILE ROUTES =====
// US-2.1: Get Brand Profile
router.get('/brand', auth_1.authMiddleware, (0, auth_1.roleCheck)(['BRAND']), async (req, res) => {
    try {
        const profile = await profile_service_1.ProfileService.getBrandProfile(req.user.id);
        res.json({
            success: true,
            data: profile
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});
// US-2.1: Update Brand Profile
router.put('/brand', auth_1.authMiddleware, (0, auth_1.roleCheck)(['BRAND']), async (req, res) => {
    try {
        const { companyName, industry, bio, website, budgetTier, targetInfluencerType } = req.body;
        const profile = await profile_service_1.ProfileService.updateBrandProfile(req.user.id, {
            companyName,
            industry,
            bio,
            website,
            budgetTier,
            targetInfluencerType
        });
        res.json({
            success: true,
            data: profile
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});
// ===== INFLUENCER PROFILE ROUTES =====
// US-2.2: Get Influencer Profile
router.get('/influencer', auth_1.authMiddleware, (0, auth_1.roleCheck)(['INFLUENCER']), async (req, res) => {
    try {
        const profile = await profile_service_1.ProfileService.getInfluencerProfile(req.user.id);
        res.json({
            success: true,
            data: profile
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});
// US-2.2: Update Influencer Profile
router.put('/influencer', auth_1.authMiddleware, (0, auth_1.roleCheck)(['INFLUENCER']), async (req, res) => {
    try {
        const { motto, bio, niche, platform, followerCount, engagementRate, location, profilePhoto } = req.body;
        const profile = await profile_service_1.ProfileService.updateInfluencerProfile(req.user.id, {
            motto,
            bio,
            niche,
            platform,
            followerCount,
            engagementRate,
            location,
            profilePhoto
        });
        res.json({
            success: true,
            data: profile
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});
// ===== PORTFOLIO ITEMS (US-2.3) =====
// Add Portfolio Item
router.post('/portfolio', auth_1.authMiddleware, (0, auth_1.roleCheck)(['INFLUENCER']), async (req, res) => {
    try {
        const { url, description } = req.body;
        if (!url || !description) {
            return res.status(400).json({
                success: false,
                error: 'URL and description are required'
            });
        }
        const item = await profile_service_1.ProfileService.addPortfolioItem(req.user.id, { url, description });
        res.status(201).json({
            success: true,
            data: item
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});
// Get Portfolio Items
router.get('/portfolio', auth_1.authMiddleware, (0, auth_1.roleCheck)(['INFLUENCER']), async (req, res) => {
    try {
        const items = await profile_service_1.ProfileService.getPortfolioItems(req.user.id);
        res.json({
            success: true,
            data: items
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});
// Update Portfolio Item
router.put('/portfolio/:itemId', auth_1.authMiddleware, (0, auth_1.roleCheck)(['INFLUENCER']), async (req, res) => {
    try {
        const { url, description } = req.body;
        if (!url || !description) {
            return res.status(400).json({
                success: false,
                error: 'URL and description are required'
            });
        }
        const item = await profile_service_1.ProfileService.updatePortfolioItem(req.params.itemId, { url, description });
        res.json({
            success: true,
            data: item
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});
// Delete Portfolio Item
router.delete('/portfolio/:itemId', auth_1.authMiddleware, (0, auth_1.roleCheck)(['INFLUENCER']), async (req, res) => {
    try {
        await profile_service_1.ProfileService.deletePortfolioItem(req.params.itemId);
        res.json({
            success: true,
            message: 'Portfolio item deleted'
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});
// ===== PUBLIC PROFILES (US-2.4) =====
// Get Public Brand Profile
router.get('/public/brand/:userId', async (req, res) => {
    try {
        const profile = await profile_service_1.ProfileService.getPublicBrandProfile(req.params.userId);
        res.json({
            success: true,
            data: profile
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});
// Get Public Influencer Profile
router.get('/public/influencer/:userId', async (req, res) => {
    try {
        const profile = await profile_service_1.ProfileService.getPublicInfluencerProfile(req.params.userId);
        res.json({
            success: true,
            data: profile
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=profile.routes.js.map