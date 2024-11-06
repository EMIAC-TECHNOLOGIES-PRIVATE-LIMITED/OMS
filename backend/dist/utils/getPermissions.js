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
exports.getPermissions = void 0;
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
const permissionsMap_1 = __importDefault(require("../constants/permissionsMap"));
const resourcesMap_1 = __importDefault(require("../constants/resourcesMap"));
function getPermissions(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prismaClient_1.default.user.findUnique({
            where: { id: userId },
            include: {
                role: {
                    include: {
                        permissions: true,
                        resources: true,
                    },
                },
                permissionOverrides: { include: { permission: true } },
                resourceOverrides: { include: { resource: true } },
            },
        });
        if (!user) {
            throw new Error('User not found');
        }
        // Step 1: Initialize permissions and resources based on the user's role
        const permissionsMap = new Map();
        user.role.permissions.forEach(permission => {
            const key = permission.key;
            if (key in permissionsMap_1.default) {
                permissionsMap.set(key, permissionsMap_1.default[key]);
            }
        });
        const resourcesMap = new Map();
        user.role.resources.forEach(resource => {
            const resourceKey = resource.key;
            if (resourceKey in resourcesMap_1.default) {
                resourcesMap.set(resourceKey, resourcesMap_1.default[resourceKey]);
            }
        });
        // Step 2: Apply permission overrides
        user.permissionOverrides.forEach(override => {
            const key = override.permission.key;
            if (key in permissionsMap_1.default) {
                if (override.granted) {
                    // Grant the permission
                    permissionsMap.set(key, permissionsMap_1.default[key]);
                }
                else {
                    // Revoke the permission
                    permissionsMap.delete(key);
                }
            }
        });
        // Convert permissionsMap to array format for JWT payload
        const allowedPermissions = Array.from(permissionsMap.entries()).map(([key, description]) => ({ key, description }));
        // Step 3: Apply resource overrides
        user.resourceOverrides.forEach(override => {
            const resourceKey = override.resource.key;
            if (resourceKey in resourcesMap_1.default) {
                if (override.granted) {
                    // Grant access to the resource
                    resourcesMap.set(resourceKey, resourcesMap_1.default[resourceKey]);
                }
                else {
                    // Revoke access to the resource
                    resourcesMap.delete(resourceKey);
                }
            }
        });
        // Convert resourcesMap to array format for JWT payload
        const allowedResources = Array.from(resourcesMap.entries()).map(([key, columns]) => ({ key, columns }));
        console.log("Get Permission Function Called");
        console.log("Permissions assigned:", allowedPermissions);
        console.log("Resources assigned:", allowedResources);
        return {
            permissions: allowedPermissions,
            resources: allowedResources,
        };
    });
}
exports.getPermissions = getPermissions;
