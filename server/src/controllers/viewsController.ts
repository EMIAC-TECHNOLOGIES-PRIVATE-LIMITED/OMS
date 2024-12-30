import { Response } from 'express';
import { prismaClient } from '../utils/prismaClient';
import { AuthRequest } from '../types/sitesDataTypes';
import { tableDataTypes } from '../constants/tableDataTypes';
import STATUS_CODES from '../constants/statusCodes';
import { APIError, APIResponse } from '../utils/apiHandler';
import { CreateViewResponse, DeleteViewResponse, GetFilteredDataResponse, GetViewDataResponse, UpdateViewResponse } from '@shared/types';

export const viewsController = {
    getView: async (req: AuthRequest, res: Response): Promise<Response> => {
        const page = parseInt(req.query.page as string, 10) || 1;
        const pageSize = parseInt(req.query.pageSize as string, 10) || 25;
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const { view, permittedColumns, userViews, modelName } = req;

        if (!modelName) {
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json(
                    new APIError(
                        STATUS_CODES.BAD_REQUEST,
                        "Bad request: Model name missing",
                        [],
                        false
                    ).toJSON()
                );
        }

        const columnTypes = tableDataTypes[modelName] || {};

        const availableColumnsType = permittedColumns?.reduce((acc, col) => {
            acc[col] = columnTypes[col] || 'String';
            return acc;
        }, {} as { [key: string]: string });

        const viewColumns = view.columns.filter((col: string) =>
            permittedColumns?.includes(col)
        );

        const sanitizedFilters = sanitizeFilters(
            view.filters,
            permittedColumns || []
        );

        const sanitizedSorting = Array.isArray(view.sort)
            ? sanitizeSorting(view.sort, permittedColumns || [])
            : [];

        const selectClause: string[] = viewColumns.reduce(
            (acc: any, col: string) => ({ ...acc, [col]: true }),
            {}
        );

        const queryOptions = {
            where: sanitizedFilters,
            select: selectClause,
            orderBy: sanitizedSorting,
            skip,
            take,
        };

        try {
            const totalRecords = await (prismaClient as any)[modelName].count({
                where: queryOptions.where,
            });

            const data = await (prismaClient as any)[modelName].findMany(
                queryOptions
            );

            const response = {
                viewId: view.id,
                viewName: view.viewName,
                totalRecords,
                page,
                pageSize,
                data,
                availableColumns: permittedColumns,
                availableColumnsType,
                appliedFilters: sanitizedFilters,
                appliedSorting: sanitizedSorting,
                column: selectClause,
                views: userViews,
            } as GetViewDataResponse['data'];

            return res
                .status(STATUS_CODES.OK)
                .json(new APIResponse(STATUS_CODES.OK, "Data fetched successfully", response, true));
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


    getTypeAhead: async (req: AuthRequest, res: Response): Promise<Response> => {
        const { column, value } = req.query;
        const { resource } = req.params;


        if (!resource) {
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json(new APIError(STATUS_CODES.BAD_REQUEST, "Bad request: Resource is missing", [], false).toJSON());
        }

        const modelName = resource.charAt(0).toUpperCase() + resource.slice(1).toLowerCase();

        if (!column || !value) {
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json(new APIError(STATUS_CODES.BAD_REQUEST, "Missing column or value for typeahead", [], false).toJSON());
        }

        try {
            const typeAheadFilter = {
                [column as string]: {
                    contains: value,
                    mode: 'insensitive',
                },
            };

            const results = await (prismaClient as any)[modelName].findMany({
                where: typeAheadFilter,
                select: { [column as string]: true },
                take: 10,
            });

            return res
                .status(STATUS_CODES.OK)
                .json(new APIResponse(STATUS_CODES.OK, "Typeahead data fetched", results, true));
        } catch (error) {
            console.error(error);
            return res
                .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
                .json(new APIError(STATUS_CODES.INTERNAL_SERVER_ERROR, "Error fetching typeahead data", [error], false).toJSON());
        }
    },

    getData: async (req: AuthRequest, res: Response): Promise<Response> => {
        const { column, value } = req.query;

        const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 10;

        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const permittedColumns = req.permittedColumns!;
        const { modelName } = req;

        if (!modelName) {
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json(
                    new APIError(
                        STATUS_CODES.BAD_REQUEST,
                        "Bad request: Model name missing",
                        [],
                        false
                    ).toJSON()
                );
        }

        const columnTypes = permittedColumns.reduce((acc, col) => {
            acc[col] = tableDataTypes[modelName][col] || 'String';
            return acc;
        }, {} as { [key: string]: string });

        const userViews = req.userViews!;
        const { columns, filters, sorting } = req.body;

        const validColumns = columns.filter((col: string) =>
            permittedColumns.includes(col)
        );
        if (validColumns.length === 0) {
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json(
                    new APIError(
                        STATUS_CODES.BAD_REQUEST,
                        "No valid columns provided",
                        [],
                        false
                    ).toJSON()
                );
        }

        const sanitizedFilters = sanitizeFilters(filters, permittedColumns);
        const sanitizedSorting = sanitizeSorting(sorting, permittedColumns);

        const selectClause: string[] = validColumns.reduce(
            (acc: any, col: string) => ({ ...acc, [col]: true }),
            {}
        );

        const queryOptions = {
            where: sanitizedFilters,
            select: selectClause,
            orderBy: sanitizedSorting,
            skip,
            take,
        };

        try {
            const totalRecords = await (prismaClient as any)[modelName].count({
                where: queryOptions.where,
            });

            const data = await (prismaClient as any)[modelName].findMany(queryOptions);

            const response = {
                totalRecords,
                page,
                pageSize,
                data,
                availableColumns: Object.keys(columnTypes),
                availableColumnsType: columnTypes,
                appliedFilters: sanitizedFilters,
                appliedSorting: sanitizedSorting,
                column: selectClause,
                views: userViews,
            } as GetFilteredDataResponse['data'];

            return res
                .status(STATUS_CODES.OK)
                .json(new APIResponse(STATUS_CODES.OK, "Data fetched successfully", response, true));
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
        const permittedColumns = req.permittedColumns!;
        const { viewName, columns, filters, sorting } = req.body;
        const { modelName } = req;

        if (!modelName) {
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json(new APIError(STATUS_CODES.BAD_REQUEST, "Bad request: Model name missing", [], false).toJSON());
        }



        const validColumns = columns.filter((col: string) => permittedColumns.includes(col));
        if (validColumns.length !== columns.length) {
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json(new APIError(STATUS_CODES.BAD_REQUEST, "Invalid columns in view", [], false).toJSON());
        }

        const sanitizedFilters = sanitizeFilters(filters, permittedColumns);
        const sanitizedSorting = sanitizeSorting(sorting, permittedColumns);

        try {
            // Create the new view
            const newView = await prismaClient.view.create({
                data: {
                    userId,
                    tableId: resource,
                    viewName,
                    columns: validColumns,
                    filters: sanitizedFilters,
                    sort: sanitizedSorting,
                },
            });

            // Re-fetch userViews so we can populate the "views" field in our response
            req.userViews = await prismaClient.view.findMany({
                where: {
                    userId,
                    tableId: resource
                }
            });



            const response: CreateViewResponse['data'] = {
                viewId: newView.id,
                views: req.userViews.map((v) => ({ id: v.id, viewName: v.viewName })),
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

        const { viewId } = req.params;
        const userId = req.user?.userId!;
        const permittedColumns = req.permittedColumns!;
        const { viewName, columns, filters, sorting } = req.body;
        const { modelName } = req;
        const { resource } = req.params;

        if (!modelName) {
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json(new APIError(STATUS_CODES.BAD_REQUEST, "Bad request: Model name missing", [], false).toJSON());
        }


        const validColumns = columns.filter((col: string) => permittedColumns.includes(col));
        if (validColumns.length !== columns.length) {
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json(new APIError(STATUS_CODES.BAD_REQUEST, "Invalid columns in view", [], false).toJSON());
        }

        const sanitizedFilters = sanitizeFilters(filters, permittedColumns);
        const sanitizedSorting = sanitizeSorting(sorting, permittedColumns);

        try {
            // Check if the view exists and belongs to the correct user
            const existingView = await prismaClient.view.findUnique({ where: { id: parseInt(viewId, 10) } });
            if (!existingView || existingView.userId !== userId) {
                return res
                    .status(STATUS_CODES.NOT_FOUND)
                    .json(new APIError(STATUS_CODES.NOT_FOUND, "View not found or access denied", [], false).toJSON());
            }

            // Update the view with new parameters
            const updatedView = await prismaClient.view.update({
                where: { id: parseInt(viewId, 10) },
                data: {
                    viewName,
                    columns: validColumns,
                    filters: sanitizedFilters,
                    sort: sanitizedSorting,
                },
            });

            // Re-fetch userViews so we can populate the "views" field in our response
            const views = await prismaClient.view.findMany({
                where: {
                    userId,
                    tableId: resource
                }
            });


            // Shape the response per UpdateViewResponse interface
            const response: UpdateViewResponse['data'] = {
                views: views.map((v) => ({ id: v.id, viewName: v.viewName })),
            };

            return res
                .status(STATUS_CODES.OK)
                .json(new APIResponse(STATUS_CODES.OK, "View updated successfully", response, true));
        } catch (error) {
            console.error(error);
            return res
                .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
                .json(new APIError(STATUS_CODES.INTERNAL_SERVER_ERROR, "Error updating view", [error], false).toJSON());
        }
    },


    deleteView: async (req: AuthRequest, res: Response): Promise<Response> => {
        const { viewId } = req.params;
        const userId = req.user?.userId!;
        const { resource } = req.params;

        try {
            const view = await prismaClient.view.findUnique({ where: { id: parseInt(viewId, 10) } });
            if (!view || view.userId !== userId) {
                return res
                    .status(STATUS_CODES.NOT_FOUND)
                    .json(new APIError(STATUS_CODES.NOT_FOUND, "View not found or access denied", [], false).toJSON());
            }

            await prismaClient.view.delete({
                where: { id: parseInt(viewId, 10) },
            });

            const reponse: DeleteViewResponse['data'] = {
                views: await prismaClient.view.findMany({
                    where: {
                        userId,
                        tableId: resource
                    }
                }),
            }

            return res
                .status(STATUS_CODES.OK)
                .json(new APIResponse(STATUS_CODES.OK, "View deleted successfully", reponse, true));
        } catch (error) {
            console.error(error);
            return res
                .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
                .json(new APIError(STATUS_CODES.INTERNAL_SERVER_ERROR, "Error deleting view", [error], false).toJSON());
        }
    },
};

function sanitizeFilters(filters: any, permittedColumns: string[]): any {
    if (!filters || typeof filters !== 'object') return {};

    const operators = ['AND', 'OR'];
    const keys = Object.keys(filters);

    if (keys.length !== 1 || !operators.includes(keys[0])) {
        return {};
    }

    const operator = keys[0];
    const conditions = filters[operator];

    if (!Array.isArray(conditions)) {
        return {};
    }

    const filteredConditions = conditions.filter((cond: any) => {
        const field = Object.keys(cond)[0];
        return permittedColumns.includes(field);
    });

    if (filteredConditions.length === 0) {
        return {};
    }

    return { [operator]: filteredConditions };
}

function sanitizeSorting(sorting: any, permittedColumns: string[]): any[] {
    if (!Array.isArray(sorting)) return [];

    return sorting.filter((sortItem: any) => {
        const field = Object.keys(sortItem)[0];
        const direction = sortItem[field];
        return permittedColumns.includes(field) && (direction === 'asc' || direction === 'desc');
    });
}
