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
exports.getPermissions = getPermissions;
const prismaClient_1 = __importDefault(require("./prismaClient"));
function getPermissions(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield prismaClient_1.default.user.findUnique({
                where: { id: userId },
                include: {
                    role: {
                        include: {
                            permissions: true, // Get all permissions assigned to the role
                            resources: true, // Get all resources assigned to the role
                        },
                    },
                    permissionOverrides: {
                        include: {
                            permission: true, // Get the permission details for each override
                        },
                    },
                    resourceOverrides: {
                        include: {
                            resource: true, // Get the resource details for each override
                        },
                    },
                },
            });
            if (!user) {
                throw new Error('User not found');
            }
            // Build a map of permissions, starting with role permissions
            const permissionsMap = new Map();
            user.role.permissions.forEach(permission => {
                permissionsMap.set(permission.id, permission);
            });
            // Apply permission overrides
            user.permissionOverrides.forEach(override => {
                if (override.granted) {
                    // Grant the permission (add or update)
                    permissionsMap.set(override.permission.id, override.permission);
                }
                else {
                    // Revoke the permission (remove it)
                    permissionsMap.delete(override.permission.id);
                }
            });
            const allowedPermissions = Array.from(permissionsMap.values());
            // Repeat the same process for resources
            const resourcesMap = new Map();
            user.role.resources.forEach(resource => {
                resourcesMap.set(resource.id, resource);
            });
            // Apply resource overrides
            user.resourceOverrides.forEach(override => {
                if (override.granted) {
                    // Grant the resource (add or update)
                    resourcesMap.set(override.resource.id, override.resource);
                }
                else {
                    // Revoke the resource (remove it)
                    resourcesMap.delete(override.resource.id);
                }
            });
            const allowedResources = Array.from(resourcesMap.values());
            // Return the allowed permissions and resources
            return {
                permissions: allowedPermissions,
                resources: allowedResources,
            };
        }
        catch (error) {
            console.error('Error getting user permissions and resources:', error);
            throw error;
        }
    });
}
