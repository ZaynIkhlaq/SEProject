"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const campaign_service_1 = require("../services/campaign.service");
const router = (0, express_1.Router)();
// US-3.1: Post a Campaign
router.post('/', auth_1.authMiddleware, (0, auth_1.roleCheck)(['BRAND']), async (req, res) => {
    try {
        const { title, productService, requiredNiche, budgetTier, influencersNeeded, deadline, description } = req.body;
        if (!title || !productService || !requiredNiche || !budgetTier || !influencersNeeded || !deadline) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }
        const campaign = await campaign_service_1.CampaignService.createCampaign(req.user.id, {
            title,
            productService,
            requiredNiche,
            budgetTier,
            influencersNeeded,
            deadline,
            description
        });
        res.status(201).json({
            success: true,
            data: campaign
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});
// US-3.2: Edit Campaign
router.put('/:campaignId', auth_1.authMiddleware, (0, auth_1.roleCheck)(['BRAND']), async (req, res) => {
    try {
        const campaign = await campaign_service_1.CampaignService.updateCampaign(req.params.campaignId, req.user.id, req.body);
        res.json({
            success: true,
            data: campaign
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});
// US-3.2: Close Campaign
router.post('/:campaignId/close', auth_1.authMiddleware, (0, auth_1.roleCheck)(['BRAND']), async (req, res) => {
    try {
        const campaign = await campaign_service_1.CampaignService.closeCampaign(req.params.campaignId, req.user.id);
        res.json({
            success: true,
            data: campaign
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});
// US-3.3: Browse Campaigns
router.get('/', auth_1.authMiddleware, async (req, res) => {
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
// Get Campaign Details
router.get('/:campaignId', auth_1.authMiddleware, async (req, res) => {
    try {
        const campaign = await campaign_service_1.CampaignService.getCampaignById(req.params.campaignId);
        res.json({
            success: true,
            data: campaign
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});
// US-3.4: Get Campaign Status
router.get('/:campaignId/status', auth_1.authMiddleware, async (req, res) => {
    try {
        const status = await campaign_service_1.CampaignService.getCampaignStatus(req.params.campaignId);
        res.json({
            success: true,
            data: status
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
//# sourceMappingURL=campaign.routes.js.map