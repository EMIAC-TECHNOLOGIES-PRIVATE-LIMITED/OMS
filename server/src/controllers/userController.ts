import { prismaClient } from "../utils/prismaClient";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { SignupBody, signupSchema } from "../schemas/signupSchema";
import { SigninBody, signinSchema } from "../schemas/signinSchema";
import { getUserPermission } from "../utils/getPermissions";
import STATUS_CODES from '../constants/statusCodes';
import { APIError, APIResponse } from '../utils/apiHandler';
import { SignUpResponse, SignInResponse, SignOutResponse, UserInfoResponse } from '../../../shared/src/types';

const saltRounds = 10;
const jwtSecret = process.env.JWT_SECRET || 'random@123';
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'random@123';

interface AuthenticatedRequest extends Request {
    user: {
        email: string;
        userId: number;
        name: string;
        role: {
            id: number;
            name: string;
        };
        permissions: any[];
    };
}

export async function signUpController(req: Request, res: Response): Promise<Response> {
    const result = signupSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(STATUS_CODES.BAD_REQUEST).json(
            new APIError(
                STATUS_CODES.BAD_REQUEST,
                "Invalid input",
                result.error.errors,
                false
            ).toJSON()
        );
    }

    const body: SignupBody = result.data;

    const userExist = await prismaClient.user.findUnique({
        where: {
            email: body.email,
        },
    });

    if (userExist) {
        return res.status(STATUS_CODES.CONFLICT).json(
            new APIError(
                STATUS_CODES.CONFLICT,
                "Email ID already in use.",
                [],
                false
            ).toJSON()
        );
    }

    try {
        const validRole = await prismaClient.role.findUnique({
            where: {
                id: body.roleId,
            },
        });

        if (!validRole) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(
                new APIError(
                    STATUS_CODES.BAD_REQUEST,
                    "Invalid roleId provided",
                    [],
                    false
                ).toJSON()
            );
        }
    } catch (error) {
        console.error("Role validation failed:", error);
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
            new APIError(
                STATUS_CODES.INTERNAL_SERVER_ERROR,
                "Role validation failed",
                [error instanceof Error ? error.message : "Unknown error"],
                false
            ).toJSON()
        );
    }

    try {
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(body.password, salt);

        const newUser = await prismaClient.user.create({
            data: {
                name: body.name,
                email: body.email,
                password: hashedPassword,
                roleId: body.roleId,
            },
        });

        return res.status(STATUS_CODES.CREATED).json(
            new APIResponse(
                STATUS_CODES.CREATED,
                "User created successfully",
                {
                    userId: newUser.id,
                },
                true
            ).toJSON()
        );
    } catch (error) {
        console.error("User creation failed:", error);
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
            new APIError(
                STATUS_CODES.INTERNAL_SERVER_ERROR,
                "User creation failed",
                [error instanceof Error ? error.message : "Unknown error"],
                false
            ).toJSON()
        );
    }
}

