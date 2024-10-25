import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    email: string;
    userId: number;
    role: string;
    permissions: any[];
    resources: any[];
    iat: number;
}

interface AuthRequest extends Request {
    user?: {
        email: string;
        userId: number;
        role: string;
        permissions: any[];
        resources: any[];
    };
}

const adminMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Response | void => {

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

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
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

export default adminMiddleware;
