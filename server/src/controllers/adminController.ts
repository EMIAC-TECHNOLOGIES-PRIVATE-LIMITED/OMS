import { Request, Response } from 'express';
import { prismaClient } from '../utils/prismaClient';
import { getAllPermissionsAndResources, getRolePermissionsAndResources, getUserPermissionsAndResources } from '../utils/getPermissions';
import { PermissionOverride, ResourceOverride } from '@prisma/client';


export async function suspendUser(req: Request, res: Response) {
    const { userId } = req.body;

    if (typeof userId !== 'number') {
        return res.status(400).json({
            success: false,
            message: 'Invalid user ID provided',
        });
    }

    try {
        const user = await prismaClient.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        await prismaClient.user.update({
            where: { id: userId },
            data: { suspended: true },
        });

        return res.status(200).json({
            success: true,
            message: `User with ID ${userId} has been suspended`,
        });
    } catch (error) {
        console.error('Error suspending user:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            detail: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}


export async function revokeUser(req: Request, res: Response) {
    const { userId } = req.body;

    if (typeof userId !== 'number') {
        return res.status(400).json({
            success: false,
            message: 'Invalid user ID provided',
        });
    }

    try {
        const user = await prismaClient.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        await prismaClient.user.update({
            where: { id: userId },
            data: { suspended: false },
        });

        return res.status(200).json({
            success: true,
            message: `User with ID ${userId} has been reinstated`,
        });
    } catch (error) {
        console.error('Error revoking user suspension:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            detail: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}


export async function manageUserAccess(req: Request, res: Response) {
    const { userId, permissionOverride, resourcesOverride } = req.body;

    try {

        // Update Resource Overrides
        if (resourcesOverride) {
            await prismaClient.resourceOverride.deleteMany({
                where: { userId: userId },
            });

            console.log('resourcesOverride:', resourcesOverride);

            await prismaClient.resourceOverride.createMany({
                data: resourcesOverride.map((override: ResourceOverride) => ({
                    userId: userId,
                    resourceId: override.resourceId,
                    granted: override.granted,
                })),
            });
        }

        if (permissionOverride) {
            await prismaClient.permissionOverride.deleteMany({
                where: { userId: userId },
            });

            await prismaClient.permissionOverride.createMany({
                data: permissionOverride.map((override: PermissionOverride,) => ({
                    userId: userId,
                    permissionId: override.permissionId,
                    granted: override.granted,
                })),
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User access updated successfully',
        });
    } catch (error) {
        console.error('Error managing user access:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            detail: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

export async function manageRoleAccess(req: Request, res: Response) {
    const { roleId, permissions, resources } = req.body;

    try {
        const role = await prismaClient.role.update({
            where: {
                id: roleId,
            },
            data: {
                permissions: {
                    connect: permissions.map((perm: { id: number }) => ({ id: perm.id })),
                },
                resources: {
                    connect: resources.map((res: { id: number }) => ({ id: res.id })),
                },
            },
        });

        if (role) {
            return res.status(200).json({
                success: true,
                message: "Role updated successfully",
            });
        }
    } catch (error) {
        console.error("Error while updating the role permissions with id:", roleId, "error:", error);
        return res.status(500).json({
            success: false,
            message: "Error while updating role permissions and resources. Please report to technical staff.",
        });
    }
}


export async function getRoles(req: Request, res: Response) {

    try {
        const data = await prismaClient.role.findMany({
            include: {
                _count: {
                    select: {
                        users: true
                    }
                }
            }
        })

        return res.status(200).json({
            data: data
        })

    } catch (error) {
        console.log('Error fetching the roles list : ', error)

        return res.status(500).json({
            message: "Error fetching the roles list. Please check system logs or report to admin."
        })
    }

}


export async function getUsers(req: Request, res: Response) {
    try {
        const { page = 1, pageSize = 25, name } = req.body;
        const skip = (page - 1) * pageSize;

        // Build the Prisma query dynamically
        const query: any = {
            select: {
                id: true,
                name: true,
                role: {
                    select: {
                        name: true
                    }
                },
                suspended: true
            },
            where: {
                role: {
                    name: {
                        notIn: ['admin']
                    }
                }
            },
            orderBy: {
                role: {
                    name: 'asc'
                }
            },
            skip,
            take: pageSize
        };

        // Add the name filter if provided
        if (name) {
            query.where = {
                ...query.where,
                name: {
                    contains: name,
                    mode: 'insensitive'
                }
            };
        }

        const data = await prismaClient.user.findMany(query);

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.log(`Error fetching the users' list: `, error);
        return res.status(500).json({
            status: false,
            message: "Error fetching the users' information. Please report to technical staff."
        });
    }
}

export async function getUserAccess(req: Request, res: Response) {
    const { userId } = req.body;

    try {
        const data = await getUserPermissionsAndResources(userId);
        return res.status(200).json({
            status: true,
            data
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Error while fetchig the user Permission and Resource Data. Please report to Technical Staff."
        })
    }
}


export async function getRoleAccess(req: Request, res: Response) {
    const { roleId } = req.body;

    try {
        const data = await getRolePermissionsAndResources(roleId);
        return res.status(200).json({
            status: true,
            data
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Error while fetchig the Role Permission and Resource Data. Please report to Technical Staff."
        })
    }


}

export async function getAllAccess(req: Request, res: Response) {
    try {
        const data = await getAllPermissionsAndResources();
        return res.status(200).json({
            status: true,
            data
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Error while fetchig the Permission and Resource Data. Please report to Technical Staff."
        })
    }
}