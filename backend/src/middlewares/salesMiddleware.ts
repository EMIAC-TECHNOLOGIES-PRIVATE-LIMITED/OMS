import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prismaClient from '../utils/prismaClient'; // Import prismaClient

interface Permission {
    id: number;
    description: string;
}

interface JwtPayload {
    email: string;
    userId: number;
    permissions: Permission[];
    iat: number;
}

interface AuthRequest extends Request {
    user?: {
        email: string;
        userId: number;
        permissions: Permission[];
    };
}

const salesMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {

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

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

        // Check if user is suspended
        const user = await prismaClient.user.findUnique({
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

        const hasSalesPermission = decoded.permissions.some(
            (permission: Permission) => permission.id === 1
        );

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

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        if (error instanceof jwt.TokenExpiredError) {
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

export default salesMiddleware;
