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

  const addPayrollEntry = (data: Omit<PayrollEntry, 'id' | 'status' | 'netPay'>) => {
    const base = parseFloat(data.baseSalary.replace(/[^0-9.-]+/g, ""));
    const bonus = parseFloat(data.bonus.replace(/[^0-9.-]+/g, ""));
    const deductions = parseFloat(data.deductions.replace(/[^0-9.-]+/g, ""));
    const net = base + bonus - deductions;

    const newEntry: PayrollEntry = {
      ...data,
      id: `PAY-${Math.floor(Math.random() * 10000)}`,
      status: 'pending',
      netPay: `$${net.toLocaleString()}`,
    };
    setPayroll((prev) => [newEntry, ...prev]);
  };

  return {
    payroll,
    loading,
    addPayrollEntry,
  };
};
