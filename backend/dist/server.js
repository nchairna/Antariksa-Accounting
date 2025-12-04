"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const tenantContext_1 = require("./middleware/tenantContext");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check endpoint (before tenant middleware - no tenant required)
app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
    });
});
// Apply tenant context middleware to all routes
// This sets app.current_tenant_id for RLS filtering
// Note: Auth routes (login/register) still need tenant context (from header or body)
app.use(tenantContext_1.tenantContextMiddleware);
// Authentication routes
// POST /api/auth/register - Register new user (admin-created)
// POST /api/auth/login - Login user
// GET /api/auth/me - Get current user (protected)
// POST /api/auth/logout - Logout user (protected)
app.use("/api/auth", auth_routes_1.default);
// Example protected route (requires tenant context)
app.get("/api/test", (req, res) => {
    const tenantId = req.tenantId;
    res.json({
        message: "Tenant context is set",
        tenantId: tenantId,
        note: "All database queries are now automatically filtered by this tenant",
    });
});
app.listen(PORT, () => {
    console.log(`API server listening on port ${PORT}`);
    console.log(`Tenant context middleware enabled`);
    console.log(`Use x-tenant-id header for development testing`);
    console.log(`Auth endpoints available at /api/auth`);
});
//# sourceMappingURL=server.js.map