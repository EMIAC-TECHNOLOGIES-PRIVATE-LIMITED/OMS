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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
const client_1 = require("@prisma/client");
const viewsMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { authorization } = req.headers;
    const { resource, viewId } = req.params;
    if (!authorization) {
        return res.status(401).json({ success: false, message: 'Authorization header missing' });
    }
    try {
        const token = authorization.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const model = client_1.Prisma.dmmf.datamodel.models.find((m) => {
            // console.log(m.name.toLowerCase().slice(0, -1));
            return m.name.toLowerCase() === resource.toLowerCase().slice(0, -1);
        });
        if (!model) {
            return res.status(404).json({ success: false, message: 'Resource not found' });
        }
        req.modelName = model.name;
        const requiredPermissionKey = `VIEW_${resource.toUpperCase()}_ROUTE`;
        const hasPermission = decoded.permissions.some((permission) => permission.key === requiredPermissionKey);
        if (!hasPermission) {
            return res.status(403).json({ success: false, message: 'Permission denied' });
        }
        // Extract permitted columns
        const userResource = decoded.resources.find((r) => {
            // console.log(r.key);
            // console.log(r.key.toLowerCase().split('_')[0]);
            //TODO: fix this concat thing 
            return r.key.toLowerCase().split('_')[0].concat('s') === resource.toLowerCase();
        });
        console.log(userResource);
        if (!userResource) {
            return res
                .status(403)
                .json({ success: false, message: 'No column access defined for this resource' });
        }
        req.permittedColumns = userResource.columns;
        const columnTypes = {};
        for (const field of model.fields) {
            if (req.permittedColumns.includes(field.name)) {
                columnTypes[field.name] = field.type;
            }
        }
        req.columnTypes = columnTypes;
        // Attach user's info to the request
        req.user = decoded;
        // Handle default 'grid' view when viewId is not provided
        if (!viewId) {
            // Check if default 'grid' view exists
            let defaultView = yield prismaClient_1.default.view.findFirst({
                where: {
                    userId: decoded.userId,
                    tableId: resource,
                    viewName: 'grid',
                },
            });
            if (!defaultView) {
                defaultView = yield prismaClient_1.default.view.create({
                    data: {
                        userId: decoded.userId,
                        tableId: resource,
                        viewName: 'grid',
                        columns: req.permittedColumns,
                        filters: {},
                        sort: [],
                        groupBy: [],
                    },
                });
            }
            // Set the viewId to the default 'grid' view's ID
            req.params.viewId = defaultView.id.toString();
            req.view = defaultView;
        }
        else {
            // Fetch the specified view
            const view = yield prismaClient_1.default.view.findUnique({
                where: { id: parseInt(viewId) },
            });
            if (!view) {
                return res.status(404).json({ success: false, message: 'View not found' });
            }
            // Verify ownership and resource
            if (view.userId !== decoded.userId ||
                view.tableId.toLowerCase() !== resource.toLowerCase()) {
                return res
                    .status(403)
                    .json({ success: false, message: 'Permission denied to access this view' });
            }
            req.view = view;
        }
        // Fetch user's views on this resource
        req.userViews = yield prismaClient_1.default.view.findMany({
            where: {
                userId: decoded.userId,
                tableId: resource,
            },
            select: {
                id: true,
                viewName: true,
            },
        });
        next();
    }
    catch (error) {
        console.error(error);
        return res.status(403).json({ success: false, message: 'Invalid token' });
    }
});
exports.default = viewsMiddleware;
