import { useState, useEffect, useMemo } from 'react';
import { Invoice } from '../types';
import { mockInvoices } from '../mockData';

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        setInvoices(mockInvoices);
      } catch (error) {
        console.error('Failed to fetch invoices', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((i) => 
      i.id.toLowerCase().includes(search.toLowerCase()) || 
      i.client.toLowerCase().includes(search.toLowerCase())
    );
  }, [invoices, search]);

  return {
    invoices: filteredInvoices,
    totalInvoices: invoices.length,
    loading,
    search,
    setSearch,
  };
};
