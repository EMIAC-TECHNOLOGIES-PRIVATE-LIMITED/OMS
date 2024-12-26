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
} from '../../../../shared/src/types';

export async function getViewData(route: string, viewId? : number): Promise<GetViewDataResponse> {
    return apiRequest<GetViewDataResponse>(`/data/${route}/${viewId}`, 'GET');
}

export async function getFilteredData(
    route: string,
    columns: GetFilteredDataRequest['columns'],
    filters: GetFilteredDataRequest['filters'],
    sorting: GetFilteredDataRequest['sorting']
): Promise<GetFilteredDataResponse> {
    return apiRequest<GetFilteredDataResponse>(`/data/${route}/data`, 'POST', undefined, {
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
