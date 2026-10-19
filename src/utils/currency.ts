export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
}

export const WORLD_CURRENCIES: CurrencyOption[] = [
  { code: 'USD', symbol: '$', name: 'USD ($) - US Dollar' },
  { code: 'EUR', symbol: '€', name: 'EUR (€) - Euro' },
  { code: 'GBP', symbol: '£', name: 'GBP (£) - British Pound' },
  { code: 'INR', symbol: '₹', name: 'INR (₹) - Indian Rupee' },
  { code: 'AED', symbol: 'AED', name: 'AED - UAE Dirham' },
  { code: 'SAR', symbol: 'SAR', name: 'SAR - Saudi Riyal' },
  { code: 'CAD', symbol: 'CA$', name: 'CAD (CA$) - Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'AUD (A$) - Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'JPY (¥) - Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'CNY (¥) - Chinese Yuan' },
  { code: 'CHF', symbol: 'CHF', name: 'CHF - Swiss Franc' },
  { code: 'SGD', symbol: 'S$', name: 'SGD (S$) - Singapore Dollar' },
  { code: 'NZD', symbol: 'NZ$', name: 'NZD (NZ$) - New Zealand Dollar' },
  { code: 'HKD', symbol: 'HK$', name: 'HKD (HK$) - Hong Kong Dollar' },
  { code: 'SEK', symbol: 'kr', name: 'SEK (kr) - Swedish Krona' },
  { code: 'KRW', symbol: '₩', name: 'KRW (₩) - South Korean Won' },
  { code: 'BRL', symbol: 'R$', name: 'BRL (R$) - Brazilian Real' },
  { code: 'MXN', symbol: 'MX$', name: 'MXN (MX$) - Mexican Peso' },
  { code: 'ZAR', symbol: 'R', name: 'ZAR (R) - South African Rand' },
  { code: 'TRY', symbol: '₺', name: 'TRY (₺) - Turkish Lira' },
  { code: 'RUB', symbol: '₽', name: 'RUB (₽) - Russian Ruble' },
  { code: 'PKR', symbol: '₨', name: 'PKR (₨) - Pakistani Rupee' },
  { code: 'BDT', symbol: '৳', name: 'BDT (৳) - Bangladeshi Taka' },
  { code: 'IDR', symbol: 'Rp', name: 'IDR (Rp) - Indonesian Rupiah' },
  { code: 'MYR', symbol: 'RM', name: 'MYR (RM) - Malaysian Ringgit' },
  { code: 'THB', symbol: '฿', name: 'THB (฿) - Thai Baht' },
  { code: 'PHP', symbol: '₱', name: 'PHP (₱) - Philippine Peso' },
  { code: 'VND', symbol: '₫', name: 'VND (₫) - Vietnamese Dong' },
  { code: 'NGN', symbol: '₦', name: 'NGN (₦) - Nigerian Naira' },
  { code: 'EGP', symbol: 'E£', name: 'EGP (E£) - Egyptian Pound' },
  { code: 'QAR', symbol: 'QAR', name: 'QAR - Qatari Riyal' },
  { code: 'KWD', symbol: 'KWD', name: 'KWD - Kuwaiti Dinar' },
  { code: 'BHD', symbol: 'BHD', name: 'BHD - Bahraini Dinar' },
  { code: 'OMR', symbol: 'OMR', name: 'OMR - Omani Rial' },
];

export const getCurrencySymbol = (code?: string | null): string => {
  if (!code) return '$';
  const found = WORLD_CURRENCIES.find((c) => c.code.toUpperCase() === code.toUpperCase());
  return found?.symbol || code;
};

export const formatPriceWithCurrency = (
  amount: number | string | undefined | null,
  currency?: string | null
): string => {
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount || 0)) || 0;
  const sym = getCurrencySymbol(currency);
  return `${sym}${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};
