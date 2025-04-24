import { Response } from "express"
import STATUS_CODES from "../constants/statusCodes";
import { AuthRequest } from "../types/sitesDataTypes"
import { APIError, APIResponse } from "../utils/apiHandler";
import { getPermissionCached } from "../utils/getPermissions"
import { prismaClient } from "../utils/prismaClient";
import logger from "../logger";
import siteCategories from "../constants/siteCategories";


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
            delete flatData.updatedAt;

            if (modelName === "Site") {
                if (flatData.categories && Array.isArray(flatData.categories)) {
                    const categories = flatData.categories;
                    delete flatData.categories;
                    const categoryIds = categories.map((category: any) => category.id);
                    flatData.categories = {
                        set: categoryIds.map((id: number) => ({ id })),
                    };
                }

            }

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

            return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
                new APIError(STATUS_CODES.INTERNAL_SERVER_ERROR, error.message, [], false)
            );
        }
    },

    updateOrder: async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const userId = req.user?.userId;
            const permission = await getPermissionCached(userId!);
            const data = req.body;

            const hasPermission = permission.some((permission) => {
                return permission.name === `_update_order`;
            });

            if (!hasPermission) {
                logger.warn({
                    labels: { action: 'update', user: req.user?.email, resource: 'order', status: 'unauthorized' },
                    message: 'Unauthorized update attempt',
                    data,
                });
                return res.status(STATUS_CODES.UNAUTHORIZED).json(
                    new APIError(STATUS_CODES.UNAUTHORIZED, "You do not have permission to update this data", [], false)
                );
            }


            const orderId = req.body['order.id'];
            const orderData = await prismaClient.order.findUnique({
                where: { id: orderId },
            });

            const updateData = await prismaClient.order.update({
                where: { id: orderId },
                data: {
                    orderStatus: "Order_Replaced"
                }
            });

            if (orderData) {
                const orderDataCopy = { ...orderData };
                delete (orderDataCopy as any).id;

                const newOrder = await prismaClient.order.create({
                    data: {
                        ...orderDataCopy,
                        siteId: req.body.siteId,
                        orderStatus: "Replacement",
                        publishDate: new Date(),
                        publishURL: "",
                        indexedScreenShotLink: "",
                    }
                });
                logger.info({
                    labels: { action: 'update', user: req.user?.email, resource: 'order', status: 'success' },
                    message: 'Update successful',
                    data,
                });

                return res.status(STATUS_CODES.OK).json(
                    new APIResponse(STATUS_CODES.OK, "Data updated successfully", newOrder, true)
                );
            } else {
                logger.warn({
                    labels: { action: 'update', user: req.user?.email, resource: 'order', status: 'failed' },
                    message: 'Order not found',
                    data,
                });
                return res.status(STATUS_CODES.NOT_FOUND).json(
                    new APIError(STATUS_CODES.NOT_FOUND, "Order not found", [], false)
                );
            }

        }
        catch (error: any) {
            logger.error({
                labels: { action: 'update', user: req.user?.email, resource: 'order', status: 'failed' },
                message: 'Update failed',
                data: req.body,
                error: error.message,
            });

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

            console.log("Data received for creation:", data);

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

            // Handle Order model special case
            if (modelName === "Order") {
                const maxOrderNumber = await prismaClient.order.findFirst({
                    orderBy: { orderNumber: "desc" },
                });

                addData = await (prismaClient as any)[modelName].createMany({
                    data: data.map((item) => ({
                        ...item,
                        salesPersonId: userId,
                        orderNumber: maxOrderNumber ? maxOrderNumber.orderNumber + 1 : 1,
                    })),
                    skipDuplicates: false,
                });

                logger.info({
                    labels: { action: 'create', user: email, resource, status: 'success' },
                    message: 'Create successful',
                    data,
                });

                return res.status(STATUS_CODES.OK).json(
                    new APIResponse(STATUS_CODES.OK, "Data added successfully", {
                        orderNumber: maxOrderNumber ? maxOrderNumber.orderNumber + 1 : 1
                    }, true)
                );
            }
            // Handle Site model special case
            else if (modelName === "Site") {
                // For sites, we need to handle the categories relationship
                // Since createMany doesn't support relations, we need to create records one by one
                const results = [];

                for (const item of data) {
                    const siteData = { ...item };
                    const categories = siteData.categories || [];

                    // Remove categories from the main data object since we'll handle it separately
                    delete siteData.categories;

                    // Create the site with connected categories
                    const result = await prismaClient.site.create({
                        //@ts-ignore
                        data: {
                            ...siteData,
                            pocId: userId,
                            // Connect existing categories using their IDs
                            categories: {
                                connect: categories.map((category: { id: number; category: string }) => ({
                                    id: category.id
                                }))
                            }
                        }
                    });

                    results.push(result);
                }

                addData = { count: results.length };

                logger.info({
                    labels: { action: 'create', user: email, resource, status: 'success' },
                    message: 'Create successful',
                    data,
                });

                return res.status(STATUS_CODES.OK).json(
                    new APIResponse(STATUS_CODES.OK, "Data added successfully", {
                        count: results.length
                    }, true)
                );
            }
            // Handle all other models
            else {
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
                new APIResponse(STATUS_CODES.OK, "Data added successfully", {
                }, true)
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

    getSiteCategories: async (req: AuthRequest, res: Response): Promise<Response> => {
        const data = siteCategories;
        return res.status(STATUS_CODES.OK).json(
            new APIResponse(STATUS_CODES.OK, "Success", { data }, true)
        );
    },
};



