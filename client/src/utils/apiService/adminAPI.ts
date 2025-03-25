import { apiRequest } from './APIService';
import {
    GetAllRolesResponse,
    GetAllUsersResponse,
    GetAllPermissionsResponse,
    GetRolePermissionsRequest,
    GetRolePermissionsResponse,
    GetUserPermissionsRequest,
    GetUserPermissionsResponse,
    SuspendUserRequest,
    SuspendUserResponse,
    RevokeUserRequest,
    RevokeUserResponse,
    ManageUserAccessRequest,
    ManageUserAccessResponse,
    ManageRoleAccessRequest,
    ManageRoleAccessResponse,
    createUserRequest
    , createUserResponse
} from '../../../../shared/src/types';

export async function getAllRoles(): Promise<GetAllRolesResponse> {
    return apiRequest<GetAllRolesResponse>('/admin/info/roles', 'GET');
}

export async function getAllUsers(): Promise<GetAllUsersResponse> {
    return apiRequest<GetAllUsersResponse>('/admin/info/users', 'GET');
}

export async function getAllPermissions(): Promise<GetAllPermissionsResponse> {
    return apiRequest<GetAllPermissionsResponse>('/admin/info/access', 'GET');
}

export async function getRolePermissions(
    roleId: GetRolePermissionsRequest['roleId']
): Promise<GetRolePermissionsResponse> {
    // Pass roleId in the request body (data)
    return apiRequest<GetRolePermissionsResponse>(
        '/admin/info/access/role',
        'POST',
        undefined,
        { roleId }
    );
}

export async function getUserPermissions(
    userId: GetUserPermissionsRequest['userId']
): Promise<GetUserPermissionsResponse> {
    // Pass userId in the request body (data)
    return apiRequest<GetUserPermissionsResponse>(
        '/admin/info/access/user',
        'POST',
        undefined, // No query params
        { userId }  // Data in the body
    );
}

export async function suspendUser(
    userId: SuspendUserRequest['userId']
): Promise<SuspendUserResponse> {
    return apiRequest<SuspendUserResponse>(
        '/admin/manage/suspend',
        'POST',
        undefined,
        { userId }
    );
}

export async function revokeUser(
    userId: RevokeUserRequest['userId']
): Promise<RevokeUserResponse> {
    return apiRequest<RevokeUserResponse>(
        '/admin/manage/revoke',
        'POST',
        undefined,
        { userId }
    );
}

export async function manageUserAccess(
    userId: ManageUserAccessRequest['userId'],
    permissionOverride: ManageUserAccessRequest['permissionOverride'],
    resourceOverride: ManageUserAccessRequest['resourceOverride'],
    userAccess : number[],
    roleId?: number
): Promise<ManageUserAccessResponse> {
    return apiRequest<ManageUserAccessResponse>(
        '/admin/manage/access/user',
        'POST',
        undefined,
        {
            userId,
            roleId,
            permissionOverride,
            resourceOverride, 
            userAccess
        }
    );
}

export async function manageRoleAccess(
    roleId: ManageRoleAccessRequest['roleId'],
    permissions: ManageRoleAccessRequest['permissions'],
    resources: ManageRoleAccessRequest['resources']
): Promise<ManageRoleAccessResponse> {
    return apiRequest<ManageRoleAccessResponse>(
        '/admin/manage/access/role',
        'POST',
        undefined,
        {
            roleId,
            permissions,
            resources,
        }
    );
}

export async function createUser(
    name: createUserRequest['name'],
    email: createUserRequest['email'],
    password: createUserRequest['password'],
    roleId: createUserRequest['roleId']
): Promise<createUserResponse> {
    return apiRequest<createUserResponse>(
        '/admin/manage/createuser',
        'POST',
        undefined,
        {
            name,
            email,
            password,
            roleId
        }
    );
}