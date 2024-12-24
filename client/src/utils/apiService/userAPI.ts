import { apiRequest } from './APIService';
import { UserInfoResponse } from '../../../../shared/src/types';

export async function getUserInfo(): Promise<UserInfoResponse> {
    return apiRequest<UserInfoResponse>('/user/me', 'GET');
}
