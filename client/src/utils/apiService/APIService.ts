import axiosInstance from './axiosInstance';
import { Method } from 'axios';

export async function apiRequest<T>(
    endpoint: string,
    method: Method,
    params?: Record<string, any>,
    data?: any
): Promise<T> {
    try {
        const response = await axiosInstance.request<T>({
            url: endpoint,
            method,
            params,
            data,
        });
        return response.data;
    } catch (error: any) {
        console.error('API Request Error:', error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
}0