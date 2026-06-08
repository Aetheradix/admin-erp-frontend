import { useState } from 'react';

export const useForgotPassword = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = async (values: { email: string }) => {
    setLoading(true);
    return new Promise((resolve) => {
      console.log('Submitting forgot password with values:', values);
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
