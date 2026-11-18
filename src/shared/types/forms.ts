export type FieldErrors<T extends object> = Partial<Record<keyof T, string>>;

export interface ValidationRule<T extends object> {
  field: keyof T;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message?: string;
  validate?: (value: T[keyof T], values: T) => string | undefined;
}
