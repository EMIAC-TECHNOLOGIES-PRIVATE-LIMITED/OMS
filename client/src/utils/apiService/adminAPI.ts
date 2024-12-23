import { apiRequest } from './APIService';

export async function getAllRoles() {
    return apiRequest<{ roles: Array<{ id: number; name: string }> }>('/admin/info/roles', 'GET');
}

export async function getAllUsers() {
    return apiRequest<{ users: Array<{ id: number; name: string; email: string }> }>('/admin/info/users', 'GET');
}

export async function getAllPermissions() {
    return apiRequest<{ permissions: Array<{ id: number; key: string; description: string }> }>(
        '/admin/info/access',
        'GET'
    );
}

export async function getRolePermissions(roleId: number) {
    return apiRequest<{ permissions: Array<{ id: number; key: string; granted: boolean }> }>(
        '/admin/info/access/role',
        'GET',
        { roleId }
    );
}

export async function getUserPermissions(userId: number) {
    return apiRequest<{ permissions: Array<{ id: number; key: string; granted: boolean }> }>(
        '/admin/info/access/user',
        'GET',
        { userId }
    );
}

export async function suspendUser(userId: number) {
    return apiRequest<void>('/admin/manage/suspend', 'POST', undefined, { userId });
}

export async function revokeUser(userId: number) {
    return apiRequest<void>('/admin/manage/revoke', 'POST', undefined, { userId });
}

export async function manageUserAccess(userId: number, permissionOverride: any[]) {
    return apiRequest<void>('/admin/manage/access/user', 'POST', undefined, {
        userId,
        permissionOverride,
    });
}