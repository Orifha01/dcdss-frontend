import { create } from 'zustand';
import type { LoginResponse, Role } from '@/types/api';

const TOKEN_KEY = 'dcdss_token';

interface AuthState {
  token: string | null;
  username: string | null;
  role: Role | null;
  isAuthenticated: boolean;

  login: (response: LoginResponse) => void;
  logout: () => void;
  rehydrate: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  token: null,
  username: null,
  role: null,
  isAuthenticated: false,

  login: (response: LoginResponse) => {
    localStorage.setItem(TOKEN_KEY, response.token);
    set({
      token: response.token,
      username: response.username,
      role: response.role as Role,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({
      token: null,
      username: null,
      role: null,
      isAuthenticated: false,
    });
  },

  rehydrate: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    try {
      // Decode JWT payload (base64url → base64 → JSON)
      const payloadB64 = token.split('.')[1];
      const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadJson) as Record<string, unknown>;

      // .NET JWT stores role in the long claim name
      const roleClaimKey =
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
      const nameclaimKey =
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';

      const role =
        (payload[roleClaimKey] as Role) ||
        (payload['role'] as Role) ||
        null;
      const username =
        (payload[nameclaimKey] as string) ||
        (payload['username'] as string) ||
        (payload['sub'] as string) ||
        null;

      set({ token, username, role, isAuthenticated: true });
    } catch {
      // Token is malformed — clear it
      localStorage.removeItem(TOKEN_KEY);
    }
  },
}));

export default useAuthStore;
