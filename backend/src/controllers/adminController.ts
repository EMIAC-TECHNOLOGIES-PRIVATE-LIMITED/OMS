import { Request, Response } from 'express';
import prismaClient from '../utils/prismaClient';

// Suspend a user
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

// Revoke suspension of a user
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

// manage custom permssion and resources 
export async function manageAccess(req: Request, res: Response) {

    const { userId, permissions, resources } = req.body;

    if (typeof userId !== 'number') {
        return res.status(400).json({
            success: false,
            message: 'Invalid user ID provided',
        });
    }

    if (!Array.isArray(permissions) || !Array.isArray(resources)) {
        return res.status(400).json({
            success: false,
            message: 'Permissions and resources must be arrays',
        });
    }

    try {
        // Validate user existence
        const userExists = await prismaClient.user.findUnique({
            where: { id: userId },
            select: { id: true },
        });

        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Begin a transaction
        await prismaClient.$transaction(async (prisma) => {
            // Process permission overrides
            for (const override of permissions) {
                const { id: permissionId, granted } = override;

                if (typeof permissionId !== 'number') {
                    throw new Error(`Invalid permission ID: ${permissionId}`);
                }

                if (granted === null || granted === undefined) {
                    // Delete the override
                    await prisma.permissionOverride.deleteMany({
                        where: {
                            userId: userId,
                            permissionId: permissionId,
                        },
                    });
                } else {
                    // Upsert the override
                    await prisma.permissionOverride.upsert({
                        where: {
                            userId_permissionId: {
                                userId: userId,
                                permissionId: permissionId,
                            },
                        },
                        update: {
                            granted: granted,
                        },
                        create: {
                            userId: userId,
                            permissionId: permissionId,
                            granted: granted,
                        },
                    });
                }
            }

            // Process resource overrides
            for (const override of resources) {
                const { id: resourceId, granted } = override;

                if (typeof resourceId !== 'number') {
                    throw new Error(`Invalid resource ID: ${resourceId}`);
                }

                if (granted === null || granted === undefined) {
                    // Delete the override
                    await prisma.resourceOverride.deleteMany({
                        where: {
                            userId: userId,
                            resourceId: resourceId,
                        },
                    });
                } else {
                    // Upsert the override
                    await prisma.resourceOverride.upsert({
                        where: {
                            userId_resourceId: {
                                userId: userId,
                                resourceId: resourceId,
                            },
                        },
                        update: {
                            granted: granted,
                        },
                        create: {
                            userId: userId,
                            resourceId: resourceId,
                            granted: granted,
                        },
                    });
                }
            }
        });

        return res.status(200).json({
            success: true,
            message: 'User access has been updated successfully.',
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


