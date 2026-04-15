"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("express-async-errors");
const client_1 = require("@prisma/client");
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const profile_routes_1 = __importDefault(require("./routes/profile.routes"));
const campaign_routes_1 = __importDefault(require("./routes/campaign.routes"));
const application_routes_1 = __importDefault(require("./routes/application.routes"));
const message_routes_1 = __importDefault(require("./routes/message.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const recommendation_routes_1 = __importDefault(require("./routes/recommendation.routes"));
// Import middleware
const errorHandler_1 = require("./middleware/errorHandler");
const requestLogger_1 = require("./middleware/requestLogger");
const app = (0, express_1.default)();
exports.prisma = new client_1.PrismaClient();
// ===== MIDDLEWARE =====
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://yourdomain.vercel.app']
        : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(requestLogger_1.requestLogger);
// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// ===== API ROUTES =====
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/profiles', profile_routes_1.default);
app.use('/api/v1/campaigns', campaign_routes_1.default);
app.use('/api/v1/applications', application_routes_1.default);
app.use('/api/v1/messages', message_routes_1.default);
app.use('/api/v1/reviews', review_routes_1.default);
app.use('/api/v1/admin', admin_routes_1.default);
app.use('/api/v1/recommendations', recommendation_routes_1.default);
// ===== 404 HANDLER =====
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.path
    });
});
// ===== ERROR HANDLER =====
app.use(errorHandler_1.errorHandler);
// ===== STARTUP =====
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(async () => {
        await exports.prisma.$disconnect();
        process.exit(0);
    });
});
exports.default = app;
//# sourceMappingURL=index.js.map