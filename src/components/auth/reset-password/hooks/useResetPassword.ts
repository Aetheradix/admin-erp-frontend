import { useState } from 'react';

export const useResetPassword = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const handleReset = async (values: any) => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        resolve(true);
      }, 1500);
    });
  };

  return {
    loading,
    success,
    handleReset,
  };
};
