"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const review_service_1 = require("../services/review.service");
const router = (0, express_1.Router)();
// US-6.1: Leave Review
router.post('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const { campaignId, reviewedUserId, rating, comment } = req.body;
        if (!campaignId || !reviewedUserId || !rating || !comment) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: campaignId, reviewedUserId, rating, comment'
            });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                error: 'Rating must be between 1 and 5'
            });
        }
        const review = await review_service_1.ReviewService.createReview(req.user.id, {
            campaignId,
            reviewedUserId,
            rating,
            comment
        });
        res.status(201).json({
            success: true,
            data: review
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});
// US-6.2: View Reviews
router.get('/user/:userId', async (req, res) => {
    try {
        const reviews = await review_service_1.ReviewService.getUserReviews(req.params.userId);
        res.json({
            success: true,
            data: reviews
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});
// Get Review Stats
router.get('/stats/:userId', async (req, res) => {
    try {
        const stats = await review_service_1.ReviewService.getReviewStats(req.params.userId);
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});
// US-6.3: Report Review
router.post('/:reviewId/report', auth_1.authMiddleware, async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason) {
            return res.status(400).json({
                success: false,
                error: 'Report reason is required'
            });
        }
        const review = await review_service_1.ReviewService.reportReview(req.params.reviewId, reason);
        res.json({
            success: true,
            data: review
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
//# sourceMappingURL=review.routes.js.map