// Input and Output Types for adminController

// General Response Types
export interface SuccessResponse<T> {
    success: true;
    data: T;
    message?: string;
}

export interface ErrorResponse {
    success: false;
    message: string;
    detail?: string;
}

export type APIResponse<T> = SuccessResponse<T> | ErrorResponse;

// Suspend and Revoke User
export interface SuspendUserInput {
    userId: number;
}

export interface SuspendUserOutput {
    message: string;
}


// Manage User Access
export interface ManageUserAccessInput {
    userId: number;
    permissionOverride: PermissionOverrideInput[];
    resourcesOverride: ResourceOverrideInput[];
}

export interface PermissionOverrideInput {
    permissionId: number;
    granted: boolean;
}

export interface ResourceOverrideInput {
    resourceId: number;
    granted: boolean;
}

export interface ManageUserAccessOutput {
    message: string;
}

// Manage Role Access
export interface ManageRoleAccessInput {
    roleId: number;
    permissions: { id: number }[];
    resources: { id: number }[];
}

export interface ManageRoleAccessOutput {
    message: string;
}

// Get Roles
export interface RoleData {
    id: number;
    name: string;
    _count: {
        users: number;
    };
}

export interface GetRolesOutput {
    data: RoleData[];
}

// Get Users
export interface UserData {
    id: number;
    name: string;
    role: {
        name: string;
    };
    suspended: boolean;
}

export interface GetUsersOutput {
    data: UserData[];
}

// Get User Access
export interface GetUserAccessInput {
    userId: number;
}

export interface AccessData {
    table: string;
    columns: string[];
}

export interface GetUserAccessOutput {
    data: AccessData[];
}

// Get Role Access
export interface GetRoleAccessInput {
    roleId: number;
}

export interface GetRoleAccessOutput {
    data: AccessData[];
}

// Get All Access
export interface GetAllAccessOutput {
    data: AccessData[];
}

