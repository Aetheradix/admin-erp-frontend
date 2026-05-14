import { useState, useEffect } from 'react';
import { PayrollEntry } from '../types';
import { mockPayrollData } from '../mockData';

export const usePayroll = () => {
  const [payroll, setPayroll] = useState<PayrollEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPayroll = async () => {
      setLoading(true);
      try {
        setPayroll(mockPayrollData);
      } catch (error) {
        console.error('Failed to fetch payroll', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayroll();
  }, []);

  return {
    payroll,
    loading,
  };
};
