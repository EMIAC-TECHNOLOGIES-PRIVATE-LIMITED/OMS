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
const dataRoutes_1 = require("../constants/dataRoutes");
const dataAccessMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    const { resource } = req.params;
    if (!authHeader) {
        return res.status(401).json({ success: false, message: 'Authorization header missing' });
    }
    if (!(resource in dataRoutes_1.routes.dataRoutes)) {
        return res.status(404).json({ message: 'Page not found' });
    }
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const requiredPermissionKey = `VIEW_${resource.toUpperCase()}_ROUTE`;
        console.log(requiredPermissionKey);
        decoded.permissions.map(p => console.log(p));
        const hasPermission = decoded.permissions.some(permission => permission.key === requiredPermissionKey);
        if (!hasPermission) {
            return res.status(403).json({ success: false, message: 'Permission denied' });
        }
        const resourceAccess = decoded.resources.find(res => res.key.toLowerCase() === resource.toLowerCase());
        if (!resourceAccess) {
            return res.status(403).json({ success: false, message: 'Access denied to this resource' });
        }
        req.permittedColumns = resourceAccess.columns;
        req.user = decoded;
        next();
    }
    catch (error) {
        console.log('dataAccessMiddleWare : inside error block');
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
exports.default = dataAccessMiddleware;
