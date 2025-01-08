import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload, AuthRequest } from '../types/sitesDataTypes';
import { APIError } from '../utils/apiHandler';
import STATUS_CODES from '../constants/statusCodes';
import { generateAccessToken } from '../utils/generateAccessToken';
import 'dotenv/config';



export const dataMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    // console.log("Data Middleware Invoked");
    const token = req.cookies.accessToken;
    if (!token) {
        return res.
            status(STATUS_CODES.UNAUTHORIZED).
            json(new APIError(STATUS_CODES.UNAUTHORIZED, "Access token is missing", [], false))
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        req.user = decoded;
        next();

    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            const refreshed = await generateAccessToken(req, res);
            if (refreshed) {
                try {
                    const newDecoded = jwt.decode(req.cookies.accessToken) as JwtPayload;
                    req.user = newDecoded;
                    return next();
                } catch (newError) {
                    return res.status(STATUS_CODES.FORBIDDEN).
                        json(new APIError(STATUS_CODES.FORBIDDEN, "Invalid access token", [], false))
                }
            }
        }
        return res.status(STATUS_CODES.FORBIDDEN).
            json(new APIError(STATUS_CODES.FORBIDDEN, "Invalid access token", [], false))
    }
}