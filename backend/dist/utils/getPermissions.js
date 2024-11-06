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
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
const permissionsMap_1 = __importDefault(require("../constants/permissionsMap"));
const resourcesMap_1 = __importDefault(require("../constants/resourcesMap"));
function getPermissions(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Starting getPermissions for userId:', userId);
        try {
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
                // console.error('User not found for ID:', userId);
                throw new Error('User not found');
            }
            // console.log('User data retrieved:', {
            //     userId: user.id,
            //     roleId: user.role?.id,
            //     roleName: user.role?.name,
            //     permissionCount: user.role?.permissions?.length,
            //     resourceCount: user.role?.resources?.length
            // });
            // Validate role data
            if (!user.role) {
                console.error('User has no role assigned');
                throw new Error('User has no role assigned');
            }
            // Step 1: Initialize permissions and resources based on the user's role
            const permissionsMap = new Map();
            // console.log('Processing role permissions:', user.role.permissions);
            user.role.permissions.forEach(permission => {
                const key = permission.key;
                // console.log('Processing permission:', {
                //     key,
                //     existsInMap: key in PermissionsMap,
                //     availableKeys: Object.keys(PermissionsMap)
                // });
                if (key in permissionsMap_1.default) {
                    permissionsMap.set(key, permissionsMap_1.default[key]);
                }
                else {
                    console.warn('Permission key not found in PermissionsMap:', key);
                }
            });
            const resourcesMap = new Map();
            // console.log('Processing role resources:', JSON.stringify(user.role.resources, null, 2));
            // console.log('Available ResourcesMap keys:', Object.keys(ResourcesMap));
            user.role.resources.forEach(resource => {
                console.log('Processing resource:', {
                    resourceKey: resource.key,
                    resourceDescription: resource.description,
                });
                const resourceKey = resource.key;
                // console.log('Checking resource:', {
                //     key: resourceKey,
                //     existsInMap: resourceKey in ResourcesMap,
                //     mapValue: ResourcesMap[resourceKey] ? 'Present' : 'Missing'
                // });
                if (resourceKey in resourcesMap_1.default) {
                    resourcesMap.set(resourceKey, resourcesMap_1.default[resourceKey]);
                    // console.log(`Resource ${resourceKey} successfully mapped with ${ResourcesMap[resourceKey].length} columns`);
                }
                else {
                    // console.warn(`Resource key "${resourceKey}" not found in ResourcesMap. Available keys:`, Object.keys(ResourcesMap));
                }
            });
            // Step 2: Apply permission overrides
            // console.log('Processing permission overrides:', user.permissionOverrides);
            user.permissionOverrides.forEach(override => {
                const key = override.permission.key;
                // // console.log('Processing permission override:', {
                //     key,
                //     granted: override.granted,
                //     existsInMap: key in PermissionsMap
                // });
                if (key in permissionsMap_1.default) {
                    if (override.granted) {
                        permissionsMap.set(key, permissionsMap_1.default[key]);
                        // console.log(`Permission ${key} granted via override`);
                    }
                    else {
                        permissionsMap.delete(key);
                        // console.log(`Permission ${key} revoked via override`);
                    }
                }
            });
            // Convert permissionsMap to array format for JWT payload
            const allowedPermissions = Array.from(permissionsMap.entries()).map(([key, description]) => ({ key, description }));
            // console.log('Final permissions:', allowedPermissions);
            // Step 3: Apply resource overrides
            // console.log('Processing resource overrides:', user.resourceOverrides);
            user.resourceOverrides.forEach(override => {
                const resourceKey = override.resource.key;
                // console.log('Processing resource override:', {
                //     resourceKey,
                //     granted: override.granted,
                //     existsInMap: resourceKey in ResourcesMap
                // });
                if (resourceKey in resourcesMap_1.default) {
                    if (override.granted) {
                        resourcesMap.set(resourceKey, resourcesMap_1.default[resourceKey]);
                        // console.log(`Resource ${resourceKey} granted via override`);
                    }
                    else {
                        resourcesMap.delete(resourceKey);
                        // console.log(`Resource ${resourceKey} revoked via override`);
                    }
                }
            });
            // Convert resourcesMap to array format for JWT payload
            const allowedResources = Array.from(resourcesMap.entries()).map(([key, columns]) => ({ key, columns }));
            // Final logging of results
            // console.log('Final permissions and resources:', {
            //     permissionCount: allowedPermissions.length,
            //     permissions: allowedPermissions.map(p => p.key),
            //     resourceCount: allowedResources.length,
            //     resources: allowedResources.map(r => r.key)
            // });
            if (allowedResources.length === 0) {
                console.warn('No resources were mapped! This might indicate a configuration issue.');
                // console.log('Debug information:', {
                //     roleResourceCount: user.role.resources.length,
                //     roleResourceKeys: user.role.resources.map(r => r.key),
                //     resourceMapKeys: Object.keys(ResourcesMap),
                // });
            }
            return {
                permissions: allowedPermissions,
                resources: allowedResources,
            };
        }
        catch (error) {
            console.error('Error in getPermissions:', error);
            throw error;
        }
    });
}
