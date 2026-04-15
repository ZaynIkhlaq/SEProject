"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const message_service_1 = require("../services/message.service");
const router = (0, express_1.Router)();
// US-5.1: Send Message
router.post('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const { campaignId, receiverId, text } = req.body;
        if (!campaignId || !receiverId || !text) {
            return res.status(400).json({
                success: false,
                error: 'Campaign ID, receiver ID, and text are required'
            });
        }
        const message = await message_service_1.MessageService.sendMessage(campaignId, req.user.id, receiverId, text);
        res.status(201).json({
            success: true,
            data: message
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});
// US-5.2: View Inbox
router.get('/inbox', auth_1.authMiddleware, async (req, res) => {
    try {
        const threads = await message_service_1.MessageService.getInbox(req.user.id);
        res.json({
            success: true,
            data: threads
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});
// US-5.2: Get Thread
router.get('/thread/:campaignId/:otherUserId', auth_1.authMiddleware, async (req, res) => {
    try {
        const messages = await message_service_1.MessageService.getMessageThread(req.params.campaignId, req.user.id, req.params.otherUserId);
        res.json({
            success: true,
            data: messages
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});
// US-5.3: Unread Badge
router.get('/unread/count', auth_1.authMiddleware, async (req, res) => {
    try {
        const count = await message_service_1.MessageService.getUnreadCount(req.user.id);
        res.json({
            success: true,
            data: { unreadCount: count }
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
//# sourceMappingURL=message.routes.js.map