import { prismaClient } from "./prismaClient";
import NodeCache from 'node-cache'
import { cacheTTL } from "../constants/index";



const permissionCache = new NodeCache();
const resourceCache = new NodeCache();

export const getResourceCached = async function (userId: number, table: string): Promise<string[]> {
    try {
        const value = resourceCache.get(`${userId}-${table}`) as string[];
        if (value) {
            return value;
        } else {
            let user;
            try {
                user = await prismaClient.user.findUnique({
                    where: {
                        id: userId
                    },
                    include: {
                        role: {
                            include: {
                                resources: {
                                    where: { table: table },
                                    select: { column: true }
                                }
                            }
                        },
                        resourceOverrides: {
                            where: {
                                resource: { table: table }
                            },
                            include: { resource: { select: { column: true } } }
                        }
                    }
                });
            } catch {
                return [];
            }
            if (user) {
                let resourceArray: string[] = [];
                try {
                    resourceArray = user.role.resources.map(r => r.column);
                } catch { }
                try {
                    user.resourceOverrides.forEach(override => {
                        const overriddenColumn = override.resource.column;
                        if (override.granted) {
                            if (!resourceArray.includes(overriddenColumn)) {
                                resourceArray.push(overriddenColumn);
                            }
                        } else {
                            resourceArray = resourceArray.filter(column => column !== overriddenColumn);
                        }
                    });
                } catch { }
                try {
                    const success = resourceCache.set(`${userId}-${table}`, resourceArray, cacheTTL);
                    if (!success) {
                        console.log("Error while writting to cache")
                    }
                } catch { }
                return resourceArray;
            } else {
                console.error(`User with id ${userId} not found.`);
                return [];
            }
        }
    } catch {
        return [];
    }
};

export const getPermissionCached = async function (userId: number): Promise<string[]> {
    try {
        const value = permissionCache.get(`${userId}`) as string[]
        if (value) {
            return value;
        } else {
            let user;
            try {
                user = await prismaClient.user.findUnique({
                    where: {
                        id: userId,
                    },
                    include: {
                        role: {
                            include: {
                                permissions: true
                            }
                        },
                        permissionOverrides: {
                            include: {
                                permission: true
                            }
                        }
                    }
                });
            } catch {
                return [];
            }
            if (user) {
                let permissionArray: string[] = [];
                try {
                    permissionArray = user.role.permissions.map(p => p.key);
                } catch { }
                try {
                    user.permissionOverrides.forEach((overRide) => {
                        const overRiddenPermission = overRide.permission.key;
                        if (overRide.granted) {
                            if (!permissionArray.includes(overRiddenPermission)) {
                                permissionArray.push(overRiddenPermission);
                            }
                        } else {
                            permissionArray = permissionArray.filter(p => p !== overRiddenPermission)
                        }
                    });
                } catch { }
                try {
                    const success = permissionCache.set(`${userId}`, permissionArray, cacheTTL)
                    if (!success) {
                        console.log("Error while writting to cache")
                    }
                } catch { }
                return permissionArray;
            } else {
                return [];
            }
        }
    } catch {
        return [];
    }
}

export const getUserPermission = async function (
    userId: number
): Promise<{ id: number; name: string }[]> {
    try {
        // Fetch user with role and permission overrides
        const user = await prismaClient.user.findUnique({
            where: { id: userId },
            include: {
                role: {
                    include: {
                        permissions: { select: { id: true, key: true } },
                    },
                },
                permissionOverrides: {
                    include: { permission: { select: { id: true, key: true } } },
                },
            },
        });

        if (!user) {
            console.error(`User with id ${userId} not found.`);
            return [];
        }

        // Combine role-based permissions with overrides
        let permissions = user.role.permissions.map((p) => ({
            id: p.id,
            name: p.key,
        }));

        user.permissionOverrides.forEach((override) => {
            const overriddenPermission = { id: override.permission.id, name: override.permission.key };
            if (override.granted) {
                if (!permissions.find((p) => p.id === overriddenPermission.id)) {
                    permissions.push(overriddenPermission);
                }
            } else {
                permissions = permissions.filter((p) => p.id !== overriddenPermission.id);
            }
        });

        return permissions;
    } catch (error) {
        console.error('Error while fetching permissions for the user:', userId, 'Error:', error);
        return [];
    }
};

