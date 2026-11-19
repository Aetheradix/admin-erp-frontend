import { useCallback } from 'react';
import { message } from 'antd';
import { getInvoiceFormData } from '../form';
import { getInvoiceApiId, getInvoiceDisplayNumber } from '../payloads';
import type { AuditLogExtra, BackendInvoiceRecord, Invoice } from '../types';
import { useInvoicePdf } from './useInvoicePdf';

interface UseInvoiceDownloadOptions {
  recordAuditLog: (action: string, description: string, extra?: AuditLogExtra) => void;
}

export function useInvoiceDownload({ recordAuditLog }: UseInvoiceDownloadOptions) {
  const { invoicePdfRef, pdfInvoice, downloadInvoicePDF } = useInvoicePdf();

  const downloadInvoice = useCallback(
    async (invoice: Invoice) => {
      try {
        message.loading({
          content: 'Fetching invoice from database and generating PDF...',
          key: 'invoice-download',
        });

        let invoiceToDownload: Invoice | BackendInvoiceRecord = invoice;

        try {
          const token = localStorage.getItem('token') || '';
          const response = await fetch(`/api/finance/invoices/${getInvoiceApiId(invoice)}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (response.ok) {
            const json = await response.json();
            if (json?.data && typeof json.data === 'object') {
              invoiceToDownload = json.data as BackendInvoiceRecord;
            }
          }
        } catch (fetchError) {
          console.info('Using loaded invoice state for generation:', fetchError);
        }

        const formData = getInvoiceFormData(invoiceToDownload);
        const downloadFileName = `${getInvoiceDisplayNumber(invoiceToDownload) || invoice.id}.pdf`;
        await downloadInvoicePDF(formData, downloadFileName);

        recordAuditLog(
          'DOWNLOAD_INVOICE',
          `Generated & downloaded invoice PDF for ${getInvoiceDisplayNumber(invoiceToDownload) || invoice.id}`,
          {
            invoiceId: invoiceToDownload.id !== undefined ? String(invoiceToDownload.id) : invoice.id,
            client: invoiceToDownload.client,
            amount: Number(invoiceToDownload.amount || 0),
          }
        );

        message.success({
          content: `Invoice ${getInvoiceDisplayNumber(invoiceToDownload) || invoice.id} downloaded successfully.`,
          key: 'invoice-download',
        });
      } catch (error) {
        console.error('Invoice download failed:', error);
        message.error({
          content: error instanceof Error ? error.message : 'Unable to download invoice.',
          key: 'invoice-download',
        });
      }
    },
    [downloadInvoicePDF, recordAuditLog]
  );

  return { invoicePdfRef, pdfInvoice, downloadInvoice };
}
