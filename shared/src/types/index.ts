export interface SignInRequest {
    email: string;
    password: string;
}

export interface SignInResponse {
    status: number;
    message: string;
    success: boolean;
    data: {
        id: number;
        email: string;
        name: string;
        role: {
            id: number;
            name: string;
        };
        permissions: Array<{
            id: number;
            name: string;
        }>;
    };
}

export interface SignOutResponse {
    status: number;
    message: string;
    success: boolean;
    data: {
        status: number;
        message: string;
        success: boolean;
    };
}

export interface SignUpRequest {
    name: string;
    email: string;
    password: string;
    roleId: number;
}

export interface SignUpResponse {
    status: number;
    message: string;
    success: boolean;
    data: { userId: number };
}

export interface UserInfoResponse {
    status: number;
    message: string;
    success: boolean;
    data: {
        id: number;
        email: string;
        name: string;
        role: {
            id: number;
            name: string;
        };
        permissions: Array<{
            id: number;
            name: string;
        }>;
    };
}

export interface GetAllRolesResponse {
    status: number;
    message: string;
    data: Array<{
        id: number;
        name: string;
        _count: {
            users: number;
        };
    }>;
    success: boolean;
}

export interface GetAllUsersResponse {
    status: number;
    message: string;
    data: Array<{
        id: number;
        name: string;
        role: {
            name: string;
        };
        suspended: boolean;
    }>;
    success: boolean;
}

export interface GetAllPermissionsResponse {
    status: number;
    message: string;
    data: {
        permissions: Array<{
            id: number;
            name: string;
        }>;
        resources: Array<{
            id: number;
            table: string;
            column: string;
        }>;
    };
    success: boolean;
}

export interface GetRolePermissionsRequest {
    roleId: number;
}

export interface GetRolePermissionsResponse {
    status: number;
    message: string;
    data: {
        permissions: Array<{
            id: number;
            name: string;
        }>;
        resources: Array<{
            id: number;
            table: string;
            column: string;
        }>;
    };
    success: boolean;
}

export interface GetUserPermissionsRequest {
    userId: number;
}

export interface GetUserPermissionsResponse {
    status: number;
    message: string;
    data: {
        roleId: number;
        name: string;
        isSuspended: boolean;
        permissions: Array<{
            id: number;
            name: string;
        }>;
        permissionOverrides: Array<{
            permissionId: number;
            granted: boolean;
        }>;
        resources: Array<{
            id: number;
            table: string;
            column: string;
        }>;
        resourceOverrides: Array<{
            resourceId: number;
            granted: boolean;
        }>;
    };
    success: boolean;
}

export interface SuspendUserRequest {
    userId: number;
}

export interface SuspendUserResponse {
    status: number;
    message: string;
    success: boolean;
}

export interface RevokeUserRequest {
    userId: number;
}

export interface RevokeUserResponse {
    status: number;
    message: string;
    success: boolean;
}

export interface ManageUserAccessRequest {
    userId: number;
    roleId?: number;
    permissionOverride: Array<{
        permissionId: number;
        granted: boolean;
    }>;
    resourceOverride: Array<{
        resourceId: number;
        granted: boolean;
    }>;
}

export interface ManageUserAccessResponse {
    status: number;
    message: string;
    success: boolean;
}

export interface ManageRoleAccessRequest {
    roleId: number;
    permissions: Array<{ id: number }>;
    resources: Array<{ id: number }>;
}

export interface ManageRoleAccessResponse {
    status: number;
    message: string;
    success: boolean;
}



export interface GetViewDataResponse {
    status: number;
    message: string;
    data: {
        viewId: number;
        viewName: string;
        totalRecords: number;
        page: number;
        pageSize: number;
        data: Array<{
            website: string;
        }>;
        availableColumns: string[];
        availableColumnsType: {
            [key: string]: string;
        };
        appliedFilters: FilterConfig['appliedFilters'];
        appliedSorting: FilterConfig['appliedSorting'];
        column: FilterConfig['columns'];
        views: Array<{
            id: number;
            viewName: string;
        }>;
    };
    success: boolean;
}

