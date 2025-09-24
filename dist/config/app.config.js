"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnvironment = validateEnvironment;
function validateEnvironment() {
    if (!process.env.JWT_SECRET || !process.env.DATABASE_URL) {
        throw new Error('Missing required environment variables: JWT_SECRET and DATABASE_URL must be set');
    }
}
//# sourceMappingURL=app.config.js.map