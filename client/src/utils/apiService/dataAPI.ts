import { apiRequest } from './APIService';

export async function getViewData() {
    return apiRequest<{ viewId: number; data: any[] }>('/data/site', 'GET');
}

export async function getFilteredData(columns: string[], filters: any, sorting: any) {
    return apiRequest<{ data: any[] }>('/data/site/data', 'POST', undefined, {
        columns,
        filters,
        sorting,
    });
}

export async function createView(
    viewName: string,
    columns: string[],
    filters: any,
    sorting: any
) {
    return apiRequest<{ viewId: number }>('/data/site', 'POST', undefined, {
        viewName,
        columns,
        filters,
        sorting,
    });
}

export async function updateView(
    viewId: number,
    viewName: string,
    columns: string[],
    filters: any,
    sorting: any
) {
    return apiRequest<void>(`/data/site/${viewId}`, 'PUT', undefined, {
        viewName,
        columns,
        filters,
        sorting,
    });
}

export async function deleteView(viewId: number) {
    return apiRequest<void>(`/data/site/${viewId}`, 'DELETE');
}
