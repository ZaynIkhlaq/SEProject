"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const recommendation_service_1 = require("../services/recommendation.service");
const campaign_service_1 = require("../services/campaign.service");
const router = (0, express_1.Router)();
// US-4.1: Get Recommended Influencers
router.get('/:campaignId', auth_1.authMiddleware, (0, auth_1.roleCheck)(['BRAND']), async (req, res) => {
    try {
        const topN = parseInt(req.query.topN) || 15;
        const recommendations = await recommendation_service_1.RecommendationService.getRecommendedInfluencers(req.params.campaignId, topN);
        res.json({
            success: true,
            data: recommendations
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});
// US-4.2: Campaign Search & Filter (Influencer view)
router.get('/search/campaigns', auth_1.authMiddleware, (0, auth_1.roleCheck)(['INFLUENCER']), async (req, res) => {
    try {
        const filters = {
            niche: req.query.niche,
            budgetTier: req.query.budgetTier,
            platform: req.query.platform
        };
        const campaigns = await campaign_service_1.CampaignService.browseActiveCampaigns(filters);
        res.json({
            success: true,
            data: campaigns
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=recommendation.routes.js.map