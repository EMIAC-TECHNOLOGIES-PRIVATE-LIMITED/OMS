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

export async function getViewData(): Promise<GetViewDataResponse> {
    return apiRequest<GetViewDataResponse>('/data/site', 'GET');
}

export async function getFilteredData(
    columns: GetFilteredDataRequest['columns'],
    filters: GetFilteredDataRequest['filters'],
    sorting: GetFilteredDataRequest['sorting']
): Promise<GetFilteredDataResponse> {
    return apiRequest<GetFilteredDataResponse>('/data/site/data', 'POST', undefined, {
        columns,
        filters,
        sorting,
    });
}

export async function createView(
    viewName: CreateViewRequest['viewName'],
    columns: CreateViewRequest['columns'],
    filters: CreateViewRequest['filters'],
    sorting: CreateViewRequest['sorting']
): Promise<CreateViewResponse> {
    return apiRequest<CreateViewResponse>('/data/site', 'POST', undefined, {
        viewName,
        columns,
        filters,
        sorting,
    });
}

export async function updateView(
    viewId: UpdateViewRequest['viewId'],
    viewName: UpdateViewRequest['viewName'],
    columns: UpdateViewRequest['columns'],
    filters: UpdateViewRequest['filters'],
    sorting: UpdateViewRequest['sorting']
): Promise<UpdateViewResponse> {
    return apiRequest<UpdateViewResponse>(`/data/site/${viewId}`, 'PUT', undefined, {
        viewName,
        columns,
        filters,
        sorting,
    });
}

export async function deleteView(viewId: number): Promise<DeleteViewResponse> {
    return apiRequest<DeleteViewResponse>(`/data/site/${viewId}`, 'DELETE');
}
