import { Response } from "express"
import STATUS_CODES from "../constants/statusCodes";
import { AuthRequest } from "../types/sitesDataTypes"
import { APIError, APIResponse } from "../utils/apiHandler";
import { getPermissionCached } from "../utils/getPermissions"
import { prismaClient } from "../utils/prismaClient";
import logger from "../logger";


export const dataController = {
    updateData: async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const userId = req.user?.userId;
            const email = req.user?.email;
            const permissions = await getPermissionCached(userId!);
            const resource = req.params.resource;
            const data = req.body;
            const modelName = resource.charAt(0).toUpperCase() + resource.slice(1);

            const hasPermission = permissions.some((permission) => {
                
                return permission.name === `_update_${resource}`;
            });

            if (!hasPermission) {
                logger.warn({
                    labels: { action: 'update', user: email, resource, status: 'unauthorized' },
                    message: 'Unauthorized update attempt',
                    data,
                });
                return res.status(STATUS_CODES.UNAUTHORIZED).json(
                    new APIError(STATUS_CODES.UNAUTHORIZED, "You do not have permission to update this data", [], false)
                );
            }

            const flatData = Object.entries(data).reduce((acc, [key, value]) => {
                const parts = key.split(".");
                const newKey = parts[1];
                acc[newKey] = value;
                return acc;
            }, {} as Record<string, any>);

            const id = flatData.id;
            delete flatData.id;
            const updateData = await (prismaClient as any)[modelName].update({
                where: { id },
                data: flatData,
            });

            logger.info({
                labels: { action: 'update', user: email, resource, status: 'success' },
                message: 'Update successful',
                data,
            });

            return res.status(STATUS_CODES.OK).json(
                new APIResponse(STATUS_CODES.OK, "Data updated successfully", updateData, true)
            );
        } catch (error: any) {
            logger.error({
                labels: { action: 'update', user: req.user?.email, resource: req.params.resource, status: 'failed' },
                message: 'Update failed',
                data: req.body,
                error: error.message,
            });
            console.log(error);
            return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
                new APIError(STATUS_CODES.INTERNAL_SERVER_ERROR, error.message, [], false)
            );
        }
    },

    deleteData: async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const userId = req.user?.userId;
            const email = req.user?.email;
            const permissions = await getPermissionCached(userId!);
            const resource = req.params.resource;
            const modelName = resource.charAt(0).toUpperCase() + resource.slice(1);
            const data = req.body;

            const hasPermission = permissions.some((permission) => {
                return permission.name === `_delete_${resource}`;
            });

            if (!hasPermission) {
                logger.warn({
                    labels: { action: 'delete', user: email, resource, status: 'unauthorized' },
                    message: 'Unauthorized delete attempt',
                    data,
                });
                return res.status(STATUS_CODES.UNAUTHORIZED).json(
                    new APIError(STATUS_CODES.UNAUTHORIZED, "You do not have permission to delete this data", [], false)
                );
            }

            const recordsToDelete = await (prismaClient as any)[modelName].findMany({
                where: { id: { in: data } },
            });

            const deleteData = await (prismaClient as any)[modelName].deleteMany({
                where: { id: { in: data } },
            });

            logger.info({
                labels: { action: 'delete', user: email, resource, status: 'success' },
                message: 'Delete successful',
                data: recordsToDelete,
            });

            return res.status(STATUS_CODES.OK).json(
                new APIResponse(STATUS_CODES.OK, "Data deleted successfully", deleteData, true)
            );
        } catch (error: any) {
            logger.error({
                labels: { action: 'delete', user: req.user?.email, resource: req.params.resource, status: 'failed' },
                message: 'Delete failed',
                data: req.body,
                error: error.message,
            });
            return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
                new APIError(STATUS_CODES.INTERNAL_SERVER_ERROR, error.message, [], false)
            );
        }
    },

    createData: async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const userId = req.user?.userId;
            const email = req.user?.email;
            if (!userId) {
                logger.warn({
                    labels: { action: 'create', user: email || 'unknown', resource: req.params.resource, status: 'unauthorized' },
                    message: 'Unauthorized create attempt - no user ID',
                    data: req.body,
                });
                return res.status(STATUS_CODES.UNAUTHORIZED).json(
                    new APIError(STATUS_CODES.UNAUTHORIZED, "User not authenticated", [], false)
                );
            }

            const permissions = await getPermissionCached(userId);
            const resource = req.params.resource;
            const modelName = resource.charAt(0).toUpperCase() + resource.slice(1);
            const data: Record<string, any>[] = req.body;

            if (!Array.isArray(data)) {
                logger.warn({
                    labels: { action: 'create', user: email, resource, status: 'bad_request' },
                    message: 'Invalid data format - must be an array',
                    data,
                });
                return res.status(STATUS_CODES.BAD_REQUEST).json(
                    new APIError(STATUS_CODES.BAD_REQUEST, "Data should be an array of records", [], false)
                );
            }

            const hasPermission = permissions.some((permission) => {
                return permission.name === `_create_${resource}`;
            });

            if (!hasPermission) {
                logger.warn({
                    labels: { action: 'create', user: email, resource, status: 'unauthorized' },
                    message: 'Unauthorized create attempt',
                    data,
                });
                return res.status(STATUS_CODES.UNAUTHORIZED).json(
                    new APIError(STATUS_CODES.UNAUTHORIZED, "You do not have permission to add this data", [], false)
                );
            }


            let addData;
            if (modelName === "Order") {
                addData = await (prismaClient as any)[modelName].createMany({
                    data: data.map((item) => ({
                        ...item,
                        salesPersonId: userId,
                    })),
                    skipDuplicates: false,
                });
            } else {
                addData = await (prismaClient as any)[modelName].createMany({
                    data: data.map((item) => ({
                        ...item,
                        pocId: userId,
                    })),
                    skipDuplicates: false,
                });
            }

            logger.info({
                labels: { action: 'create', user: email, resource, status: 'success' },
                message: 'Create successful',
                data,
            });

            return res.status(STATUS_CODES.OK).json(
                new APIResponse(STATUS_CODES.OK, "Data added successfully", {}, true)
            );
        } catch (error: any) {
            logger.error({
                labels: { action: 'create', user: req.user?.email || 'unknown', resource: req.params.resource, status: 'failed' },
                message: 'Create failed',
                data: req.body,
                error: error.message,
            });
            console.error("Error in createData:", error);
            return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
                new APIError(STATUS_CODES.INTERNAL_SERVER_ERROR, error.message, [], false)
            );
        }
    },
};



