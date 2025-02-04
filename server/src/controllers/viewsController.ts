import { Response } from 'express';
import { prismaClient } from '../utils/prismaClient';
import { AuthRequest } from '../types/sitesDataTypes';
import STATUS_CODES from '../constants/statusCodes';
import { APIError, APIResponse } from '../utils/apiHandler';
import { CreateViewResponse, DeleteViewResponse, FilterConfig, GetFilteredDataResponse, GetViewDataResponse, UpdateViewResponse } from '@shared/types';
import { transformDates } from '../utils/dateTransformer';
import { PrismaModelInfo } from '../utils/prismaModelInfo';
import { secondaryQueryBuilder } from '../utils/queryBuilder';


const modelInfo = new PrismaModelInfo();

export const viewsController = {
    getView: async (req: AuthRequest, res: Response): Promise<Response> => {
        const page = parseInt(req.query.page as string, 10) || 1;
        const pageSize = parseInt(req.query.pageSize as string, 10) || 25;
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const { view, permittedColumns, userViews, modelName } = req;

        if (!modelName || !view || !permittedColumns) {
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json(
                    new APIError(
                        STATUS_CODES.BAD_REQUEST,
                        "Bad request: Model name or permitted columns missing",
                        [],
                        false
                    ).toJSON()
                );
        }

        const query = secondaryQueryBuilder(modelName, permittedColumns, view.filterConfig);
        const query2 = secondaryQueryBuilder(modelName, permittedColumns, view.filterConfig, true);

        try {
            const [data, totalRecords] = await Promise.all([
                (prismaClient as any)[modelName].findMany({
                    ...query,
                    skip,
                    take,
                }),
                (prismaClient as any)[modelName].count({
                    ...query2,
                }),
            ]);

            let columnTypes = modelInfo.getModelColumns(modelName);

            const availableColumnsType = Object.fromEntries(
                Object.entries(columnTypes).filter(([key]) => permittedColumns.includes(key))
            );

            const response = {
                viewId: view.id,
                viewName: view.viewName,
                totalRecords,
                page,
                pageSize,
                data,
                availableColumnsType,
                appliedFilters: view.filterConfig,
                views: userViews,
            } as GetViewDataResponse['data'];

            const transformedResponse = transformDates(response);

            return res
                .status(STATUS_CODES.OK)
                .json(new APIResponse(STATUS_CODES.OK, "Data fetched successfully", transformedResponse, true));
        } catch (error: any) {
            console.log(`[getView] Error occurred while fetching view data: ${error instanceof Error ? error.message : error}`);
            return res
                .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
                .json(
                    new APIError(
                        STATUS_CODES.INTERNAL_SERVER_ERROR,
                        "Error fetching data",
                        [error],
                        false
                    ).toJSON()
                );
        }
    },



    getData: async (req: AuthRequest, res: Response): Promise<Response> => {

        const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 10;

        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const { modelName, permittedColumns } = req;
        const filterConfig = req.body;

        if (!modelName || !permittedColumns || !filterConfig) {
            console.log(`[getView] Bad request: Model name, view, or permitted columns missing.`);
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json(
                    new APIError(
                        STATUS_CODES.BAD_REQUEST,
                        "Bad request: Model name or permitted columns or filterConfig missing",
                        [],
                        false
                    ).toJSON()
                );
        }

        const query = secondaryQueryBuilder(modelName, permittedColumns, filterConfig);
        const query2 = secondaryQueryBuilder(modelName, permittedColumns, filterConfig, true);



        try {
            const [data, totalRecords] = await Promise.all([
                (prismaClient as any)[modelName].findMany({
                    ...query,
                    skip,
                    take,
                }),
                (prismaClient as any)[modelName].count({
                    ...query2,
                }),
            ]);

            // Reorder the columns in the data to match `permittedColumns`
            const orderedData = data.map((row: Record<string, any>) => {
                const orderedRow: Record<string, any> = {};
                permittedColumns.forEach((col) => {
                    if (col in row) {
                        orderedRow[col] = row[col];
                    }
                });
                return orderedRow;
            });

            const response = {
                totalRecords,
                data: data,
            } as GetFilteredDataResponse['data'];

            const transformedResponse = transformDates(response);

            return res
                .status(STATUS_CODES.OK)
                .json(new APIResponse(STATUS_CODES.OK, "Data fetched successfully", transformedResponse, true));
        } catch (error) {
            console.error(error);
            return res
                .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
                .json(
                    new APIError(
                        STATUS_CODES.INTERNAL_SERVER_ERROR,
                        "Error fetching data",
                        [error],
                        false
                    ).toJSON()
                );
        }
    },


    createView: async (req: AuthRequest, res: Response): Promise<Response> => {
        const { resource } = req.params;
        const userId = req.user?.userId!;
        const { viewName, filterConfig } = req.body;
        const { modelName } = req;

        if (!modelName) {
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json(new APIError(STATUS_CODES.BAD_REQUEST, "Bad request: Model name missing", [], false).toJSON());
        }


        try {
            const newView = await prismaClient.view.create({
                data: {
                    userId,
                    tableId: resource,
                    viewName,
                    filterConfig
                },
            });

            const views = await prismaClient.view.findMany({
                where: {
                    userId,
                    tableId: resource
                }
            });
            const response: CreateViewResponse['data'] = {
                newViewId: newView.id,
                views,
            };
            return res
                .status(STATUS_CODES.CREATED)
                .json(new APIResponse(STATUS_CODES.CREATED, "View created successfully", response, true));
        } catch (error) {
            console.error(error);
            return res
                .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
                .json(new APIError(STATUS_CODES.INTERNAL_SERVER_ERROR, "Error creating view", [error], false).toJSON());
        }
    },

    // update the view. 
    updateView: async (req: AuthRequest, res: Response): Promise<Response> => {


        const { viewName, filterConfig, viewId } = req.body;;

        try {


            const updatedView = await prismaClient.view.update({
                where: { id: parseInt(viewId, 10) },
                data: {
                    viewName,
                    filterConfig
                },
            });

            return res
                .status(STATUS_CODES.OK)
                .json(new APIResponse(STATUS_CODES.OK, "View updated successfully", {}, true));
        } catch (error) {
            console.error(error);
            return res
                .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
                .json(new APIError(STATUS_CODES.INTERNAL_SERVER_ERROR, "Error updating view", [error], false).toJSON());
        }
    },


    deleteView: async (req: AuthRequest, res: Response): Promise<Response> => {
        const viewId = req.body

        try {

            await prismaClient.view.delete({
                where: { id: parseInt(viewId, 10) },
            });

            return res
                .status(STATUS_CODES.OK)
                .json(new APIResponse(STATUS_CODES.OK, "View deleted successfully", {}, true));
        } catch (error) {
            console.error(error);
            return res
                .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
                .json(new APIError(STATUS_CODES.INTERNAL_SERVER_ERROR, "Error deleting view", [error], false).toJSON());
        }
    },
};

