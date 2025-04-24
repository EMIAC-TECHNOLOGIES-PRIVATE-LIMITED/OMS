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

export interface createUserRequest {
    name: string;
    email: string;
    password: string;
    roleId: number;
}

export interface createUserResponse {
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
    data: {
        users: Array<{
            id: number;
            name: string;
            email: string;
            role: {
                name: string;
            };
            suspended: boolean;

        }>;
        totalUsers: number;
    }
    success: boolean;
}

export interface GetAllPermissionsResponse {
    status: number;
    message: string;
    data: {
        permissions: Array<{
            id: number;
            key: string;
        }>;
        resources: Array<{
            id: number;
            key: string
        }>;
        team: Array<{
            id: number;
            name: string;
            role: {
                id: number;
                name: string;
            }
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
            key: string;
        }>;
        resources: Array<{
            id: number;
            key: string;
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
            key: string;
        }>;
        permissionOverrides: Array<{
            permissionId: number;
            granted: boolean;
        }>;
        resources: Array<{
            id: number;
            key: string;
        }>;
        resourceOverrides: Array<{
            resourceId: number;
            granted: boolean;
        }>;
        userAccess: number[];
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
    userAccess: number[];
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
        filteredCount: number;
        totalCount: number;
        data: Array<{
            [key: string]: string | number | boolean | Date | unknown;
        }>;
        availableColumnsType: {
            [key: string]: string;
        };
        columnDefinations: {
            [key: string]: string;
        };
        appliedFilters: FilterConfig;
        views: Array<{
            id: number;
            viewName: string;
        }>;
        columnOrder: string[];
    };
    success: boolean;
}

export interface GetFilteredDataRequest {
    appliedFilters: FilterConfig;
    globalFilterString: String;
    columnOrder: string[];
    page: number;
    pageSize: number;
}

export interface GetFilteredDataResponse {
    status: number;
    message: string;
    data: {
        filteredCount: number;
        data: Array<{
            [key: string]: string | number | boolean | Date | unknown;
        }>;
    };
    success: boolean;
}

export interface CreateViewRequest {
    viewName: string;
    filterConfig: FilterConfig;
    columnOrder: string[];
}

export interface CreateViewResponse {
    status: number;
    message: string;
    data: {
        newViewId: number;
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
    appliedFilters: FilterConfig;
    columnOrder: string[];
}

export interface UpdateViewResponse {
    status: number;
    message: string;
    success: boolean;
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
    columns?: string[];
    filters?: Array<{
        column: string;
        operator: string;
        value: any;
    }>;
    connector?: 'AND' | 'OR';
    sort?: {
        [key: string]: 'asc' | 'desc';
    }[];
}

export interface View {
    id: number;
    userId: number
    viewName: string;

    tableId: string;
    filterConfig: FilterConfig;
    columnOrder: string[];

    createdAt: Date;
    updatedAt: Date;

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
}

export interface createDataResponse {
    status: number;
    message: string;
    success: boolean;
}
export interface deleteDataResponse {
    status: number;
    message: string;
    success: boolean;
}

export interface WebsiteCheckerResponse {
    status: number;
    message: string;
    success: boolean;
    data: {
        duplicates: string[];
        newDomains: string[];
        trashSites: string[];
        blacklistSites: string[];
    };
}

export interface PriceCheckerResponse {
    status: number;
    message: string;
    success: boolean;
    data: {
        domainsFound: Array<{
            website: string;
            vendor: {
                id?: number;
                name?: string;
                phone?: string;
                email?: string;

            };
            price: number;
            sellingPrice: number | null;
            discount: number | null;
        }>;
        domainsNotFound: string[];
    }
}

export interface VendorCheckerResponse {
    status: number;
    message: string;
    success: boolean;
    data: {
        domainsFound: Record<string, Array<{
            vendorId: number;
            vendorName: string;
            vendorPhone: string | null;
            vendorEmail: string | null;
            costPrice: number;
            noOfOrders: number;
            latestOrderDate: Date | null;
        }>>;
        domainsNotFound: string[];
    };
}

export interface categoryLinksResponse {
    status: number;
    message: string;
    success: boolean;
    data: {
        data: Array<{
            website: string;
            category: string;
            categoryLink: string;
        }>;
    }
}

export interface nicheDomainsResponse {
    status: number;
    message: string;
    success: boolean;
    data: {
        niches: Array<{
            niche: string;
            count: number;
        }>;
    }
}

export interface getDispatchedDomainsResponse {
    status: number;
    message: string;
    success: boolean;
    data: {
        dispatchedDomains: Array<{
            domain: string;
            costPrice: number;
            client: string;
            poc: string;
            project: string;
            dispatchDate: Date;
        }>;
        previousDispatchedDomains: Array<{
            domain: string;
            costPrice: number;
            client: string;
            poc: string;
            project: string;
            dispatchDate: Date;
        }>;

        freshDomeains: string[];
    };
}

export interface addDispatchedDomainsRequest {
    domains: Array<{
        domain: string;
        costPrice: number;
        client: string;
        poc: string;
        project: string;

    }>;
}

export interface addDispatchedDomainsResponse {
    status: number;
    message: string;
    success: boolean;
    data: {}
}