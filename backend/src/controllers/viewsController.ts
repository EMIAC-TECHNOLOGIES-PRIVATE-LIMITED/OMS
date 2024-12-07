import { Response } from 'express';
import prismaClient from '../utils/prismaClient';
import { AuthRequest } from '../types/sitesDataTypes';
import JSONbig from 'json-bigint';

export const viewsController = {
    getView: async (req: AuthRequest, res: Response): Promise<Response> => {

        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;

        const skip = (page - 1) * pageSize;
        const take = pageSize;
        const view = req.view;
        const permittedColumns = req.permittedColumns!;
        const columnTypes = req.columnTypes!;
        const userViews = req.userViews!;
        const modelName = req.modelName;

        if (!modelName) {
            return res.status(502).json({ 'message': "Bad request: Model name missing" });
        }

        // Validate view columns
        const viewColumns = view.columns.filter((col: string) => permittedColumns.includes(col));

        // Sanitize filters, sorting, and grouping
        const sanitizedFilters = sanitizeFilters(view.filters, permittedColumns);
        const sanitizedSorting = sanitizeSorting(view.sort, permittedColumns);
        const sanitizedGrouping = view.grouping
            ? view.grouping.filter((col: string) => permittedColumns.includes(col))
            : [];

        // Build Prisma query
        const selectClause = viewColumns.reduce(
            (acc: any, col: string) => ({ ...acc, [col]: true }),
            {}

        );

        const queryOptions = {
            where: sanitizedFilters,
            select: selectClause,
            orderBy: sanitizedSorting,
            skip,
            take
        };
        let totalRecords;
        try {
            // Fetch data
            let data;
            if (view.groupBy.length > 0) {
                // Use groupBy
                const rawData = await (prismaClient as any)[modelName].groupBy({
                    by: view.groupBy,
                    where: sanitizedFilters,
                    orderBy: sanitizedSorting,
                });

                // Transform the raw data into the desired structure
                const groupedData = rawData.reduce((acc: Record<string, any[]>, currentItem: any) => {
                    const groupByValue = currentItem[view.groupBy[0]]; // Assuming a single column for groupBy
                    if (!acc[groupByValue]) {
                        acc[groupByValue] = [];
                    }
                    acc[groupByValue].push(currentItem);
                    return acc;
                }, {});

                data = groupedData;
            }
            else {
                // Use findMany
                const results = await (prismaClient as any)[modelName].aggregate({
                    _count: { _all: true },
                    where: queryOptions.where
                });
                data = await (prismaClient as any)[modelName].findMany(queryOptions);

                totalRecords = results._count._all;
            }


            // Prepare response
            const response = {
                success: true,
                viewId: req.view,
                totalRecords,
                page,
                pageSize,
                data,
                availableColumns: columnTypes,
                appliedFilters: sanitizedFilters,
                appliedSorting: view.sort,
                appliedGrouping: sanitizedGrouping,
                views: userViews,
            };

            const parsedResponse = JSONbig.stringify(response);

            return res.type('application/json').send(parsedResponse);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: 'Error fetching data' });
        }
    },

    getData: async (req: AuthRequest, res: Response): Promise<Response> => {
        const { column, value } = req.query

        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;

        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const permittedColumns = req.permittedColumns!;
        const columnTypes = req.columnTypes!;
        const userViews = req.userViews!;
        const modelName = req.modelName;

        if (!modelName) {
            return res.status(400).json({ message: "Bad request: Model name missing" });
        }

        if (column && value) {
            try {
                const typeAheadFilter = {
                    [column as string]: {
                        contains: value,
                        mode: 'insensitive'
                    }
                }

                const results = await (prismaClient as any)[modelName].findMany({
                    where: typeAheadFilter,
                    select: { [column as string]: true },
                    take: 10
                });

                return res.json({
                    success: true,
                    data: results
                })
            } catch (e) {
                console.log(e);
                return res.status(500).json({ success: false, message: `Error Fetching the typeAhead Suggestions,  ${e}` });
            }
        }

        // Get filter configurations from req.body
        const { viewName, columns, filters, sorting, grouping } = req.body;

        // Validate columns
        const validColumns = columns.filter((col: string) => permittedColumns.includes(col));
        if (validColumns.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid columns provided' });
        }

        // Sanitize filters, sorting, and grouping
        const sanitizedFilters = sanitizeFilters(filters, permittedColumns);
        const sanitizedSorting = sanitizeSorting(sorting, permittedColumns);
        const sanitizedGrouping = grouping
            ? grouping.filter((col: string) => permittedColumns.includes(col))
            : [];

        // Build Prisma query
        const selectClause = validColumns.reduce(
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

        let totalRecords;
        try {
            let data;
            if (sanitizedGrouping.length > 0) {
                // Use groupBy
                const rawData = await (prismaClient as any)[modelName].groupBy({
                    by: sanitizedGrouping,
                    where: sanitizedFilters,
                    orderBy: sanitizedSorting,
                    skip,
                    take,
                });

                // Transform the raw data into the desired structure
                const groupedData = rawData.reduce((acc: Record<string, any[]>, currentItem: any) => {
                    const groupByValue = currentItem[sanitizedGrouping[0]]; // Assuming a single column for groupBy
                    if (!acc[groupByValue]) {
                        acc[groupByValue] = [];
                    }
                    acc[groupByValue].push(currentItem);
                    return acc;
                }, {});

                data = groupedData;
                // For grouped data, you might need a different way to count total records
                totalRecords = Object.keys(groupedData).length;
            } else {
                // Use findMany
                const results = await (prismaClient as any)[modelName].aggregate({
                    _count: { _all: true },
                    where: queryOptions.where,
                });
                data = await (prismaClient as any)[modelName].findMany(queryOptions);
                console.log(`select clause recieved is `, selectClause)
                console.log(`data fetched is `, data)  
                totalRecords = results._count._all;
            }

            // Prepare response
            const response = {
                success: true,
                totalRecords,
                page,
                pageSize,
                data,
                availableColumns: columnTypes,
                appliedFilters: sanitizedFilters,
                appliedSorting: sanitizedSorting,
                appliedGrouping: sanitizedGrouping,
                views: userViews,
            };

            const parsedResponse = JSONbig.stringify(response);

            return res.type('application/json').send(parsedResponse);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: 'Error fetching data', error, });
        }
    },

    // Create a new view
    createView: async (req: AuthRequest, res: Response): Promise<Response> => {
        const { resource } = req.params;
        const userId = req.user?.userId!;
        const permittedColumns = req.permittedColumns!;
        const { viewName, columns, filters, sorting, grouping } = req.body;

        // Validate columns
        const validColumns = columns.filter((col: string) => permittedColumns.includes(col));
        if (validColumns.length !== columns.length) {
            return res.status(400).json({ success: false, message: 'Invalid columns in view' });
        }

        // Sanitize filters, sorting, and grouping
        const sanitizedFilters = sanitizeFilters(filters, permittedColumns);
        const sanitizedSorting = sanitizeSorting(sorting, permittedColumns);
        const sanitizedGrouping = grouping
            ? grouping.filter((col: string) => permittedColumns.includes(col))
            : [];

        try {
            // Create the new view in the database
            const newView = await prismaClient.view.create({
                data: {
                    userId,
                    tableId: resource,
                    viewName,
                    columns: validColumns,
                    filters: sanitizedFilters,
                    sort: sanitizedSorting,
                    groupBy: sanitizedGrouping
                },
            });

            // Assign the newly created view to req.view for further processing
            req.view = newView;

            // Invoke getView to fetch and return the data based on the new view
            req.userViews = await prismaClient.view.findMany({ where: { userId } });
            const getViewResponse = await viewsController.getView(req, res);
            return getViewResponse;
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: 'Error creating view' });
        }
    },

    // Update an existing view or create a new "Untitled Grid" view if no id is provided
    updateView: async (req: AuthRequest, res: Response): Promise<Response> => {
        const { viewId } = req.params;
        const userId = req.user?.userId!;
        const permittedColumns = req.permittedColumns!;
        const { viewName, columns, filters, sorting, grouping } = req.body;

        if (!viewId) {
            // No viewId provided, create a new "Untitled Grid" view
            try {
                const newView = await prismaClient.view.create({
                    data: {
                        userId,
                        tableId: req.params.resource, // Assuming 'resource' is available in params
                        viewName: 'Untitled Grid',
                        columns: columns.filter((col: string) => permittedColumns.includes(col)),
                        filters: sanitizeFilters(filters, permittedColumns),
                        sort: sanitizeSorting(sorting, permittedColumns),
                        groupBy: grouping ? grouping.filter((col: string) => permittedColumns.includes(col)) : [],
                    },
                });

                // Fetch data for the newly created view
                req.view = newView;
                const getViewResponse = await viewsController.getView(req, res);
                return getViewResponse;
            } catch (error) {
                console.error(error);
                return res.status(500).json({ success: false, message: 'Error creating Untitled Grid view' });
            }
        }

        // If viewId is provided, proceed with the existing update logic
        // Validate columns
        const validColumns = columns.filter((col: string) => permittedColumns.includes(col));
        if (validColumns.length !== columns.length) {
            return res.status(400).json({ success: false, message: 'Invalid columns in view' });
        }

        // Sanitize filters and sorting
        const sanitizedFilters = sanitizeFilters(filters, permittedColumns);
        const sanitizedSorting = sanitizeSorting(sorting, permittedColumns);
        const sanitizedGrouping = grouping
            ? grouping.filter((col: string) => permittedColumns.includes(col))
            : [];

        try {
            // Verify ownership
            const view = await prismaClient.view.findUnique({ where: { id: parseInt(viewId) } });
            if (!view || view.userId !== userId) {
                return res.status(404).json({ success: false, message: 'View not found or access denied' });
            }

            const updatedView = await prismaClient.view.update({
                where: { id: parseInt(viewId) },
                data: {
                    viewName,
                    columns: validColumns,
                    filters: sanitizedFilters,
                    sort: sanitizedSorting,
                    groupBy: sanitizedGrouping,
                },
            });

            // Fetch data for the updated view
            req.view = updatedView;
            req.userViews = await prismaClient.view.findMany({ where: { userId } });
            const getViewResponse = await viewsController.getView(req, res);
            return getViewResponse;
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: 'Error updating view' });
        }
    },

    // Delete a view
    deleteView: async (req: AuthRequest, res: Response): Promise<Response> => {
        const { viewId } = req.params;
        const userId = req.user?.userId!;

        try {
            // Verify ownership before deletion
            const view = await prismaClient.view.findUnique({ where: { id: parseInt(viewId) } });
            if (!view || view.userId !== userId) {
                return res.status(404).json({ success: false, message: 'View not found or access denied' });
            }

            await prismaClient.view.delete({
                where: { id: parseInt(viewId) },
            });
            return res.status(200).json({ success: true, message: 'View deleted successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: 'Error deleting view' });
        }
    },
};

// Helper functions to sanitize filters and sorting
function sanitizeFilters(filters: any, permittedColumns: string[]): any {
    if (!filters || typeof filters !== 'object') return {};

    function sanitize(obj: any): any {
        if (Array.isArray(obj)) {
            return obj.map(sanitize);
        } else if (typeof obj === 'object' && obj !== null) {
            const sanitizedObj: any = {};
            for (const key in obj) {
                if (['AND', 'OR', 'NOT'].includes(key)) {
                    sanitizedObj[key] = sanitize(obj[key]);
                } else if (permittedColumns.includes(key)) {
                    sanitizedObj[key] = obj[key];
                }
            }
            return sanitizedObj;
        }
        return obj;
    }

    return sanitize(filters);
}

function sanitizeSorting(sorting: any, permittedColumns: string[]): any[] {
    if (!Array.isArray(sorting)) return [];

    function sanitize(obj: any): any[] {
        const sanitizedArray: any[] = [];

        for (const sortItem of obj) {
            if (typeof sortItem === 'object' && sortItem !== null) {
                const sanitizedItem: any = {};
                for (const key in sortItem) {
                    if (permittedColumns.includes(key)) {
                        const direction = sortItem[key];
                        if (direction === 'asc' || direction === 'desc') {
                            sanitizedItem[key] = direction;
                        }
                    }
                }
                if (Object.keys(sanitizedItem).length > 0) {
                    sanitizedArray.push(sanitizedItem);
                }
            }
        }

        return sanitizedArray;
    }

    return sanitize(sorting);
}
