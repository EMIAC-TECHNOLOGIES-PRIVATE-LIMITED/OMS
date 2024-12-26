
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
        email: string
        name: string;
        role: {
            id: number;
            name: string;
        };
        permissions: Array<{
            id: number;
            name: string;
        }>;
    }
}

export interface SignOutResponse {
    status: number;
    message: string;
    success: boolean;
    data:
    {
        status: number;
        message: string;
        success: boolean;
    }
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
    data: { userId: number }
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
    }
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


export interface GetViewDataResponse {
    status: number;
    message: string;
    data: {
        viewId: number;
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
        appliedFilters: {
            [key in LogicalOperator]: Array<{
                [key: string]: {
                    contains?: string;
                    equals?: string | number;
                    startsWith?: string;
                    endsWith?: string;
                };
            }>;
        };
        appliedSorting: Array<{
            [key: string]: 'asc' | 'desc';
        }>;
        views: Array<{
            id: number;
            viewName: string;
        }>;
    };
    success: boolean;
}


export interface GetFilteredDataRequest {
    columns: string[];
    filters: {
        [key in LogicalOperator]: Array<{
            [key: string]: {
                contains: string;
            };
        }>;
    };
    sorting: Array<{
        [key: string]: "asc" | "desc";
    }>;
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
        availableColumns: {
            [key: string]: string;
        };
        appliedFilters: {
            [key in LogicalOperator]: Array<{
                [key: string]: {
                    contains?: string;
                };
            }>;
        };
        appliedSorting: Array<{
            [key: string]: "asc" | "desc";
        }>;
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
    filters: {
        [key in LogicalOperator]: Array<{
            [key: string]: {
                contains: string;
            };
        }>;
    };
    sorting: Array<{
        [key: string]: "asc" | "desc";
    }>;
}

export interface CreateViewResponse {
    status: number;
    message: string;
    data: {
        id: number;
        userId: number;
        tableId: string;
        viewName: string;
        columns: string[];
        filters: {
            [key in LogicalOperator]: Array<{
                [key: string]: {
                    contains?: string;
                };
            }>;
        };
        sort: Array<{
            [key: string]: "asc" | "desc";
        }>;
        groupBy?: string[];
        createdAt?: Record<string, any>;
        updatedAt?: Record<string, any>;
    };
    success: boolean;
}

export interface UpdateViewRequest {
    viewId: number;
    viewName: string;
    columns: string[];
    filters: {
        [key in LogicalOperator]: Array<{
            [key: string]: {
                contains: string;
            };
        }>;
    };
    sorting: Array<{
        [key: string]: "asc" | "desc";
    }>;
}

export interface UpdateViewResponse {
    status: number;
    message: string;
    success: boolean;
    data: {
        id: number;
        userId: number;
        tableId: string;
        viewName: string;
        columns: string[];
        filters: {
            [key in LogicalOperator]: Array<{
                [key: string]: {
                    contains?: string;
                };
            }>;
        };
        sort: Array<{
            [key: string]: "asc" | "desc";
        }>;
        groupBy: string[];
        createdAt: Record<string, any>;
        updatedAt: Record<string, any>;
    };
}


export interface DeleteViewRequest {
    viewId: number;
}

export interface DeleteViewResponse {
    status: number;
    message: string;
    success: boolean;
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

export interface FilterConfig {
    appliedFilters: {
        [key in LogicalOperator]?: Array<{
            [key: string]: {
                contains?: string;
                equals?: string | number;
                startsWith?: string;
                endsWith?: string;
            };
        }>;
    };
    appliedSorting: Array<{
        [key: string]: 'asc' | 'desc';
    }>;
}
