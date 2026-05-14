import { useState } from 'react';

export const useForgotPassword = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = async (values: { email: string }) => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setLoading(false);
        setSubmitted(true);
        resolve(true);
      }, 1500);
    });
  };

  return {
    loading,
    submitted,
    setSubmitted,
    handleSubmit,
  };
};
