import express from "express";
import STATUS_CODES from "../constants/statusCodes";
import { APIError } from "../utils/apiHandler";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { getPermissionCached } from "../utils/getPermissions";
import { generateAccessToken } from "../utils/generateAccessToken";
import { toolsController } from "../controllers/toolsController";
import { userMiddleware } from "../middlewares/userMiddleware";
import { AuthRequest } from "../types/sitesDataTypes";
import { toolsRateLimiter } from "../middlewares/toolsRateLimiter";

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET || 'random@123';

// Tools Middleware
router.use(async (req: AuthRequest, res, next) => {
    const token = req.cookies.accessToken;
    if (!token) {
        return res.status(401).json(new APIError(STATUS_CODES.UNAUTHORIZED, "Authentication token is missing", [], false));
    }

    try {
        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
        req.user = {
            email: decoded.email,
            userId: decoded.userId,
            role: decoded.role,
            userAccess: decoded.userAccess
        };
        const Permission = await getPermissionCached(decoded.userId);
        const isAllowed = Permission.some(p => p.name === 'Tools');
        if (!isAllowed) {
            return res.status(403).json(new APIError(STATUS_CODES.FORBIDDEN, "You are not authorized to access this route", [], false));
        }
        return next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            const refreshed = await generateAccessToken(req, res);
            if (refreshed) {
                const decoded = jwt.decode(req.cookies.accessToken) as { email: string; userId: number; role: { name: string } };
                const Permission = await getPermissionCached(decoded.userId);
                const isAllowed = Permission.some(p => p.name === 'Tools');
                if (!isAllowed) {
                    return res.status(403).json(new APIError(STATUS_CODES.FORBIDDEN, "You are not authorized to access this route", [], false));
                }
                return next();
            }
        }

        return res.status(403).json(new APIError(STATUS_CODES.FORBIDDEN, "Invalid access token", [], false));
    }
})

// Tools Routes
router.post('/website-checker', toolsController.websiteChecker)
router.post('/price-checker',toolsRateLimiter('price-checker'), toolsController.priceChecker)
router.post('/vendor-checker', toolsRateLimiter('vendor-checker'),toolsController.vendorChecker)
router.post('/category-links', toolsController.categoryLinks)
router.post('/add-trash-domains', userMiddleware, toolsController.addTrashDomains)
router.get('/niche-domains', toolsController.nicheDomains)
router.get('/get-dispatchedDomains', toolsController.getDispatchedDomains)
router.post('/add-dispatchedDomains', toolsController.addDispatchedDomains)
router.post('/get-live-matrics', toolsController.getLatestMatrics)
router.post('/get-sites', toolsRateLimiter('get-sites-ai'), toolsController.getSites)

export default router;