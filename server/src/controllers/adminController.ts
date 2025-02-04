import { Request, Response } from 'express';
import { Prisma, prismaClient } from '../utils/prismaClient';
import {
    SuspendUserRequest,
    SuspendUserResponse,
    RevokeUserRequest,
    RevokeUserResponse,
    ManageUserAccessRequest,
    ManageUserAccessResponse,
    GetAllRolesResponse,
    GetAllUsersResponse,
    GetUserPermissionsResponse,
    GetRolePermissionsResponse,
    GetAllPermissionsResponse,
} from '../../../shared/src/types';
import { APIResponse, APIError } from '../utils/apiHandler';
import { getAllPermissionsAndResources, getRolePermissionsAndResources, getUserPermissionsAndResources } from '../utils/getPermissions';

export async function suspendUser(req: Request, res: Response): Promise<Response<SuspendUserResponse>> {
    const { userId }: SuspendUserRequest = req.body;

    if (typeof userId !== 'number') {
        return res.status(400).json(new APIError(400, 'Invalid user ID provided', [], false).toJSON());
    }

    try {
        const user = await prismaClient.user.findUnique({ where: { id: userId } });

        if (!user) {
            return res.status(404).json(new APIError(404, 'User not found', [], false).toJSON());
        }

        await prismaClient.user.update({ where: { id: userId }, data: { suspended: true } });

        return res.status(200).json(new APIResponse(200, 'User suspended successfully', {}, true).toJSON());
    } catch (error) {
        console.error('Error suspending user:', error);
        return res.status(500).json(new APIError(500, 'Internal server error', [error instanceof Error ? error.message : 'Unknown error'], false).toJSON());
    }
}

export async function revokeUser(req: Request, res: Response): Promise<Response<RevokeUserResponse>> {
    const { userId }: RevokeUserRequest = req.body;

    if (typeof userId !== 'number') {
        return res.status(400).json(new APIError(400, 'Invalid user ID provided', [], false).toJSON());
    }

    try {
        const user = await prismaClient.user.findUnique({ where: { id: userId } });

        if (!user) {
            return res.status(404).json(new APIError(404, 'User not found', [], false).toJSON());
        }

        await prismaClient.user.update({ where: { id: userId }, data: { suspended: false } });

        return res.status(200).json(new APIResponse(200, 'User reinstated successfully', {}, true).toJSON());
    } catch (error) {
        console.error('Error revoking user suspension:', error);
        return res.status(500).json(new APIError(500, 'Internal server error', [error instanceof Error ? error.message : 'Unknown error'], false).toJSON());
    }
}

export async function manageUserAccess(req: Request, res: Response): Promise<Response<ManageUserAccessResponse>> {
    const { userId, permissionOverride, resourceOverride, roleId }: ManageUserAccessRequest = req.body;

    try {

        if (roleId) {
            await prismaClient.user.update({
                where: { id: userId }, data: {
                    roleId,
                    permissionOverrides: { deleteMany: {} },
                    resourceOverrides: { deleteMany: {} },
                }
            });
        }


        if (resourceOverride) {
            await prismaClient.resourceOverride.deleteMany({ where: { userId } });

            await prismaClient.resourceOverride.createMany({
                data: resourceOverride.map((override) => ({
                    userId,
                    resourceId: override.resourceId,
                    granted: override.granted,
                })),
            });
        }

        if (permissionOverride) {
            await prismaClient.permissionOverride.deleteMany({ where: { userId } });

            await prismaClient.permissionOverride.createMany({
                data: permissionOverride.map((override) => ({
                    userId,
                    permissionId: override.permissionId,
                    granted: override.granted,
                })),
            });

            await prismaClient.view.deleteMany({
                where: {
                    AND: [
                        { userId },
                        { viewName: 'grid' },
                    ],
                },
            });

        }

        return res.status(200).json(new APIResponse(200, 'User access updated successfully', {}, true).toJSON());
    } catch (error) {
        console.error('Error managing user access:', error);
        return res.status(500).json(new APIError(500, 'Internal server error', [error instanceof Error ? error.message : 'Unknown error'], false).toJSON());
    }
}

export async function getRoles(req: Request, res: Response): Promise<Response<GetAllRolesResponse>> {
    try {
        const roles: GetAllRolesResponse['data'] = await prismaClient.role.findMany({
            select: {
                id: true,
                name: true,
                _count: { select: { users: true } },
            },
        });

        return res.status(200).json(new APIResponse(200, 'Roles fetched successfully', roles, true).toJSON());
    } catch (error) {
        console.error('Error fetching roles list:', error);
        return res.status(500).json(new APIError(500, 'Error fetching roles list. Please report to admin.', [error instanceof Error ? error.message : 'Unknown error'], false).toJSON());
    }
}

