import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { api, ApiError } from '@/services/api';
import type { User } from '@/services/api-types';

const TOKEN_KEY = 'parentpal_access_token';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSession = useCallback(async () => {
    const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setUser(null);
      setToken(null);
      return;
    }

    try {
      const currentUser = await api.getMe(storedToken);
      setToken(storedToken);
      setUser(currentUser);
    } catch {
      await AsyncStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    loadSession().finally(() => setIsLoading(false));
  }, [loadSession]);

  const login = useCallback(async (email: string, password: string) => {
    const { access_token } = await api.login(email.trim(), password);
    await AsyncStorage.setItem(TOKEN_KEY, access_token);
    const currentUser = await api.getMe(access_token);
    setToken(access_token);
    setUser(currentUser);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    await api.register(email.trim(), password);
    await login(email, password);
  }, [login]);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, isLoading, login, register, logout }),
    [user, token, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}
