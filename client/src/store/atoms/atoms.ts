import { atom } from 'recoil';

interface AuthData {
  isAuthenticated: boolean;
  loading: boolean;
  userInfo: {
    id: number;
    email: string;
    name: string;
    role: {
      id: number;
      name: string;
    };
    permissions: Array<{
      id: number;
      name: string;
    }>;
  }
}

export const authAtom = atom<AuthData>({
  key: 'authAtom',
  default: {
    isAuthenticated: false,
    loading: true,
    userInfo: {
      id: 0,
      name: '',
      role: {
        id: 0,
        name: ''
      },
      email: '',
      permissions: [],
    }
  }
});

export const globalErrorAtom = atom<string | null>({
  key: 'globalErrorAtom',
  default: null,
});

export const showFabAtom = atom<boolean>({
  key: 'showAtom',
  default: true,
});
