"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prismaClient_1 = __importDefault(require("../utils/prismaClient")); // Import prismaClient
const salesMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'Please login first'
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
        // Check if user is suspended
        const user = yield prismaClient_1.default.user.findUnique({
            where: { id: decoded.userId },
            select: { suspended: true },
        });
        if (user && user.suspended) {
            return res.status(403).json({
                success: false,
                message: 'Account temporarily suspended, please contact administrator'
            });
        }
        if (!decoded.permissions || !Array.isArray(decoded.permissions)) {
            return res.status(403).json({
                success: false,
                message: 'User permissions not found'
            });
        }
        const hasSalesPermission = decoded.permissions.some((permission) => permission.id === 1);
        if (!hasSalesPermission) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to access this route'
            });
        }
        req.user = {
            email: decoded.email,
            userId: decoded.userId,
            permissions: decoded.permissions
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
});
exports.default = salesMiddleware;
