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
} from '../../../../shared/src/types';

// dataAPI.ts
export async function getViewData(route: string, viewId?: number): Promise<GetViewDataResponse> {
    let endpoint = `/data/${route}`;

    if (viewId != null) {
        endpoint += `/${viewId}`;
    }

    return apiRequest<GetViewDataResponse>(endpoint, 'GET');
}


export async function getFilteredData(
    route: string,
    columns: GetFilteredDataRequest['columns'],
    filters: GetFilteredDataRequest['filters'],
    sorting: GetFilteredDataRequest['sorting'],
    page: GetFilteredDataRequest['page'] = 1,
    pageSize: GetFilteredDataRequest['pageSize'] = 25

): Promise<GetFilteredDataResponse> {
    return apiRequest<GetFilteredDataResponse>(`/data/${route}/data?page=${page}&pageSize=${pageSize}`, 'POST', undefined, {
        columns,
        filters,
        sorting,
    });
}

export async function createView(
    route: string,
    viewName: CreateViewRequest['viewName'],
    columns: CreateViewRequest['columns'],
    filters: CreateViewRequest['filters'],
    sorting: CreateViewRequest['sorting']
): Promise<CreateViewResponse> {
    return apiRequest<CreateViewResponse>(`/data/${route}`, 'POST', undefined, {
        viewName,
        columns,
        filters,
        sorting,
    });
}

export async function updateView(
    route: string,
    viewId: UpdateViewRequest['viewId'],
    viewName: UpdateViewRequest['viewName'],
    columns: UpdateViewRequest['columns'],
    filters: UpdateViewRequest['filters'],
    sorting: UpdateViewRequest['sorting']
): Promise<UpdateViewResponse> {
    return apiRequest<UpdateViewResponse>(`/data/${route}/${viewId}`, 'PUT', undefined, {
        viewName,
        columns,
        filters,
        sorting,
    });
}

export async function deleteView(
    route: string,
    viewId: number): Promise<DeleteViewResponse> {
    return apiRequest<DeleteViewResponse>(`/data/${route}/${viewId}`, 'DELETE');
}


export async function deleteData(
    route: string,
    data: {
        id: number;
    }
): Promise<any> {
    return apiRequest<any>(`/data/${route}/delete`, 'DELETE', undefined, data);
}


export async function updateData(
    route: string,
    data: Record<string, any>
): Promise<any> {
    return apiRequest<UpdateDataResponse>(`/data/${route}/update`, 'PUT', undefined, data);
}

export async function createData(
    route: string,
    data: Record<string, any>
): Promise<any> {
    return apiRequest<any>(`/data/${route}/create`, 'PUT', undefined, data);
}
