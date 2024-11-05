import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prismaClient from '../utils/prismaClient';
import { Prisma } from '@prisma/client';
import { JwtPayload, AuthRequest } from '../types/sitesDataTypes';
import { routes } from '../constants/dataRoutes';

const viewsMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    const { authorization } = req.headers;
    const { resource, viewId } = req.params;

    if (!authorization) {
        return res.status(401).json({ success: false, message: 'Authorization header missing' });
    }

    try {
        const token = authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;


        const model = Prisma.dmmf.datamodel.models.find(
            (m) => {
                // console.log(m.name.toLowerCase().slice(0, -1));
                return m.name.toLowerCase() === resource.toLowerCase().slice(0,-1);
            }
        );
        if (!model) {
            return res.status(404).json({ success: false, message: 'Resource not found' });
        }

        req.modelName = model.name;


        const requiredPermissionKey = `VIEW_${resource.toUpperCase()}_ROUTE`;
        const hasPermission = decoded.permissions.some(
            (permission) => permission.key === requiredPermissionKey
        );

        if (!hasPermission) {
            return res.status(403).json({ success: false, message: 'Permission denied' });
        }

        // Extract permitted columns
        const userResource = decoded.resources.find(

            (r) => {
                // console.log(r.key);
                // console.log(r.key.toLowerCase().split('_')[0]);
                return r.key.toLowerCase().split('_')[0] === resource.toLowerCase();
            }
        );
        // console.log(userResource);

        if (!userResource) {
            return res
                .status(403)
                .json({ success: false, message: 'No column access defined for this resource' });
        }
        req.permittedColumns = userResource.columns;

        const columnTypes: { [key: string]: string } = {};
        for (const field of model.fields) {
            if (req.permittedColumns.includes(field.name)) {
                columnTypes[field.name] = field.type;
            }
        }
        req.columnTypes = columnTypes;

        // Attach user's info to the request
        req.user = decoded;

        // Handle default 'grid' view when viewId is not provided
        if (!viewId) {
            // Check if default 'grid' view exists
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
                        columns: req.permittedColumns,
                        filters: {},
                        sort: [],
                        groupBy: [],
                    },
                });
            }

            // Set the viewId to the default 'grid' view's ID
            req.params.viewId = defaultView.id.toString();
            req.view = defaultView;
        } else {
            // Fetch the specified view
            const view = await prismaClient.view.findUnique({
                where: { id: parseInt(viewId) },
            });

            if (!view) {
                return res.status(404).json({ success: false, message: 'View not found' });
            }

            // Verify ownership and resource
            if (
                view.userId !== decoded.userId ||
                view.tableId.toLowerCase() !== resource.toLowerCase()
            ) {
                return res
                    .status(403)
                    .json({ success: false, message: 'Permission denied to access this view' });
            }

            req.view = view;
        }

        // Fetch user's views on this resource
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

        next();
    } catch (error) {
        console.error(error);
        return res.status(403).json({ success: false, message: 'Invalid token' });
    }
};

export default viewsMiddleware;
