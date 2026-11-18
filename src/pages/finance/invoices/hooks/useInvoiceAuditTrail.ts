import { useCallback, useEffect, useMemo, useState } from 'react';
import { message } from 'antd';
import {
  useClearMonthAuditLogsMutation,
  useCreateInvoiceAuditLogMutation,
  useGetInvoiceAuditLogsQuery,
} from '@/store/api/financeApiSlice';
import { recordAuditLog as recordSystemAuditLog } from '@/services/auditService';
import {
  filterLogsByRetention,
  getThreeMonthsCutoff,
  pruneLocalStorageLogs,
} from '@/utils/auditExport';
import { createLocalAuditLog, filterLogsForMonth, mergeAuditLogs } from '../auditLogs';
import { INVOICE_LOGS_KEY } from '../constants';
import type { AuditLogExtra, InvoiceAuditLog } from '../types';

interface UseInvoiceAuditTrailOptions {
  username: string;
  userEmail: string;
}

function readStoredLogs(): InvoiceAuditLog[] {
  try {
    pruneLocalStorageLogs(INVOICE_LOGS_KEY, 'createdAt');
    const stored = localStorage.getItem(INVOICE_LOGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return filterLogsByRetention(parsed as InvoiceAuditLog[]);
      }
    }
  } catch (error) {
    console.warn('Error reading stored invoice logs:', error);
  }
  return filterLogsByRetention([]);
}

export function useInvoiceAuditTrail({ username, userEmail }: UseInvoiceAuditTrailOptions) {
  const [localAuditLogs, setLocalAuditLogs] = useState<InvoiceAuditLog[]>(readStoredLogs);
  const { data: backendLogsData, isLoading: isLogsLoading, refetch: refetchLogs } =
    useGetInvoiceAuditLogsQuery(undefined, { refetchOnMountOrArgChange: true });

  const [createInvoiceAuditLogApi] = useCreateInvoiceAuditLogMutation();
  const [clearMonthAuditLogsApi, { isLoading: isClearingMonth }] =
    useClearMonthAuditLogsMutation();

  const [showClearMonthModal, setShowClearMonthModal] = useState(false);
  const [selectedClearMonth, setSelectedClearMonth] = useState(() => new Date().getMonth() + 1);
  const [selectedClearYear, setSelectedClearYear] = useState(() => new Date().getFullYear());

  const { formattedLabel: retentionCutoffLabel } = useMemo(() => getThreeMonthsCutoff(), []);

  useEffect(() => {
    try {
      localStorage.setItem(INVOICE_LOGS_KEY, JSON.stringify(filterLogsByRetention(localAuditLogs)));
    } catch (error) {
      console.warn('Error saving invoice logs:', error);
    }
  }, [localAuditLogs]);

  const combinedAuditLogs = useMemo(
    () => mergeAuditLogs(localAuditLogs, backendLogsData),
    [localAuditLogs, backendLogsData]
  );

  const recordAuditLog = useCallback(
    (action: string, description: string, extra?: AuditLogExtra) => {
      const newLog = createLocalAuditLog(action, description, username);
      setLocalAuditLogs((previous) => filterLogsByRetention([newLog, ...previous]));

      createInvoiceAuditLogApi({
        action,
        description,
        invoiceId: extra?.invoiceId,
        client: extra?.client,
        amount: extra?.amount,
        username,
      }).catch(() => {
        // Backend best-effort
      });

      recordSystemAuditLog({
        action,
        category: 'invoice',
        user: username,
        userEmail,
        target: description,
        status: 'Success',
        details: description,
      });
    },
    [username, userEmail, createInvoiceAuditLogApi]
  );

  const handleClearMonth = useCallback(async () => {
    try {
      await clearMonthAuditLogsApi({
        month: selectedClearMonth,
        year: selectedClearYear,
        filterType: 'invoice',
      }).unwrap();

      setLocalAuditLogs((previous) =>
        filterLogsForMonth(previous, selectedClearMonth, selectedClearYear)
      );
      refetchLogs();
      message.success(
        `Cleared invoice audit logs for ${new Date(
          selectedClearYear,
          selectedClearMonth - 1
        ).toLocaleString('default', { month: 'long', year: 'numeric' })}.`
      );
      setShowClearMonthModal(false);
    } catch (error: unknown) {
      const apiError = error as { data?: { message?: string }; message?: string };
      message.error(
        apiError?.data?.message || apiError?.message || 'Failed to clear month audit logs'
      );
    }
  }, [clearMonthAuditLogsApi, selectedClearMonth, selectedClearYear, refetchLogs]);

  return {
    localAuditLogs,
    combinedAuditLogs,
    isLogsLoading,
    refetchLogs,
    recordAuditLog,
    retentionCutoffLabel,
    showClearMonthModal,
    setShowClearMonthModal,
    selectedClearMonth,
    setSelectedClearMonth,
    selectedClearYear,
    setSelectedClearYear,
    isClearingMonth,
    handleClearMonth,
  };
}
