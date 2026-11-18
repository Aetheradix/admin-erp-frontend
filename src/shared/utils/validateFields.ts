import type { FieldErrors, ValidationRule } from '../types/forms';

function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

export function validateFields<T extends object>(
  values: T,
  rules: readonly ValidationRule<T>[]
): FieldErrors<T> {
  const errors: FieldErrors<T> = {};

  for (const rule of rules) {
    if (errors[rule.field]) continue;

    const value = values[rule.field];
    const fieldLabel = String(rule.field);

    if (rule.required && isEmptyValue(value)) {
      errors[rule.field] = rule.message ?? `${fieldLabel} is required.`;
      continue;
    }

    if (isEmptyValue(value)) continue;

    if (typeof value === 'string') {
      if (rule.minLength !== undefined && value.trim().length < rule.minLength) {
        errors[rule.field] =
          rule.message ?? `${fieldLabel} must be at least ${rule.minLength} characters.`;
        continue;
      }
      if (rule.maxLength !== undefined && value.trim().length > rule.maxLength) {
        errors[rule.field] =
          rule.message ?? `${fieldLabel} must be at most ${rule.maxLength} characters.`;
        continue;
      }
    }

    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      errors[rule.field] = rule.message ?? `${fieldLabel} is invalid.`;
      continue;
    }

    const customError = rule.validate?.(value, values);
    if (customError) errors[rule.field] = customError;
  }

  return errors;
}
