import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prismaClient } from '../utils/prismaClient';
import { JwtPayload, AuthRequest } from '../types/sitesDataTypes';
import { routes } from '../constants/dataRoutes';
import { getPermissionCached, getResourceCached } from '../utils/getPermissions';
import { APIError } from '../utils/apiHandler';
import STATUS_CODES from '../constants/statusCodes';
import { generateAccessToken } from '../utils/generateAccessToken';
import 'dotenv/config';

/**
 * req structure after next() is called =>

 * req.user (Decoded JWT payload with user information)
* req.modelName (Capitalized resource name, example : "Sites")
* req.permittedColumns (Array of Columns the user is authorized to access.)
* req.view (Current view object (default or specified).)
* req.userViews (User's available views for the resource.)
* req.params.viewId (ID of the default or specified view.)
*/

const viewsMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    // console.log("Views Middleware Invoked");
    const { resource, viewId } = req.params;
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return res
            .status(STATUS_CODES.UNAUTHORIZED)
            .json(
                new APIError(
                    STATUS_CODES.UNAUTHORIZED,
                    "Access token is missing",
                    [],
                    false
                )
            );
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as JwtPayload;
        await populateRequestData(decoded, req, resource, viewId);
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            const refreshed = await generateAccessToken(req, res);
            if (refreshed) {
                try {
                    const newDecoded = jwt.decode(
                        req.cookies.accessToken
                    ) as JwtPayload;
                    await populateRequestData(newDecoded, req, resource, viewId);
                    return next();
                } catch (newError) {
                    return res
                        .status(STATUS_CODES.FORBIDDEN)
                        .json(
                            new APIError(
                                STATUS_CODES.FORBIDDEN,
                                "Invalid token after refresh",
                                [newError instanceof Error ? newError.message : "Unknown error"],
                                false
                            )
                        );
                }
            }
        }

        return res
            .status(STATUS_CODES.FORBIDDEN)
            .json(
                new APIError(
                    STATUS_CODES.FORBIDDEN,
                    "Invalid token",
                    [error instanceof Error ? error.message : "Unknown error"],
                    false
                )
            );
    }
};

const populateRequestData = async (
    decoded: JwtPayload,
    req: AuthRequest,
    resource: string,
    viewId: string | undefined
): Promise<Response | void> => {
    const validRoute = Object.keys(routes.dataRoutes).includes(resource);

    if (!validRoute) {
        throw new APIError(
            STATUS_CODES.NOT_FOUND,
            "404 Route not found",
            [],
            false
        );
    }

    req.modelName = resource.charAt(0).toUpperCase() + resource.slice(1).toLowerCase();

    const userPermissions = await getPermissionCached(decoded.userId);
    const permittedRoutes = userPermissions.map(((p) => (p.name)));
    const isPermitted = permittedRoutes.includes(resource);
    
    if (!isPermitted) {
        throw new APIError(
            STATUS_CODES.FORBIDDEN,
            "Permission denied",
            [],
            false
        );
    }

    const permittedColumns = await getResourceCached(decoded.userId, resource);
    // console.log(`Permitted columns for ${resource}:`, permittedColumns);

    req.permittedColumns = permittedColumns;
    req.user = decoded;

    if (!viewId) {
        let defaultView = await prismaClient.view.findFirst({
            where: {
                userId: decoded.userId,
                tableId: resource,
                viewName: 'grid',
            },
        });

        if (!defaultView) {
            defaultView = await prismaClient.view.create({
                data: {
                    userId: decoded.userId,
                    tableId: resource,
                    viewName: 'grid',
                    columns: permittedColumns,
                    filters: {},
                    sort: [],
                    groupBy: [],
                },
            });
        }

        req.params.viewId = defaultView.id.toString();
        req.view = defaultView;
    } else {
        const view = await prismaClient.view.findUnique({
            where: { id: parseInt(viewId, 10) },
        });

        if (!view) {
            throw new APIError(
                STATUS_CODES.NOT_FOUND,
                "View not found",
                [],
                false
            );
        }

        if (view.userId !== decoded.userId) {
            throw new APIError(
                STATUS_CODES.FORBIDDEN,
                "You are not authorized to access this view",
                [],
                false
            );
        }

        req.view = view;
    }

    req.userViews = await prismaClient.view.findMany({
        where: {
            userId: decoded.userId,
            tableId: resource,
        },
        select: {
            id: true,
            viewName: true,
        },
    });
};

export default viewsMiddleware;