export interface GetFilteredDataRequest {
    columns: string[];
    filters: FilterConfig['appliedFilters'];
    sorting: FilterConfig['appliedSorting'];
    page: number;
    pageSize: number;
}

export interface GetFilteredDataResponse {
    status: number;
    message: string;
    data: {
        totalRecords: number;
        page: number;
        pageSize: number;
        data: Array<{
            website: string;
        }>;
        availableColumns: string[];
        availableColumnsType: {
            [key: string]: string;
        };
        appliedFilters: FilterConfig['appliedFilters'];
        appliedSorting: FilterConfig['appliedSorting'];
        column: FilterConfig['columns'];
        views: Array<{
            id: number;
            viewName: string;
        }>;
    };
    success: boolean;
}

export interface CreateViewRequest {
    viewName: string;
    columns: string[];
    filters: FilterConfig['appliedFilters'];
    sorting: FilterConfig['appliedSorting'];
}

export interface CreateViewResponse {
    status: number;
    message: string;
    data: {
        viewId: number;
        views: Array<{
            id: number;
            viewName: string;
        }>;
    };
    success: boolean;
}

export interface UpdateViewRequest {
    viewId: number;
    viewName: string;
    columns: string[];
    filters: FilterConfig['appliedFilters'];
    sorting: FilterConfig['appliedSorting'];
}

export interface UpdateViewResponse {
    status: number;
    message: string;
    success: boolean;
    data: {
        views: Array<{
            id: number;
            viewName: string;
        }>;
    };
}

export interface DeleteViewRequest {
    viewId: number;
}

export interface DeleteViewResponse {
    status: number;
    message: string;
    success: boolean;
    data: {
        views: Array<{
            id: number;
            viewName: string;
        }>;
    }
}

export interface HealthCheckResponse {
    status: number;
    message: string;
    success: boolean;
}

export enum LogicalOperator {   
    AND = 'AND',
    OR = 'OR'
}

export interface FilterCondition {
    equals?: string | number | boolean | Date;
    not?: string | number | boolean | Date | FilterCondition;
    in?: Array<string | number | boolean | Date>;
    notIn?: Array<string | number | boolean | Date>;
    lt?: string | number | Date;
    lte?: string | number | Date;
    gt?: string | number | Date;
    gte?: string | number | Date;
    contains?: string;
    startsWith?: string;
    endsWith?: string;
    mode?: 'default' | 'insensitive';
    some?: FilterCondition;
    every?: FilterCondition;
    none?: FilterCondition;
    is?: FilterCondition;
    isNot?: FilterCondition;
}

// Interface for Sorting
export interface SortingConfig {
    [key: string]: 'asc' | 'desc'
}

// Main FilterConfig Interface
export interface FilterConfig {
    columns: string[];
    appliedFilters: {
        [key in LogicalOperator]?: Array<{
            [key: string]: FilterCondition;
        }>;
    };
    appliedSorting: SortingConfig[];
}


// export interface FilterConfig {
//     columns: string[];
//     appliedFilters: {
//         [key in LogicalOperator]?: Array<{
//             [key: string]: {
//                 contains?: string;
//                 equals?: string | number;
//                 startsWith?: string;
//                 endsWith?: string;
//             };
//         }>;
//     };
//     appliedSorting: Array<{
//         [key: string]: 'asc' | 'desc';
//     }>;
// }

export interface View {
    id: number;
    viewName: string;
}

export interface APIResponse<T = any> {
    status: number; // HTTP status code
    message: string; // Success or descriptive message
    data: T; // The response data, can be of any type or specified type
    success: boolean; // Indicates if the request was successful
}

export interface APIError {
    status: number; // HTTP status code
    message: string; // Error message
    errors: any; // Detailed error information, can be any type
    success: boolean; // Always false for API errors
}

export interface UpdateDataResponse {
    status: number;
    message: string;
    success: boolean;
    data: Record<string, any>;
}



