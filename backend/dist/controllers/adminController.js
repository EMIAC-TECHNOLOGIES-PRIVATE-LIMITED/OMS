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
exports.manageAccess = exports.revokeUser = exports.suspendUser = void 0;
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
// Suspend a user
function suspendUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { userId } = req.body;
        if (typeof userId !== 'number') {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID provided',
            });
        }
        try {
            const user = yield prismaClient_1.default.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }
            yield prismaClient_1.default.user.update({
                where: { id: userId },
                data: { suspended: true },
            });
            return res.status(200).json({
                success: true,
                message: `User with ID ${userId} has been suspended`,
            });
        }
        catch (error) {
            console.error('Error suspending user:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                detail: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });
}
exports.suspendUser = suspendUser;
// Revoke suspension of a user
function revokeUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { userId } = req.body;
        if (typeof userId !== 'number') {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID provided',
            });
        }
        try {
            const user = yield prismaClient_1.default.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }
            yield prismaClient_1.default.user.update({
                where: { id: userId },
                data: { suspended: false },
            });
            return res.status(200).json({
                success: true,
                message: `User with ID ${userId} has been reinstated`,
            });
        }
        catch (error) {
            console.error('Error revoking user suspension:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                detail: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });
}
exports.revokeUser = revokeUser;
// manage custom permssion and resources 
function manageAccess(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
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
            const userExists = yield prismaClient_1.default.user.findUnique({
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
            yield prismaClient_1.default.$transaction((prisma) => __awaiter(this, void 0, void 0, function* () {
                // Process permission overrides
                for (const override of permissions) {
                    const { id: permissionId, granted } = override;
                    if (typeof permissionId !== 'number') {
                        throw new Error(`Invalid permission ID: ${permissionId}`);
                    }
                    if (granted === null || granted === undefined) {
                        // Delete the override
                        yield prisma.permissionOverride.deleteMany({
                            where: {
                                userId: userId,
                                permissionId: permissionId,
                            },
                        });
                    }
                    else {
                        // Upsert the override
                        yield prisma.permissionOverride.upsert({
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
                        yield prisma.resourceOverride.deleteMany({
                            where: {
                                userId: userId,
                                resourceId: resourceId,
                            },
                        });
                    }
                    else {
                        // Upsert the override
                        yield prisma.resourceOverride.upsert({
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
            }));
            return res.status(200).json({
                success: true,
                message: 'User access has been updated successfully.',
            });
        }
        catch (error) {
            console.error('Error managing user access:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                detail: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });
}
exports.manageAccess = manageAccess;
