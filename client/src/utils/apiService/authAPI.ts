import { apiRequest } from './APIService';
import {
    SignInRequest,
    SignInResponse,
    SignOutResponse,
} from '../../../../shared/src/types';

export async function signIn(
    email: SignInRequest['email'],
    password: SignInRequest['password']
): Promise<SignInResponse> {
    return apiRequest<SignInResponse>('/user/signin', 'POST', undefined, { email, password });
}

export async function signOut(): Promise<SignOutResponse> {
    return apiRequest<SignOutResponse>('/user/signout', 'POST');
}

