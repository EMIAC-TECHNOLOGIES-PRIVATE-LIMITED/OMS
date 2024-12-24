import { apiRequest } from './APIService';
import {
    SignInRequest,
    SignInResponse,
    SignOutResponse,
    SignUpRequest,
    SignUpResponse,
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

export async function signUp(
    name: SignUpRequest['name'],
    email: SignUpRequest['email'],
    password: SignUpRequest['password'],
    roleId: SignUpRequest['roleId']
): Promise<SignUpResponse> {
    return apiRequest<SignUpResponse>('/user/signup', 'POST', undefined, {
        name,
        email,
        password,
        roleId,
    });
}
