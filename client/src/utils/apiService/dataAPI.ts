import { apiRequest } from './APIService';
import {
    GetViewDataResponse,
    GetFilteredDataRequest,
    GetFilteredDataResponse,
    CreateViewRequest,
    CreateViewResponse,
    UpdateViewRequest,
    DeleteViewResponse,
    UpdateViewResponse,
    UpdateDataResponse,
    deleteDataResponse,
    createDataResponse,
} from '../../../../shared/src/types';

// dataAPI.ts
export async function getViewData(route: string, viewId?: number): Promise<GetViewDataResponse> {
    let endpoint = `/data/${route}`;

    if (viewId != null) {
        endpoint += `/${viewId}`;
    }

    const reponse = apiRequest<GetViewDataResponse>(endpoint, 'GET');
    console.log("response from the api handler:  ", reponse);
    return reponse;
}


export async function getFilteredData(
    route: string,
    appliedFilters: GetFilteredDataRequest['appliedFilters'],
    page: GetFilteredDataRequest['page'] = 1,
    pageSize: GetFilteredDataRequest['pageSize'] = 25,
    columnOrder: GetFilteredDataRequest['columnOrder'] = [],
    globalFilterString : GetFilteredDataRequest['globalFilterString'] = ''

): Promise<GetFilteredDataResponse> {
    return apiRequest<GetFilteredDataResponse>(`/data/${route}/data?page=${page}&pageSize=${pageSize}`, 'POST', undefined, {
        appliedFilters,
        columnOrder, 
        globalFilterString
    });
}

export async function createView(
    route: string,
    viewName: CreateViewRequest['viewName'],
    filterConfig: CreateViewRequest['filterConfig'],
    columnOrder: CreateViewRequest['columnOrder'] = []
): Promise<CreateViewResponse> {
    return apiRequest<CreateViewResponse>(`/data/${route}`, 'POST', undefined, {
        viewName,
        filterConfig,
        columnOrder
    });
}

export async function updateView(
    route: string,
    viewId: UpdateViewRequest['viewId'],
    viewName: UpdateViewRequest['viewName'],
    filterConfig: UpdateViewRequest['appliedFilters'], 
    
): Promise<UpdateViewResponse> {
    return apiRequest<UpdateViewResponse>(`/data/${route}`, 'PUT', undefined, {
        viewId,
        viewName,
        filterConfig
    });
}

export async function updateColumnOrder(
    route: string,
    columnOrder: UpdateViewRequest['columnOrder'],
    viewId: UpdateViewRequest['viewId']
): Promise<Response> {
    return apiRequest<Response>(`/data/${route}/columnOrder`, 'PUT', undefined, {
        columnOrder,
        viewId
    });
}

export async function deleteView(
    route: string,
    viewId: number): Promise<DeleteViewResponse> {
    return apiRequest<DeleteViewResponse>(`/data/${route}`, 'DELETE', undefined, {
        viewId
    }
    );
}


export async function deleteData(
    route: string,
    data: number[]
): Promise<deleteDataResponse> {
    return await apiRequest<deleteDataResponse>(`/data/${route}/delete`, 'DELETE', undefined, data);
}


export async function updateData(
    route: string,
    data: Record<string, any>
): Promise<UpdateDataResponse> {
    return apiRequest<UpdateDataResponse>(`/data/${route}/update`, 'PUT', undefined, data);
}

export async function updateOrder(
    data: Record<string, any>
): Promise<UpdateDataResponse> {
    return apiRequest<UpdateDataResponse>(`/data/updateOrder`, 'PUT', undefined, data);
}


export async function createData(
    route: string,
    data: Record<string, any>[]
): Promise<createDataResponse> {
    return await apiRequest<createDataResponse>(`/data/${route}/create`, 'PUT', undefined, data);
}
