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
                console.log(permission.name);
                return permission.name === `_update_${resource}`
            });



            if (!hasPermission) {
                return res.status(STATUS_CODES.UNAUTHORIZED).
                    json(new APIError(STATUS_CODES.UNAUTHORIZED, "You do not have permission to update this data", [], false))
            }

            const updateData = await (prismaClient as any)[modelName].update({
                where: {
                    id: data.id
                },
                data: data
            });

            return res.status(STATUS_CODES.OK).json(new APIResponse(STATUS_CODES.OK, "Data updated successfully", updateData, true));
        } catch (error: any) {
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
    }
}

