import prismaClient from "../utils/prismaClient";
import PermissionsMap from "../constants/permissionsMap";
import ResourcesMap from "../constants/resourcesMap";

export async function getPermissions(userId: number) {
    const user = await prismaClient.user.findUnique({
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
    const permissionsMap = new Map<string, string>();
    user.role.permissions.forEach(permission => {
        const key = permission.key as keyof typeof PermissionsMap;
        if (key in PermissionsMap) {
            permissionsMap.set(key, PermissionsMap[key]);
        }
    });

    const resourcesMap = new Map<string, string[]>();
    user.role.resources.forEach(resource => {
        const resourceKey = resource.key as keyof typeof ResourcesMap;
        if (resourceKey in ResourcesMap) {
            resourcesMap.set(resourceKey, ResourcesMap[resourceKey]);
        }
    });

    // Step 2: Apply permission overrides
    user.permissionOverrides.forEach(override => {
        const key = override.permission.key as keyof typeof PermissionsMap;
        if (key in PermissionsMap) {
            if (override.granted) {
                // Grant the permission
                permissionsMap.set(key, PermissionsMap[key]);
            } else {
                // Revoke the permission
                permissionsMap.delete(key);
            }
        }
    });

    // Convert permissionsMap to array format for JWT payload
    const allowedPermissions = Array.from(permissionsMap.entries()).map(([key, description]) => ({ key, description }));

    // Step 3: Apply resource overrides
    user.resourceOverrides.forEach(override => {
        const resourceKey = override.resource.key as keyof typeof ResourcesMap;
        if (resourceKey in ResourcesMap) {
            if (override.granted) {
                // Grant access to the resource
                resourcesMap.set(resourceKey, ResourcesMap[resourceKey]);
            } else {
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
}
