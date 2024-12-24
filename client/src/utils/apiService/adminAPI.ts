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
    return apiRequest<GetRolePermissionsResponse>('/admin/info/access/role', 'GET', { roleId });
}

export async function getUserPermissions(
    userId: GetUserPermissionsRequest['userId']
): Promise<GetUserPermissionsResponse> {
    return apiRequest<GetUserPermissionsResponse>('/admin/info/access/user', 'GET', { userId });
}

export async function suspendUser(
    userId: SuspendUserRequest['userId']
): Promise<SuspendUserResponse> {
    return apiRequest<SuspendUserResponse>('/admin/manage/suspend', 'POST', undefined, { userId });
}

export async function revokeUser(
    userId: RevokeUserRequest['userId']
): Promise<RevokeUserResponse> {
    return apiRequest<RevokeUserResponse>('/admin/manage/revoke', 'POST', undefined, { userId });
}

export async function manageUserAccess(
    userId: ManageUserAccessRequest['userId'],
    permissionOverride: ManageUserAccessRequest['permissionOverride']
): Promise<ManageUserAccessResponse> {
    return apiRequest<ManageUserAccessResponse>('/admin/manage/access/user', 'POST', undefined, {
        userId,
        permissionOverride,
    });
}