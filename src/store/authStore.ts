import { create } from 'zustand';
import type { LoginResponse, Role } from '@/types/api';

const TOKEN_KEY = 'dcdss_token';

interface AuthState {
  token: string | null;
  username: string | null;
  role: Role | null;
  userId: number | null;
  isAuthenticated: boolean;

  login: (response: LoginResponse) => void;
  logout: () => void;
  rehydrate: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  token: null,
  username: null,
  role: null,
  userId: null,
  isAuthenticated: false,

  login: (response: LoginResponse) => {
    localStorage.setItem(TOKEN_KEY, response.token);
    // Decode userId from token on login too
    let userId: number | null = null;
    try {
      const payloadB64 = response.token.split('.')[1];
      const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'))) as Record<string, unknown>;
      const nameIdKey = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
      userId = Number(payload[nameIdKey] ?? payload['nameid'] ?? payload['sub'] ?? payload['userId']) || null;
    } catch { /* ignore */ }
    set({
      token: response.token,
      username: response.username,
      role: response.role as Role,
      userId,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({
      token: null,
      username: null,
      role: null,
      userId: null,
      isAuthenticated: false,
    });
  },

  rehydrate: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    try {
      const payloadB64 = token.split('.')[1];
      const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadJson) as Record<string, unknown>;

      const roleClaimKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
      const nameclaimKey = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';
      const nameIdKey = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';

      const role = (payload[roleClaimKey] as Role) || (payload['role'] as Role) || null;
      const username =
        (payload[nameclaimKey] as string) ||
        (payload['username'] as string) ||
        (payload['sub'] as string) ||
        null;
      const userId = Number(payload[nameIdKey] ?? payload['nameid'] ?? payload['sub'] ?? payload['userId']) || null;

      set({ token, username, role, userId, isAuthenticated: true });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
    }
  },
}));

export default useAuthStore;
