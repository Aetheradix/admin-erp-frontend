import {
  DATE_FORMAT_OPTIONS,
  DATE_LOCALE,
  MONTH_NAMES,
  MONTH_NAMES_UPPER,
} from '../constants/dateFormats';
import { FALLBACK } from '../constants/fallbacks';

export type DateInput = string | number | Date | null | undefined;

const pad2 = (value: number): string => String(value).padStart(2, '0');

export function parseDate(input: DateInput): Date | null {
  if (input === null || input === undefined || input === '') return null;
  if (input instanceof Date) return Number.isNaN(input.getTime()) ? null : input;
  if (typeof input === 'number') {
    const date = new Date(input);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const value = input.trim();
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    const date = new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export interface FormatDateOptions {
  month?: 'short' | 'long' | 'numeric';
  day?: 'numeric' | '2-digit';
  year?: 'numeric' | '2-digit';
  weekday?: 'short' | 'long';
  uppercase?: boolean;
  fallback?: string;
}

export function formatDate(input: DateInput, options: FormatDateOptions = {}): string {
  const date = parseDate(input);
  if (!date) return options.fallback ?? FALLBACK.EMPTY;

  const formatted = date.toLocaleDateString(DATE_LOCALE, {
    ...(options.weekday ? { weekday: options.weekday } : {}),
    month: options.month ?? 'short',
    day: options.day ?? 'numeric',
    year: options.year ?? 'numeric',
  });

  return options.uppercase ? formatted.toUpperCase() : formatted;
}

export const formatDateShort = (input: DateInput, fallback?: string): string =>
  formatDate(input, { fallback });

export const formatDateLong = (input: DateInput, fallback?: string): string =>
  formatDate(input, { month: 'long', fallback });

export const formatDateCompact = (input: DateInput, fallback?: string): string =>
  formatDate(input, { month: 'short', day: '2-digit', fallback });

export type DateFormatPreset = 'short' | 'long' | 'compact' | 'iso' | 'dayMonth';

export function formatDatePreset(
  input: DateInput,
  preset: DateFormatPreset = 'short',
  fallback?: string
): string {
  if (preset === 'iso') {
    const date = parseDate(input);
    return date ? toDateInputValue(date) : fallback ?? FALLBACK.EMPTY;
  }

  if (preset === 'dayMonth') {
    return formatDate(input, { month: 'short', day: 'numeric', fallback });
  }

  return formatDate(input, { ...DATE_FORMAT_OPTIONS[preset], fallback });
}

export interface FormatTimeOptions {
  hour12?: boolean;
  withSeconds?: boolean;
  fallback?: string;
}

export function formatTime(input: DateInput, options: FormatTimeOptions = {}): string {
  const date = parseDate(input);
  if (!date) return options.fallback ?? FALLBACK.EMPTY;

  return date.toLocaleTimeString(DATE_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    ...(options.withSeconds ? { second: '2-digit' as const } : {}),
    hour12: options.hour12 ?? true,
  });
}

export interface FormatDateTimeOptions {
  date?: FormatDateOptions;
  time?: FormatTimeOptions;
  separator?: string;
  fallback?: string;
}

export function formatDateTime(input: DateInput, options: FormatDateTimeOptions = {}): string {
  const date = parseDate(input);
  if (!date) return options.fallback ?? FALLBACK.EMPTY;

  const datePart = formatDate(date, { fallback: options.fallback, ...options.date });
  const timePart = formatTime(date, { fallback: options.fallback, ...options.time });
  return `${datePart}${options.separator ?? ', '}${timePart}`;
}

export function toDateInputValue(input: DateInput): string {
  const date = parseDate(input);
  if (!date) return '';
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function getMonthName(monthIndex: number, uppercase = false): string {
  const names = uppercase ? MONTH_NAMES_UPPER : MONTH_NAMES;
  return names[monthIndex] ?? '';
}

export function getMonthNames(uppercase = false): readonly string[] {
  return uppercase ? MONTH_NAMES_UPPER : MONTH_NAMES;
}

export function getWeekdayLabels(): readonly string[] {
  return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
}
