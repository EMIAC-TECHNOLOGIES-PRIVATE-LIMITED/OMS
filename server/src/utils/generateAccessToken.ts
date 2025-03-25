import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { prismaClient } from '../utils/prismaClient';
import STATUS_CODES from '../constants/statusCodes';
import { APIError } from '../utils/apiHandler';
import 'dotenv/config';

const jwtSecret = process.env.JWT_SECRET || 'random@123';
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh@123';

export async function generateAccessToken(req: any, res: Response): Promise<boolean> {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        console.error("Refresh token is missing.");
        res
            .status(STATUS_CODES.UNAUTHORIZED)
            .json(
                new APIError(
                    STATUS_CODES.UNAUTHORIZED,
                    "Refresh token is missing",
                    [],
                    false
                )
            );
        return false;
    }

    try {
        const decoded = jwt.verify(refreshToken, jwtRefreshSecret) as { userId: number };
        // console.log("Refresh token verified successfully: ", decoded);


        const user = await prismaClient.user.findUnique({
            where: { id: decoded.userId },
            include: {
                role: true
            }
        });

        if (!user || !(user.refreshToken || []).includes(refreshToken)) {
            console.error("Invalid or mismatched refresh token for user ID: ", decoded.userId);
            res
                .status(STATUS_CODES.UNAUTHORIZED)
                .json(
                    new APIError(
                        STATUS_CODES.UNAUTHORIZED,
                        "Invalid refresh token",
                        [],
                        false
                    )
                );
            return false;
        }

        const newAccessToken = jwt.sign(
            {
                name: user.name,
                email: user.email,
                userId: user.id,
                role: user.role,
                userAccess : user.userAccess,
            
            },
            jwtSecret,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
        );

        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 15 * 60 * 1000,
        });

        // console.log(`New access token generated for user: ${user.name}, Token: ${newAccessToken}`);

        return true;
    } catch (error) {
        console.error("Failed to generate new access token: ", error);
        res
            .status(STATUS_CODES.UNAUTHORIZED)
            .json(
                new APIError(
                    STATUS_CODES.UNAUTHORIZED,
                    "Failed to generate new access token",
                    [error instanceof Error ? error.message : "Unknown error"],
                    false
                )
            );
        return false;
    }
}