export const getUserPermissionsAndResources = async function (
    userId: number
): Promise<{
    permissions: { id: number; name: string }[];
    resources: { id: number; table: string; column: string }[];
}> {
    try {
        // Fetch user with their role, permissions, and overrides
        const user = await prismaClient.user.findUnique({
            where: { id: userId },
            include: {
                role: {
                    include: {
                        permissions: { select: { id: true, key: true } },
                        resources: { select: { id: true, table: true, column: true } },
                    },
                },
                permissionOverrides: {
                    include: { permission: { select: { id: true, key: true } } },
                },
                resourceOverrides: {
                    include: { resource: { select: { id: true, table: true, column: true } } },
                },
            },
        });

        if (!user) {
            console.error(`User with id ${userId} not found.`);
            return { permissions: [], resources: [] };
        }

        // Combine role-based permissions with overrides
        let permissions = user.role.permissions.map((p) => ({
            id: p.id,
            name: p.key,
        }));

        user.permissionOverrides.forEach((override) => {
            const overriddenPermission = { id: override.permission.id, name: override.permission.key };
            if (override.granted) {
                if (!permissions.find((p) => p.id === overriddenPermission.id)) {
                    permissions.push(overriddenPermission);
                }
            } else {
                permissions = permissions.filter((p) => p.id !== overriddenPermission.id);
            }
        });

        // Combine role-based resources with overrides
        let resources = user.role.resources.map((r) => ({
            id: r.id,
            table: r.table,
            column: r.column,
        }));

        user.resourceOverrides.forEach((override) => {
            const overriddenResource = {
                id: override.resource.id,
                table: override.resource.table,
                column: override.resource.column,
            };
            if (override.granted) {
                if (!resources.find((r) => r.id === overriddenResource.id)) {
                    resources.push(overriddenResource);
                }
            } else {
                resources = resources.filter((r) => r.id !== overriddenResource.id);
            }
        });

        return { permissions, resources };
    } catch (error) {
        console.error('Error while fetching permissions and resources for the user:', userId, 'Error:', error);
        return { permissions: [], resources: [] };
    }
};

export const getRolePermissionsAndResources = async function (
    roleId: number
): Promise<{
    permissions: { id: number; name: string }[];
    resources: { id: number; table: string; column: string }[];
}> {
    try {
        // Fetch the role with its permissions and resources
        const role = await prismaClient.role.findUnique({
            where: { id: roleId },
            include: {
                permissions: { select: { id: true, key: true } }, // Select permission details
                resources: { select: { id: true, table: true, column: true } }, // Select resource details
            },
        });

        if (!role) {
            console.error(`Role with id ${roleId} not found.`);
            return { permissions: [], resources: [] };
        }

        // Format permissions and resources
        const formattedPermissions = role.permissions.map((permission) => ({
            id: permission.id,
            name: permission.key,
        }));

        const formattedResources = role.resources.map((resource) => ({
            id: resource.id,
            table: resource.table,
            column: resource.column,
        }));

        return {
            permissions: formattedPermissions,
            resources: formattedResources,
        };
    } catch (error) {
        console.error('Error while fetching permissions and resources for the role:', roleId, 'Error:', error);
        return { permissions: [], resources: [] };
    }
};

export const getAllPermissionsAndResources = async function (): Promise<{
    permissions: { id: number; name: string }[];
    resources: { id: number; table: string; column: string }[];
}> {
    try {
        const cacheData = permissionCache.get("allPermissionsAndResources") as {
            permissions: { id: number; name: string }[];
            resources: { id: number; table: string; column: string }[];
        };
        if (cacheData) {
            return cacheData;
        }
    } catch (error) {
        console.error("Error retrieving from cache:", error);
    }

    try {
        // Fetch permissions from the database
        const permissions = await prismaClient.permission.findMany({
            select: {
                id: true,
                key: true,
            },
        });

        // Fetch resources from the database
        const resources = await prismaClient.resource.findMany({
            select: {
                id: true,
                table: true,
                column: true,
            },
        });

        // Format permissions and resources
        const formattedPermissions = permissions.map((permission) => ({
            id: permission.id,
            name: permission.key,
        }));

        const formattedResources = resources.map((resource) => ({
            id: resource.id,
            table: resource.table,
            column: resource.column,
        }));

        const result = {
            permissions: formattedPermissions,
            resources: formattedResources,
        };

        // Cache the result
        try {
            const success = permissionCache.set("allPermissionsAndResources", result, cacheTTL);
            if (!success) {
                console.log("Error while writing to cache");
            }
        } catch (error) {
            console.error("Error while writing to cache:", error);
        }

        return result;
    } catch (error) {
        console.error("Error while fetching permissions and resources:", error);
        return { permissions: [], resources: [] };
    }
};



