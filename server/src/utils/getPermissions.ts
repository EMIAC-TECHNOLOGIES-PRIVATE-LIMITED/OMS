import { prismaClient } from "./prismaClient";
import NodeCache from 'node-cache'
import { cacheTTL } from "../constants/index";



const permissionCache = new NodeCache();
const resourceCache = new NodeCache();

export const getResourceCached = async function (userId: number): Promise<string[]> {
    try {
        const value = resourceCache.get(`${userId}`) as string[];
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
                                resources: true

                            }
                        },
                        resourceOverrides: {
                            select: {
                                granted: true,
                                resource: true
                            }
                        }
                    }
                });
            } catch {
                return [];
            }
            if (user) {
                let resourceArray: string[] = [];
                try {
                    resourceArray = user.role.resources.map(r => r.key);
                } catch { }
                try {
                    user.resourceOverrides.forEach(override => {
                        const overriddenColumn = override.resource.key;
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
                    const success = resourceCache.set(`${userId}`, resourceArray, cacheTTL);
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

export const getPermissionCached = async function (
    userId: number
): Promise<{ id: number; name: string }[]> {
    try {
        // Attempt to retrieve cached permissions as an array of objects
        const cachedValue = permissionCache.get(`${userId}`) as { id: number; name: string }[];
        if (cachedValue) {
            return cachedValue;
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
                                permissions: {
                                    select: { id: true, key: true },
                                },
                            },
                        },
                        permissionOverrides: {
                            include: {
                                permission: {
                                    select: { id: true, key: true },
                                },
                            },
                        },
                    },
                });
            } catch {
                // Return empty array if fetching user fails
                return [];
            }

            if (user) {
                // Initialize permissions with role-based permissions
                let permissionArray: { id: number; name: string }[] = [];
                try {
                    permissionArray = user.role.permissions.map((p) => ({
                        id: p.id,
                        name: p.key,
                    }));
                } catch {
                    // If mapping role permissions fails, proceed with an empty array
                    permissionArray = [];
                }

                // Apply permission overrides
                try {
                    user.permissionOverrides.forEach((overRide) => {
                        const overriddenPermission = {
                            id: overRide.permission.id,
                            name: overRide.permission.key,
                        };
                        if (overRide.granted) {
                            // Add permission if not already present
                            if (
                                !permissionArray.find(
                                    (p) => p.id === overriddenPermission.id
                                )
                            ) {
                                permissionArray.push(overriddenPermission);
                            }
                        } else {
                            // Remove permission based on id
                            permissionArray = permissionArray.filter(
                                (p) => p.id !== overriddenPermission.id
                            );
                        }
                    });
                } catch {
                    // If applying overrides fails, proceed without changes
                }

                // Attempt to cache the updated permissions
                try {
                    const success = permissionCache.set(
                        `${userId}`,
                        permissionArray,
                        cacheTTL
                    );
                    if (!success) {
                        console.log("Error while writing to cache");
                    }
                } catch {
                    // Log error if caching fails, but do not disrupt the flow
                    console.log("Error while writing to cache");
                }

                // Return the final array of permissions
                return permissionArray;
            } else {
                // Return empty array if user is not found
                return [];
            }
        }
    } catch {
        // Return empty array for any unforeseen errors
        return [];
    }
};


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
        return [];
    }
};


export const getUserPermissionsAndResources = async function (
    userId: number
): Promise<{
    permissions: { id: number; key: string }[];
    resources: { id: number; key: string }[];
}> {
    try {
        const user = await prismaClient.user.findUnique({
            where: {
                id: userId
            },
            select: {
                role: {
                    select: {
                        permissions: {
                            select: {
                                id: true,
                                key: true
                            }
                        },
                        resources: {
                            select: {
                                id: true,
                                key: true
                            }
                        }
                    }
                },
                permissionOverrides: {
                    select: {
                        granted: true,
                        permission: {
                            select: {
                                id: true,
                                key: true
                            }
                        }
                    }
                },
                resourceOverrides: {
                    select: {
                        granted: true,
                        resource: {
                            select: {
                                id: true,
                                key: true
                            }
                        }
                    }
                }
            }
        });

        let permissions = user?.role.permissions.map(p => ({ id: p.id, key: p.key }));
        user?.permissionOverrides.forEach(override => {
            if (override.granted) {
                if (!permissions?.find(p => p.id === override.permission.id)) {
                    permissions?.push({ id: override.permission.id, key: override.permission.key });
                }
            } else {
                permissions = permissions?.filter(p => p.id !== override.permission.id);
            }
        });

        let resources = user?.role.resources.map(r => ({ id: r.id, key: r.key }));
        user?.resourceOverrides.forEach(override => {
            if (override.granted) {
                if (!resources?.find(r => r.id === override.resource.id)) {
                    resources?.push({ id: override.resource.id, key: override.resource.key });
                }
            } else {
                resources = resources?.filter(r => r.id !== override.resource.id);
            }
        });

        return {
            permissions: permissions || [],
            resources: resources || []
        };


    } catch (error) {
        console.error('Error while fetching permissions and resources for the user:', userId, 'Error:', error);
        return { permissions: [], resources: [] };
    }
};

export const getRolePermissionsAndResources = async function (
    roleId: number
): Promise<{
    permissions: { id: number; key: string }[];
    resources: { id: number; key: string }[];
}> {
    try {

        const role = await prismaClient.role.findUnique({
            where: {
                id: roleId
            },
            select: {
                permissions: {
                    select: {
                        id: true,
                        key: true
                    }
                },
                resources: {
                    select: {
                        id: true,
                        key: true
                    }
                }
            }
        });

        return {
            permissions: role?.permissions.map(p => ({ id: p.id, key: p.key })) || [],
            resources: role?.resources.map(r => ({ id: r.id, key: r.key })) || []
        };

    } catch (error) {
        console.error('Error while fetching permissions and resources for the role:', roleId, 'Error:', error);
        return { permissions: [], resources: [] };
    }
};

export const getAllPermissionsAndResources = async function (): Promise<{
    permissions: { id: number; key: string }[];
    resources: { id: number; key: string }[];
}> {
    try {
        const cacheData = permissionCache.get("allPermissionsAndResources") as {
            permissions: { id: number; key: string }[];
            resources: { id: number; key: string }[];
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
                key: true
            },
        });



        const result = {
            permissions: permissions,
            resources: resources,
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



