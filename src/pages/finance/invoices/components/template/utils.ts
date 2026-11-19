import { formatCurrency } from '@/shared/utils/formatCurrency';

export const formatInvoiceCurrency = (value: number): string =>
  formatCurrency(value, {
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function formatInvoiceDate(date: string): string {
  if (!date) return '';
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
