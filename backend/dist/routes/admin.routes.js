"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const admin_service_1 = require("../services/admin.service");
const router = (0, express_1.Router)();
// US-1.5: Get All Users
router.get('/users', auth_1.authMiddleware, (0, auth_1.roleCheck)(['ADMIN']), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 20;
        const result = await admin_service_1.AdminService.getAllUsers(page, pageSize);
        res.json({
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
// Get User Details
router.get('/users/:userId', auth_1.authMiddleware, (0, auth_1.roleCheck)(['ADMIN']), async (req, res) => {
    try {
        const user = await admin_service_1.AdminService.getUserDetails(req.params.userId);
        res.json({
            success: true,
            data: user
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});
// US-1.5: Deactivate User
router.patch('/users/:userId/deactivate', auth_1.authMiddleware, (0, auth_1.roleCheck)(['ADMIN']), async (req, res) => {
    try {
        await admin_service_1.AdminService.deactivateUser(req.params.userId);
        res.json({
            success: true,
            message: 'User deactivated successfully'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});
// US-1.5: Delete User
router.delete('/users/:userId', auth_1.authMiddleware, (0, auth_1.roleCheck)(['ADMIN']), async (req, res) => {
    try {
        await admin_service_1.AdminService.deleteUser(req.params.userId);
        res.json({
            success: true,
            message: 'User deleted permanently'
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
//# sourceMappingURL=admin.routes.js.map