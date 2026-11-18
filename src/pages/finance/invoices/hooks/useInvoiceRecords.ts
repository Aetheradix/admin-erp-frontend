import { useEffect, useState } from 'react';
import { useGetInvoicesQuery } from '@/store/api/financeApiSlice';
import { INVOICE_STORAGE_KEY } from '../constants';
import { mergeBackendInvoices } from '../form';
import type { BackendInvoiceRecord, Invoice } from '../types';

function readStoredInvoices(): Invoice[] {
  try {
    const stored = localStorage.getItem(INVOICE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as Invoice[];
    }
  } catch (error) {
    console.warn('Error reading stored invoices:', error);
  }
  return [];
}

export function useInvoiceRecords() {
  const {
    data: backendInvoicesData,
    isLoading: isBackendInvoicesLoading,
    refetch: refetchBackendInvoices,
  } = useGetInvoicesQuery(undefined, { refetchOnMountOrArgChange: true });

  const [invoices, setInvoices] = useState<Invoice[]>(readStoredInvoices);
  const [syncedBackendData, setSyncedBackendData] = useState(backendInvoicesData);

  // Adjust state during render when a fresh backend snapshot arrives (React's
  // recommended alternative to syncing props into state inside an effect).
  if (backendInvoicesData !== syncedBackendData) {
    setSyncedBackendData(backendInvoicesData);
    if (Array.isArray(backendInvoicesData) && backendInvoicesData.length > 0) {
      setInvoices((previous) =>
        mergeBackendInvoices(previous, backendInvoicesData as BackendInvoiceRecord[])
      );
    }
  }

  useEffect(() => {
    try {
      localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(invoices));
    } catch (error) {
      console.warn('Error saving invoices:', error);
    }
  }, [invoices]);

  return {
    invoices,
    setInvoices,
    isBackendInvoicesLoading,
    refetchBackendInvoices,
  };
}