export async function signInController(req: Request, res: Response): Promise<Response> {
    const result = signinSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(STATUS_CODES.BAD_REQUEST).json(
            new APIError(
                STATUS_CODES.BAD_REQUEST,
                "Invalid input",
                result.error.errors,
                false
            ).toJSON()
        );
    }

    const body: SigninBody = result.data;

    try {
        const userFound = await prismaClient.user.findUnique({
            where: { email: body.email },
            include: {
                role: true,
            },
        });

        if (!userFound) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json(
                new APIError(
                    STATUS_CODES.UNAUTHORIZED,
                    "Invalid email or password",
                    [],
                    false
                ).toJSON()
            );
        }

        const passwordMatch = await bcrypt.compare(body.password, userFound.password);
        if (!passwordMatch) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json(
                new APIError(
                    STATUS_CODES.UNAUTHORIZED,
                    "Invalid email or password",
                    [],
                    false
                ).toJSON()
            );
        }

        if (userFound.suspended) {
            return res.status(STATUS_CODES.FORBIDDEN).json(
                new APIError(
                    STATUS_CODES.FORBIDDEN,
                    "User is suspended",
                    [],
                    false
                ).toJSON()
            );
        }

        const permissions = await getUserPermission(userFound.id);
    
        const accessToken = jwt.sign(
            {
                name: userFound.name,
                email: userFound.email,
                userId: userFound.id,
                role: userFound.role,
            },
            jwtSecret,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || 15}
        );
        const newRefreshToken = jwt.sign(
            {
                userId: userFound.id,
            },
            jwtRefreshSecret,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
        );

        await prismaClient.user.update({
            where: { id: userFound.id },
            data: { refreshToken: [...userFound.refreshToken, newRefreshToken] },
        });

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.cookie('isAuthenticated', 'true', { 
            httpOnly: false,
            secure: true,
            sameSite: 'strict'
        })

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
        });

        const responseObject: SignInResponse['data'] = {
            id: userFound.id,
            name: userFound.name,
            email: userFound.email,
            role: userFound.role,
            permissions
        }

        return res.status(STATUS_CODES.OK).json(
            new APIResponse(
                STATUS_CODES.OK,
                "User logged in successfully",
                responseObject,
                true
            ).toJSON()
        );
    } catch (error) {
        console.error("Login failed:", error);
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
            new APIError(
                STATUS_CODES.INTERNAL_SERVER_ERROR,
                "Internal server error",
                [error instanceof Error ? error.message : "Unknown error"],
                false
            ).toJSON()
        );
    }
}

export async function signOutController(req: Request, res: Response): Promise<Response> {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res
            .status(STATUS_CODES.BAD_REQUEST)
            .json(new APIError(STATUS_CODES.BAD_REQUEST, "Refresh Token not found", [], false).toJSON());
    }

    try {
        const { userId } = jwt.verify(refreshToken, jwtRefreshSecret) as { userId: number };
        const userFound = await prismaClient.user.findUnique({
            where: { id: userId },
        });

        if (!userFound) {
            return res
                .status(STATUS_CODES.NOT_FOUND)
                .json(new APIError(STATUS_CODES.NOT_FOUND, "User not found", [], false).toJSON());
        }

        const updatedRefreshTokens = (userFound.refreshToken || []).filter(token => token !== refreshToken);

        await prismaClient.user.update({
            where: { id: userFound.id },
            data: { refreshToken: updatedRefreshTokens },
        });

        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
        });

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
        });

        res.clearCookie('isAuthenticated', {
            httpOnly: false,
            secure: true,
            sameSite: 'strict',
        })

        return res
            .status(STATUS_CODES.OK)
            .json(new APIResponse(STATUS_CODES.OK, "User logged out successfully", {}, true).toJSON());
    } catch (error) {
        console.error("Logout failed:", error);
        if (error instanceof jwt.JsonWebTokenError) {
            return res
                .status(STATUS_CODES.UNAUTHORIZED)
                .json(new APIError(STATUS_CODES.UNAUTHORIZED, "Invalid or expired refresh token", [], false).toJSON());
        }

        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json(
                new APIError(
                    STATUS_CODES.INTERNAL_SERVER_ERROR,
                    "Internal server error",
                    [error instanceof Error ? error.message : "Unknown error"],
                    false
                ).toJSON()
            );
    }
}

export async function userInfo(req: Request, res: Response): Promise<Response> {
    const body = req as AuthenticatedRequest;
    const user = body.user;

    if (!user || !user.permissions) {
        return res
            .status(STATUS_CODES.UNAUTHORIZED)
            .json(new APIError(STATUS_CODES.UNAUTHORIZED, "User permissions not found. Ensure you are authenticated.", [], false).toJSON());
    }

    const reponseObject: UserInfoResponse['data'] = {
        id: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions
    }

    return res
        .status(STATUS_CODES.OK)
        .json(new APIResponse(STATUS_CODES.OK, "User permissions fetched successfully",
            reponseObject
            , true).toJSON());
}
