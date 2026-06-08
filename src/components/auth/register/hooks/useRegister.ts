import { useState } from 'react';
import { RegisterFormValues } from '../types';

export const useRegister = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleRegister = async (values: RegisterFormValues) => {
    setLoading(true);
    // Mock registration — redirect to dashboard
    return new Promise((resolve) => {
      console.log('Registering with values:', values);
      setTimeout(() => {
        setLoading(false);
        window.location.href = '/dashboard';
        resolve(true);
      }, 1500);
    });
  };

  return {
    loading,
    handleRegister,
  };
};
