import { Response } from 'express';
import { prismaClient } from '../utils/prismaClient';
import { AuthRequest } from '../types/sitesDataTypes';
import STATUS_CODES from '../constants/statusCodes';
import { APIError, APIResponse } from '../utils/apiHandler';
import { CreateViewResponse, GetFilteredDataResponse, GetViewDataResponse } from '@shared/types';
import { transformDates } from '../utils/dateTransformer';
import { PrismaModelInfo } from '../utils/prismaModelInfo';
import { secondaryQueryBuilder } from '../utils/queryBuilder';
import { flattenData } from '../utils/flatData';
import { columnDescriptions } from '../constants/columnDefinations';



const modelInfo = new PrismaModelInfo();

export const viewsController = {
    getView: async (req: AuthRequest, res: Response): Promise<Response> => {
        const page = parseInt(req.query.page as string, 10) || 1;
        const pageSize = parseInt(req.query.pageSize as string, 10) || 25;

        if (pageSize > 100) {
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json(
                    new APIError(
                        STATUS_CODES.BAD_REQUEST,
                        "Bad request: Page size cannot be greater than 100",
                        [],
                        false
                    ).toJSON()
                );
        }

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

        if (req.user?.role.name !== 'Admin') {
            const accessIds = [...(req.user?.userAccess || []), req.user?.userId];

            if (modelName === 'Client') {
                query.where = {
                    pocId: {
                        in: accessIds
                    }
                };
                query2.where = {
                    pocId: {
                        in: accessIds
                    }
                };
            }

            if (modelName === 'Order') {
                query.where = {
                    salesPersonId:
                    {
                        in: accessIds
                    }
                };
                query2.where = {
                    salesPersonId: {
                        in: accessIds
                    }
                };
            }
        }

        try {
            const [data, filteredCount, totalCount] = await Promise.all([
                (prismaClient as any)[modelName].findMany({
                    ...query,
                    skip,
                    take,
                }),
                (prismaClient as any)[modelName].count({
                    ...query2,
                }),
                (prismaClient as any)[modelName].count(),
            ]);

            let columnTypes = modelInfo.getModelColumns(modelName);

            const availableColumnsType = Object.fromEntries(
                Object.entries(columnTypes).filter(([key]) => permittedColumns.includes(key))
            );

            const flatCols = Object.keys(availableColumnsType).reduce((acc, key) => {
                const newKey = key.charAt(0).toLowerCase() + key.slice(1);
                acc[newKey] = availableColumnsType[key];
                return acc;
            }, {} as Record<string, string>);

            // console.log('[getView controller] : permitted columns are : ', permittedColumns)
            // console.log('[getView controller] : columnTypes are : ', columnTypes)
            // console.log('[getView controller] : available columns type are : ', availableColumnsType)
            // console.log('[getView controller] : flat columns are : ', flatCols)

            const flatData = flattenData(data, modelName.toLowerCase(), flatCols);

            const columnDefinations = Object.entries(columnDescriptions)
                .filter(([key]) => key in flatCols)
                .reduce((acc, [key, value]) => {
                    acc[key] = value;
                    return acc;
                }, {} as Record<string, any>);

            const response = {
                viewId: view.id,
                viewName: view.viewName,
                filteredCount,
                totalCount,
                page,
                pageSize,
                data: flatData,
                availableColumnsType: flatCols,
                columnDefinations,
                appliedFilters: view.filterConfig,
                views: userViews,
            } as GetViewDataResponse['data'];

            const transformedResponse = transformDates(response);

            return res
                .status(STATUS_CODES.OK)
                .json(new APIResponse(STATUS_CODES.OK, "Data fetched successfully", transformedResponse, true));
        } catch (error: any) {
            console.error(error);

            return res
                .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
                .json(
                    new APIError(
                        STATUS_CODES.INTERNAL_SERVER_ERROR,
                        "Error fetching data",
                        [error.message || error],
                        false
                    ).toJSON()
                );
        }
    },

    getData: async (req: AuthRequest, res: Response): Promise<Response> => {
        const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 10;

        if (pageSize > 100) {
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json(
                    new APIError(
                        STATUS_CODES.BAD_REQUEST,
                        "Bad request: Page size cannot be greater than 100",
                        [],
                        false
                    ).toJSON()
                );
        }

        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const { modelName, permittedColumns } = req;
        const filterConfig = req.body.appliedFilters;


        if (!modelName || !permittedColumns || !filterConfig) {

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
        // console.log('[getData controller] : query from secondary query builder is  : ', query)

        const query2 = secondaryQueryBuilder(modelName, permittedColumns, filterConfig, true);

        if (req.user?.role.name !== 'Admin') {
            const accessIds = [...(req.user?.userAccess || []), req.user?.userId];
            if (modelName === 'Client') {
                query.where = {
                    pocId: {
                        in: accessIds
                    }
                };
                query2.where = {
                    pocId: {
                        in: accessIds
                    }
                };

            }

            if (modelName === 'Order') {
                query.where = {
                    salesPersonId:
                    {
                        in: accessIds
                    }
                };
                query2.where = {
                    salesPersonId: {
                        in: accessIds
                    }
                };

            }
        }

        // const rawSQL = convertToSQL(modelName, query, {
        //     limit: take,
        //     offset: skip
        // });
        // const countSQL = convertToCountSQL(modelName, query);

        try {
            // const data = await prismaClient.$queryRawUnsafe(rawSQL);
            // const totalRecords = await prismaClient.$queryRawUnsafe(countSQL);
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
            const flatCols = Object.keys(availableColumnsType).reduce((acc, key) => {
                const newKey = key.charAt(0).toLowerCase() + key.slice(1);
                acc[newKey] = availableColumnsType[key];
                return acc;
            }, {} as Record<string, string>);
          
            const flatData = flattenData(data, modelName.toLowerCase(), flatCols);
            const response = {
        
                filteredCount: totalRecords,
                data: flatData,
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
                    filterConfig: filterConfig || {}
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
        const view = req.body
        console.log('[delete view controller] : called with body, ', req.body)
        console.log('[delete view controller] : called with view id, ', view.viewId)

        try {
            await prismaClient.view.delete({
                where: { id: view.viewId },
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

/**
 * Flattens an array of objects and then reorders each flattened object’s keys
 * so they follow the order defined in availableColumnsType.
 *
 * @param data - Array of objects to flatten.
 * @param resource - The resource name to prefix top-level keys.
 * @param availableColumnsType - A reference object whose keys define the desired order.
 * @returns An array of flattened objects with keys sorted according to availableColumnsType.
 */
