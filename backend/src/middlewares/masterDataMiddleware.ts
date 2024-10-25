import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prismaClient from '../utils/prismaClient'; // Import prismaClient

interface Resource {
    id: number;
    tableId: string;
    columns: string[];
    description: string;
}

interface JwtPayload {
    email: string;
    userId: number;
    permissions: any[]; // Adjust based on your permission interface
    resources: Resource[];
    iat: number;
}

interface AuthRequest extends Request {
    user?: {
        email: string;
        userId: number;
        permissions: any[];
        resources: Resource[];
    };
    allowedColumns?: string[];
}

const masterDataMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {

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

        if (!decoded.resources || !Array.isArray(decoded.resources)) {
            return res.status(403).json({
                success: false,
                message: 'User resources not found'
            });
        }

        // Find the resource that corresponds to the MasterData table
        const masterDataResources = decoded.resources.filter(
            (resource: Resource) => resource.tableId === 'MasterData'
        );

        if (masterDataResources.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to access this resource'
            });
        }

        // Collect allowed columns from all matching resources
        const allowedColumnsSet = new Set<string>();
        masterDataResources.forEach((resource) => {
            resource.columns.forEach((column) => allowedColumnsSet.add(column));
        });

        const allowedColumns = Array.from(allowedColumnsSet);

        req.user = {
            email: decoded.email,
            userId: decoded.userId,
            permissions: decoded.permissions,
            resources: decoded.resources
        };
        req.allowedColumns = allowedColumns;

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

export default masterDataMiddleware;
