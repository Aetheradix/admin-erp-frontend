import { useState, useEffect, type ReactNode } from 'react';
import { useLoginMutation, useLogoutMutation } from '../store/api/authApiSlice';
import type { User, LoginCredentials } from '../types/auth';

import { AuthContext } from './AuthContext.base';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    return !!(token && savedUser && savedUser !== 'undefined');
  });
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && savedUser !== 'undefined') {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const [loginApi] = useLoginMutation();
  const [logoutApi] = useLogoutMutation();

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await loginApi(credentials).unwrap();
      if (response && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setIsAuthenticated(true);
        setUser(response.user);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (error) {
      // API call failed (e.g. token already expired), but we still clear
      // the local session so the user is not stuck in a broken auth state.
      console.warn('Logout API call failed, clearing session locally:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      setIsLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
