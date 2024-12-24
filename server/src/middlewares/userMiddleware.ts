import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getPermissionCached } from '../utils/getPermissions';
import { APIError } from '../utils/apiHandler';
import STATUS_CODES from '../constants/statusCodes';
import { generateAccessToken } from '../utils/generateAccessToken';
import 'dotenv/config';

const jwtSecret = process.env.JWT_SECRET || 'random@123';

interface AuthRequest extends Request {
    user?: {
        name: string;
        email: string;
        userId: number;
        role: {
            id: number;
            name: string;
        };
        permissions: any[];
    };
}

const populateUserData = async (
    decoded: {
        name: string;
        email: string; userId: number; role: {
            id: number;
            name: string;
        }
    },
    req: AuthRequest
): Promise<void> => {
    const userPermissions = await getPermissionCached(decoded.userId);
    req.user = {
        name: decoded.name,
        email: decoded.email,
        userId: decoded.userId,
        role: decoded.role,
        permissions: userPermissions,
    };
    // console.log("User data populated:", req.user);
};

export async function userMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    const accessToken = req.cookies.accessToken;
    // console.log("Processing request with access token");

    if (!accessToken) {
        console.error("Access token missing");
        return res
            .status(STATUS_CODES.UNAUTHORIZED)
            .json(new APIError(STATUS_CODES.UNAUTHORIZED, "Access token is missing", [], false));
    }

    try {
        // Verify the current access token
        const decoded = jwt.verify(accessToken, jwtSecret) as {
            name: string;
            email: string;
            userId: number;
            role: {
                id: number;
                name: string;
            }
        };
        await populateUserData(decoded, req);
        return next();
    } catch (error) {
        // Token is invalid/expired, attempt refresh
        // console.log("Attempting token refresh");
        const refreshed = await generateAccessToken(req, res);

        if (refreshed) {
            // Simply decode the new token without verification
            const newToken = req.cookies.accessToken;
            const decodedNewToken = jwt.decode(newToken) as {
                name: string;
                email: string;
                userId: number;
                role: {
                    id: number;
                    name: string;
                };
            };

            if (decodedNewToken) {
                await populateUserData(decodedNewToken, req);
                return next();
            }
        }

        console.error("Authentication failed after refresh");
        return res
    }
}