import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import useAuthStore from '@/store/authStore';
import type { LoginRequest } from '@/types/api';

export function useAuth() {
  const { username, role, isAuthenticated, login, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(credentials);
      login(response);
      toast.success(`Welcome back, ${response.username}!`);
      navigate('/');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return {
    user: { username, role },
    isAuthenticated,
    login: handleLogin,
    logout: handleLogout,
    isLoading,
    error,
  };
}
