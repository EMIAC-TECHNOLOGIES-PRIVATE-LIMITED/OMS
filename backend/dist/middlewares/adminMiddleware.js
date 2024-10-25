"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const adminMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'Please log in first'
        });
    }
    try {
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication token is missing'
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log(decoded);
        if (!decoded.role) {
            return res.status(403).json({
                success: false,
                message: 'User role not found'
            });
        }
        if (decoded.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to access this route'
            });
        }
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
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                message: 'Token has expired'
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.default = adminMiddleware;
