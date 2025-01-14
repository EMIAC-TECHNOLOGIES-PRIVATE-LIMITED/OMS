import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import STATUS_CODES from '../constants/statusCodes';
import { APIError } from '../utils/apiHandler';
import { generateAccessToken } from '../utils/generateAccessToken';
import 'dotenv/config';

const jwtSecret = process.env.JWT_SECRET || 'random@123';

interface CustomRequest extends Request {
    user?: {
        email: string;
        userId: number;
        role: string;
    };
}

export async function adminMiddleware(req: CustomRequest, res: Response, next: NextFunction): Promise<Response | void> {
    const token = req.cookies.accessToken;

    if (!token) {
        return res
            .status(STATUS_CODES.UNAUTHORIZED)
            .json(
                new APIError(
                    STATUS_CODES.UNAUTHORIZED,
                    "Authentication token is missing",
                    [],
                    false
                )
            );
    }

    try {
        const decoded = jwt.verify(token, jwtSecret) as { email: string; userId: number; role: { name: string } };

        if (decoded.role.name !== 'Admin') {
            return res
                .status(STATUS_CODES.FORBIDDEN)
                .json(
                    new APIError(
                        STATUS_CODES.FORBIDDEN,
                        "You are not authorized to access this route",
                        [],
                        false
                    )
                );
        }

        req.user = { email: decoded.email, userId: decoded.userId, role: decoded.role.name };
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            const refreshed = await generateAccessToken(req, res);
            if (refreshed) {
                const decoded = jwt.decode(req.cookies.accessToken) as { email: string; userId: number; role: { name: string } };
                if (decoded.role.name !== 'Admin') {
                    return res
                        .status(STATUS_CODES.FORBIDDEN)
                        .json(
                            new APIError(
                                STATUS_CODES.FORBIDDEN,
                                "You are not authorized to access this route",
                                [],
                                false
                            )
                        );
                }
                return next();
            }
        }

        const errorMessage = error instanceof jwt.JsonWebTokenError
            ? "Invalid token"
            : "Internal server error";

        return res
            .status(error instanceof jwt.JsonWebTokenError ? STATUS_CODES.UNAUTHORIZED : STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json(
                new APIError(
                    error instanceof jwt.JsonWebTokenError ? STATUS_CODES.UNAUTHORIZED : STATUS_CODES.INTERNAL_SERVER_ERROR,
                    errorMessage,
                    [],
                    false
                )
            );
    }
}
