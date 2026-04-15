"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const application_service_1 = require("../services/application.service");
const router = (0, express_1.Router)();
// US-3.3: Apply to Campaign
router.post('/', auth_1.authMiddleware, (0, auth_1.roleCheck)(['INFLUENCER']), async (req, res) => {
    try {
        const { campaignId } = req.body;
        if (!campaignId) {
            return res.status(400).json({
                success: false,
                error: 'Campaign ID is required'
            });
        }
        const application = await application_service_1.ApplicationService.applyToCampaign(campaignId, req.user.id);
        res.status(201).json({
            success: true,
            data: application
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});
// Accept Application
router.patch('/:applicationId/accept', auth_1.authMiddleware, (0, auth_1.roleCheck)(['BRAND']), async (req, res) => {
    try {
        const application = await application_service_1.ApplicationService.acceptApplication(req.params.applicationId, req.user.id);
        res.json({
            success: true,
            data: application
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});
// Reject Application
router.patch('/:applicationId/reject', auth_1.authMiddleware, (0, auth_1.roleCheck)(['BRAND']), async (req, res) => {
    try {
        const application = await application_service_1.ApplicationService.rejectApplication(req.params.applicationId, req.user.id);
        res.json({
            success: true,
            data: application
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});
// Get Campaign Applications (Brand)
router.get('/campaign/:campaignId', auth_1.authMiddleware, (0, auth_1.roleCheck)(['BRAND']), async (req, res) => {
    try {
        const applications = await application_service_1.ApplicationService.getCampaignApplications(req.params.campaignId, req.user.id);
        res.json({
            success: true,
            data: applications
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});
// Get Influencer Applications
router.get('/influencer/my-applications', auth_1.authMiddleware, (0, auth_1.roleCheck)(['INFLUENCER']), async (req, res) => {
    try {
        const applications = await application_service_1.ApplicationService.getInfluencerApplications(req.user.id);
        res.json({
            success: true,
            data: applications
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
//# sourceMappingURL=application.routes.js.map