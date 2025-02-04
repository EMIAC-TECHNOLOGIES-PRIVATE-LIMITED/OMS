import { Response } from "express"
import STATUS_CODES from "../constants/statusCodes";
import { AuthRequest } from "../types/sitesDataTypes"
import { APIError, APIResponse } from "../utils/apiHandler";
import { getPermissionCached } from "../utils/getPermissions"
import { prismaClient } from "../utils/prismaClient";



export const dataController = {
    updateData: async (req: AuthRequest, res: Response): Promise<Response> => {

        try {
            const userId = req.user?.userId;
            const permissions = await getPermissionCached(userId!);
            const resource = req.params.resource;
            const data = req.body;
            const modelName = resource.charAt(0).toUpperCase() + resource.slice(1);


            const hasPermission = permissions.some((permission) => {
                console.log(permission.name === `_update_${resource}`)
                return permission.name === `_update_${resource}`
            });


            if (!hasPermission) {
                return res.status(STATUS_CODES.UNAUTHORIZED).
                    json(new APIError(STATUS_CODES.UNAUTHORIZED, "You do not have permission to update this data", [], false))
            }


            const id = data.id
            delete data.id;

            console.log("Recievd id is ", id);

            const updateData = await (prismaClient as any)[modelName].update({
                where: {
                    id,
                },
                data,

            });

            return res.status(STATUS_CODES.OK).json(new APIResponse(STATUS_CODES.OK, "Data updated successfully", updateData, true));
        } catch (error: any) {
            console.log(error)
            return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(new APIError(STATUS_CODES.INTERNAL_SERVER_ERROR, error.message, [], false))
        }


    },

    deleteData: async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const userId = req.user?.userId;
            const permissions = await getPermissionCached(userId!);
            const resource = req.params.resource;
            const modelName = resource.charAt(0).toUpperCase() + resource.slice(1);
            const data = req.body;

            const hasPermission = permissions.some((permission) => {
                return permission.name === `_delete_${resource}`
            })

            if (!hasPermission) {
                return res.status(STATUS_CODES.UNAUTHORIZED).
                    json(new APIError(STATUS_CODES.UNAUTHORIZED, "You do not have permission to delete this data", [], false))
            }


            const deleteData = await (prismaClient as any)[modelName].delete({
                where: { id: data.id }
            });

            return res.status(STATUS_CODES.OK).json(new APIResponse(STATUS_CODES.OK, "Data deleted successfully", deleteData, true));

        } catch (error: any) {
            return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(new APIError(STATUS_CODES.INTERNAL_SERVER_ERROR, error.message, [], false))

        }
    },

    createData: async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const userId = req.user?.userId;

            // Ensure userId is present
            if (!userId) {
                return res.status(STATUS_CODES.UNAUTHORIZED)
                    .json(new APIError(STATUS_CODES.UNAUTHORIZED, "User not authenticated", [], false));
            }

            const permissions = await getPermissionCached(userId);
            const resource = req.params.resource;
            const modelName = resource.charAt(0).toUpperCase() + resource.slice(1);
            const data: Record<string, any>[] = req.body;

            // Validate that data is an array
            if (!Array.isArray(data)) {
                return res.status(STATUS_CODES.BAD_REQUEST)
                    .json(new APIError(STATUS_CODES.BAD_REQUEST, "Data should be an array of records", [], false));
            }

            // Check for create permission
            const hasPermission = permissions.some((permission) => {
                return permission.name === `_create_${resource}`;
            });

            if (!hasPermission) {
                return res.status(STATUS_CODES.UNAUTHORIZED)
                    .json(new APIError(STATUS_CODES.UNAUTHORIZED, "You do not have permission to add this data", [], false));
            }

            console.log("Received data for creation:", data);

            if (modelName === "Order") {
                const addData = await (prismaClient as any)[modelName].createMany({
                    data: data.map(( item ) => ({
                        ...item,
                        salesPersonId: userId,
                    })),
                    skipDuplicates: false,
                });
            } else {
                const addData = await (prismaClient as any)[modelName].createMany({
                    data: data.map(( item ) => ({
                        ...item,
                        pocId: userId,
                    })),
                    skipDuplicates: false,
                });
            }

            return res.status(STATUS_CODES.OK)
                .json(new APIResponse(STATUS_CODES.OK, "Data added successfully", {}, true));

        } catch (error: any) {
            console.error("Error in createData:", error);
            return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR)
                .json(new APIError(STATUS_CODES.INTERNAL_SERVER_ERROR, error.message, [], false));
        }
    },
}

