import { getCurrencySymbol } from '@/utils/currency';
import { FALLBACK } from '../constants/fallbacks';

export interface FormatCurrencyOptions {
  currency?: string | null;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  showSymbol?: boolean;
  symbolSpacing?: 'none' | 'space';
  fallback?: string;
}

export function formatCurrency(
  amount: number | string | null | undefined,
  options: FormatCurrencyOptions = {}
): string {
  const parsed =
    typeof amount === 'number' ? amount : Number.parseFloat(String(amount ?? '').replace(/,/g, ''));

  if (!Number.isFinite(parsed)) return options.fallback ?? FALLBACK.EMPTY;

  const currency = options.currency ?? 'INR';
  const locale = options.locale ?? (currency.toUpperCase() === 'INR' ? 'en-IN' : 'en-US');
  const formatted = parsed.toLocaleString(locale, {
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
  });

  if (options.showSymbol === false) return formatted;

  const symbol = getCurrencySymbol(currency);
  return options.symbolSpacing === 'space' ? `${symbol} ${formatted}` : `${symbol}${formatted}`;
}
