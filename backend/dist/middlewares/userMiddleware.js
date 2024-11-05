"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendErrorResponse = (res, status, message) => {
    return res.status(status).json({
        success: false,
        message
    });
};
const userMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return sendErrorResponse(res, 401, 'Please log in first');
    }
    try {
        const token = authHeader.split(' ')[1];
        if (!token) {
            return sendErrorResponse(res, 401, 'Authentication token is missing');
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return sendErrorResponse(res, 500, 'JWT_SECRET is not defined');
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        req.user = {
            email: decoded.email,
            userId: decoded.userId,
            role: decoded.role,
            permissions: decoded.permissions,
            resources: decoded.resources
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return sendErrorResponse(res, 401, 'Invalid token');
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return sendErrorResponse(res, 401, 'Token has expired');
        }
        console.error(error); // Log error for debugging
        return sendErrorResponse(res, 500, 'Internal server error');
    }
};
exports.default = userMiddleware;
