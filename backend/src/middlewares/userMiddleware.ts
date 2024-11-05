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

const sendErrorResponse = (res: Response, status: number, message: string) => {
    return res.status(status).json({
        success: false,
        message
    });
};

const userMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Response | void => {

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

        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

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
            return sendErrorResponse(res, 401, 'Invalid token');
        }
        if (error instanceof jwt.TokenExpiredError) {
            return sendErrorResponse(res, 401, 'Token has expired');
        }
        console.error(error); // Log error for debugging
        return sendErrorResponse(res, 500, 'Internal server error');
    }
};

export default userMiddleware;
