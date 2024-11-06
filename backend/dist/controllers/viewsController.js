"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewsController = void 0;
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
const json_bigint_1 = __importDefault(require("json-bigint"));
exports.viewsController = {
    getView: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
        // console.log(req.query.page);
        // console.log(req.page);
        const skip = (page - 1) * pageSize;
        const take = pageSize;
        const view = req.view;
        const permittedColumns = req.permittedColumns;
        const columnTypes = req.columnTypes;
        const userViews = req.userViews;
        const modelName = req.modelName;
        if (!modelName) {
            return res.status(502).json({ 'message': "bad request" });
        }
        // Validate view columns
        const viewColumns = view.columns.filter((col) => permittedColumns.includes(col));
        // Sanitize filters, sorting, and grouping
        const sanitizedFilters = sanitizeFilters(view.filters, permittedColumns);
        const sanitizedSorting = sanitizeSorting(view.sorting, permittedColumns);
        const sanitizedGrouping = view.grouping
            ? view.grouping.filter((col) => permittedColumns.includes(col))
            : [];
        // Build Prisma query
        const selectClause = viewColumns.reduce((acc, col) => (Object.assign(Object.assign({}, acc), { [col]: true })), {});
        // console.log(view.sort);
        // console.log(permittedColumns);
        // console.log(sanitizedSorting);
        const queryOptions = {
            where: sanitizedFilters,
            select: selectClause,
            orderBy: view.sort,
            skip,
            take
        };
        let totalRecords;
        try {
            // Fetch data
            let data;
            if (view.groupBy.length > 0) {
                // Use groupBy
                const rawData = yield prismaClient_1.default[modelName].groupBy({
                    by: view.groupBy,
                    where: sanitizedFilters,
                    orderBy: sanitizedSorting,
                });
                // Transform the raw data into the desired structure
                const groupedData = rawData.reduce((acc, currentItem) => {
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
                const results = yield prismaClient_1.default[modelName].aggregate({
                    _count: { _all: true },
                    where: queryOptions.where
                });
                data = yield prismaClient_1.default[modelName].findMany(queryOptions);
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
                appliedSorting: view.sort,
                appliedGrouping: sanitizedGrouping,
                views: userViews,
            };
            const parsedResponse = json_bigint_1.default.stringify(response);
            return res.type('application/json').send(parsedResponse);
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: 'Error fetching data' });
        }
    }),
    // Create a new view
    createView: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { resource } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const permittedColumns = req.permittedColumns;
        const { viewName, columns, filters, sorting, grouping } = req.body;
        // Validate columns
        const validColumns = columns.filter((col) => permittedColumns.includes(col));
        if (validColumns.length !== columns.length) {
            return res.status(400).json({ success: false, message: 'Invalid columns in view' });
        }
        // Sanitize filters and sorting
        const sanitizedFilters = sanitizeFilters(filters, permittedColumns);
        const sanitizedSorting = sanitizeSorting(sorting, permittedColumns);
        const sanitizedGrouping = grouping
            ? grouping.filter((col) => permittedColumns.includes(col))
            : [];
        try {
            const newView = yield prismaClient_1.default.view.create({
                data: {
                    userId,
                    tableId: resource,
                    viewName,
                    columns: validColumns,
                    filters: sanitizedFilters,
                    sort: sanitizedSorting,
                    groupBy: sanitizedGrouping,
                },
            });
            return res.status(201).json({ success: true, view: newView });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: 'Error creating view' });
        }
    }),
    // Update an existing view
    updateView: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        const { viewId } = req.params;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
        const permittedColumns = req.permittedColumns;
        const { viewName, columns, filters, sorting, grouping } = req.body;
        // Validate columns
        const validColumns = columns.filter((col) => permittedColumns.includes(col));
        if (validColumns.length !== columns.length) {
            return res.status(400).json({ success: false, message: 'Invalid columns in view' });
        }
        // Sanitize filters and sorting
        const sanitizedFilters = sanitizeFilters(filters, permittedColumns);
        const sanitizedSorting = sanitizeSorting(sorting, permittedColumns);
        const sanitizedGrouping = grouping
            ? grouping.filter((col) => permittedColumns.includes(col))
            : [];
        try {
            //verify ownership
            const view = yield prismaClient_1.default.view.findUnique({ where: { id: parseInt(viewId) } });
            if (!view || view.userId !== userId) {
                return res.status(404).json({ success: false, message: 'View not found or access denied' });
            }
            const updatedView = yield prismaClient_1.default.view.update({
                where: { id: parseInt(viewId) },
                data: {
                    viewName,
                    columns: validColumns,
                    filters: sanitizedFilters,
                    sort: sanitizedSorting,
                    groupBy: sanitizedGrouping,
                },
            });
            return res.status(200).json({ success: true, view: updatedView });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: 'Error updating view' });
        }
    }),
    // Delete a view
    deleteView: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _c;
        const { viewId } = req.params;
        const userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.userId;
        try {
            // Verify ownership before deletion
            const view = yield prismaClient_1.default.view.findUnique({ where: { id: parseInt(viewId) } });
            if (!view || view.userId !== userId) {
                return res.status(404).json({ success: false, message: 'View not found or access denied' });
            }
            yield prismaClient_1.default.view.delete({
                where: { id: parseInt(viewId) },
            });
            return res.status(200).json({ success: true, message: 'View deleted successfully' });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: 'Error deleting view' });
        }
    }),
};
// Helper functions to sanitize filters and sorting
function sanitizeFilters(filters, permittedColumns) {
    if (!filters || typeof filters !== 'object')
        return {};
    function sanitize(obj) {
        if (Array.isArray(obj)) {
            return obj.map(sanitize);
        }
        else if (typeof obj === 'object' && obj !== null) {
            const sanitizedObj = {};
            for (const key in obj) {
                if (['AND', 'OR', 'NOT'].includes(key)) {
                    sanitizedObj[key] = sanitize(obj[key]);
                }
                else if (permittedColumns.includes(key)) {
                    sanitizedObj[key] = obj[key];
                }
            }
            return sanitizedObj;
        }
        return obj;
    }
    return sanitize(filters);
}
function sanitizeSorting(sorting, permittedColumns) {
    if (!Array.isArray(sorting))
        return [];
    function sanitize(obj) {
        const sanitizedArray = [];
        for (const sortItem of obj) {
            if (typeof sortItem === 'object' && sortItem !== null) {
                const sanitizedItem = {};
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
