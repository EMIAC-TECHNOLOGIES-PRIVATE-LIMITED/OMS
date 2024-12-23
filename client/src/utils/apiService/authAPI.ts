import { apiRequest } from './APIService';

export async function signIn(email: string, password: string) {
    return apiRequest<{ token: string }>(
        '/user/signin',
        'POST',
        undefined,
        { email, password }
    );
}

export async function signOut() {
    return apiRequest<void>('/user/signout', 'POST');
}

export async function signUp(name: string, email: string, password: string, roleId: number) {
    return apiRequest<{ userId: number }>('/user/signup', 'POST', undefined, {
        name,
        email,
        password,
        roleId,
    });
}