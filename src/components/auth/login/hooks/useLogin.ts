import { useState } from 'react';
import { AuthMode, LoginFormValues } from '../types';

export const useLogin = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('PASSWORD');
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true);
    // Mock login — redirect to dashboard
    return new Promise((resolve) => {
      setTimeout(() => {
        setLoading(false);
        window.location.href = '/dashboard';
        resolve(true);
      }, 1200);
    });
  };

  return {
    authMode,
    setAuthMode,
    loading,
    handleLogin,
  };
};
