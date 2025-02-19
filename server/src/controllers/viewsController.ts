import { Response } from 'express';
import { prismaClient } from '../utils/prismaClient';
import { AuthRequest } from '../types/sitesDataTypes';
import STATUS_CODES from '../constants/statusCodes';
import { APIError, APIResponse } from '../utils/apiHandler';
import { CreateViewResponse, GetFilteredDataResponse, GetViewDataResponse, UpdateViewResponse } from '@shared/types';
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

            // convert the first letter of the object keys to lowercase in availableColumnsType
            const flatCols = Object.keys(availableColumnsType).reduce((acc, key) => {
                const newKey = key.charAt(0).toLowerCase() + key.slice(1);
                acc[newKey] = availableColumnsType[key];
                return acc;
            }, {} as Record<string, string>);


            const flatData = flattenData(data, modelName.toLowerCase(), flatCols);



            const response = {
                viewId: view.id,
                viewName: view.viewName,
                filteredCount,
                totalCount,
                page,
                pageSize,
                data: flatData,
                availableColumnsType: flatCols,
                appliedFilters: view.filterConfig,
                views: userViews,
            } as GetViewDataResponse['data'];

            const transformedResponse = transformDates(response);

            return res
                .status(STATUS_CODES.OK)
                .json(new APIResponse(STATUS_CODES.OK, "Data fetched successfully", transformedResponse, true));
        } catch (error: any) {

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
        // console.log('[getData controller] : req body for filter config recieved is : ', req.body)
        const filterConfig = req.body.appliedFilters;

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
        // console.log('[getData controller] : query from secondary query builder is  : ', query)

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
const flattenData = (
    data: Object[],
    resource: string,
    availableColumnsType: Record<string, any>
): Record<string, any>[] => {

    const flattenObject = (obj: Object, prefix: string = ''): Record<string, any> => {
        return Object.entries(obj).reduce((acc: Record<string, any>, [key, value]) => {
            const newKey = prefix ? `${prefix}.${key}` : key;



            if (value === null) {
                acc[newKey] = null;
            } else if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
                Object.assign(acc, flattenObject(value, newKey));
            } else {
                acc[newKey] = value;
            }

            return acc;
        }, {});
    };

    const sortObjectKeysByReference = (
        subset: Record<string, any>,
        reference: Record<string, any>
    ): Record<string, any> => {
        const sorted: Record<string, any> = {};

        // // Debug before sorting
        // console.log('Before sorting - Date fields in subset:',
        //     Object.keys(subset).filter(k => k.includes('Date')));

        // First pass: handle keys that exist in reference
        for (const refKey of Object.keys(reference)) {
            if (Object.prototype.hasOwnProperty.call(subset, refKey)) {
                sorted[refKey] = subset[refKey];
            }
        }

        // Second pass: handle remaining keys from subset
        for (const key of Object.keys(subset)) {
            if (!Object.prototype.hasOwnProperty.call(sorted, key)) {
                sorted[key] = subset[key];
            }
        }

        // // Debug after sorting
        // console.log('After sorting - Date fields in result:',
        //     Object.keys(sorted).filter(k => k.includes('Date')));

        return sorted;
    };

    return data.map((obj) => {
        const flattened = flattenObject(obj);

        // // Debug flattened object
        // console.log('After flattening - Date fields:',
        //     Object.keys(flattened).filter(k => k.includes('Date')));

        const prefixed = Object.entries(flattened).reduce((acc: Record<string, any>, [key, value]) => {
            const newKey = key.includes('.') ? key : `${resource}.${key}`;
            acc[newKey] = value;
            return acc;
        }, {});

        // // Debug after prefixing
        // console.log('After prefixing - Date fields:',
        //     Object.keys(prefixed).filter(k => k.includes('Date')));

        const sorted = sortObjectKeysByReference(prefixed, availableColumnsType);
        return sorted;
    });
};