import { apiRequest } from './APIService';

export async function getUserInfo() {
    return apiRequest<{ id: number; name: string; email: string }>('/user/me', 'GET');
}