export async function getUsers(req: Request, res: Response): Promise<Response<GetAllUsersResponse>> {
    const { page = 1, pageSize = 25, name } = req.body;

    try {
        const skip = (page - 1) * pageSize;


        type UserWithRole = {
            id: number;
            name: string;
            role: { name: string };
            suspended: boolean;
        };

        const query: Prisma.UserFindManyArgs = {
            select: {
                id: true,
                name: true,
                role: { select: { name: true } },
                suspended: true,
            },
            where: {
                role: { name: { notIn: ['admin'] } },
            },
            orderBy: { role: { name: 'asc' } },
            skip,
            take: pageSize,
        };

        if (name) {
            query.where = {
                ...query.where,
                name: { contains: name, mode: 'insensitive' },
            };
        }

        const users = await prismaClient.user.findMany(query) as unknown as UserWithRole[];

        const data: GetAllUsersResponse['data'] = users;

        return res.status(200).json(new APIResponse(200, 'Users fetched successfully', data, true).toJSON());
    } catch (error) {
        console.error("Error fetching users' list:", error);
        return res.status(500).json(new APIError(500, "Error fetching users' list. Please report to admin.", [error instanceof Error ? error.message : 'Unknown error'], false).toJSON());
    }
}

export async function getUserAccess(req: Request, res: Response): Promise<Response<GetUserPermissionsResponse>> {
    const { userId } = req.body;

    if (!userId || typeof userId !== 'number') {
        return res.status(400).json(new APIError(400, 'Invalid user ID provided', [], false).toJSON());
    }

    try {
        const user = await prismaClient.user.findUnique({
            where: { id: userId },
            include: {
                permissionOverrides: true,
                resourceOverrides: true,
                role: {
                    include: { permissions: true, resources: true },
                },
            },
        });


        if (!user) {
            throw new Error('User not found');
        }

        const data: GetUserPermissionsResponse['data'] = {
            roleId: user.roleId,
            name: user.name,
            isSuspended: user.suspended,
            permissions: user.role?.permissions.map(permission => ({
                id: permission.id,
                key: permission.key,
            })) || [],
            permissionOverrides: user.permissionOverrides.map(permissionOverride => ({
                permissionId: permissionOverride.permissionId,
                granted: permissionOverride.granted,
            })) || [],
            resources: user.role?.resources.map(resource => ({
                id: resource.id,
                key: resource.key,
            })) || [],
            resourceOverrides: user.resourceOverrides.map(resourceOverride => ({
                resourceId: resourceOverride.resourceId,
                granted: resourceOverride.granted,
            })) || [],
        };



        return res.status(200).json(new APIResponse(200, 'User permissions and resources fetched successfully', data, true).toJSON());
    } catch (error) {
        console.error('Error fetching user permissions and resources:', error);
        return res.status(500).json(new APIError(500, 'Internal server error', [error instanceof Error ? error.message : 'Unknown error'], false).toJSON());
    }
}

export async function getRoleAccess(req: Request, res: Response): Promise<Response<GetRolePermissionsResponse>> {
    const { roleId } = req.body;

    if (!roleId || typeof roleId !== 'number') {
        return res.status(400).json(new APIError(400, 'Invalid role ID provided', [], false).toJSON());
    }

    try {
        const data: GetRolePermissionsResponse['data'] = await getRolePermissionsAndResources(roleId);

        return res.status(200).json(new APIResponse(200, 'Role permissions and resources fetched successfully', data, true).toJSON());
    } catch (error) {
        console.error('Error fetching role permissions and resources:', error);
        return res.status(500).json(new APIError(500, 'Internal server error', [error instanceof Error ? error.message : 'Unknown error'], false).toJSON());
    }
}

export async function getAllAccess(req: Request, res: Response): Promise<Response<GetAllPermissionsResponse>> {
    try {
        const data: GetAllPermissionsResponse['data'] = await getAllPermissionsAndResources();

        return res.status(200).json(new APIResponse(200, 'All permissions and resources fetched successfully', data, true).toJSON());
    } catch (error) {
        console.error('Error fetching all permissions and resources:', error);
        return res.status(500).json(new APIError(500, 'Internal server error', [error instanceof Error ? error.message : 'Unknown error'], false).toJSON());
    }
}

export async function manageRoleAccess(req: Request, res: Response): Promise<Response<ManageUserAccessResponse>> {
    const { roleId, permissions, resources } = req.body;

    if (!roleId || typeof roleId !== 'number') {
        return res.status(400).json(new APIError(400, 'Invalid role ID provided', [], false).toJSON());
    }

    try {
        const role = await prismaClient.role.update({
            where: { id: roleId },
            data: {
                permissions: {
                    set: permissions.map((perm: { id: number }) => ({ id: perm.id })),
                },
                resources: {
                    set: resources.map((res: { id: number }) => ({ id: res.id })),
                },
            },
        });

        if (!role) {
            return res.status(404).json(new APIError(404, 'Role not found or unable to update', [], false).toJSON());
        }

        await prismaClient.view.deleteMany({
            where: {
                AND: [
                    { viewName: 'grid' },
                    { user: { roleId } },
                ],
            },
        });

        return res.status(200).json(new APIResponse(200, 'Role updated successfully', {}, true).toJSON());
    } catch (error) {
        console.error('Error updating role access:', error);
        return res.status(500).json(new APIError(500, 'Internal server error', [error instanceof Error ? error.message : 'Unknown error'], false).toJSON());
    }
}
