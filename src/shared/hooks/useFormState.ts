import { useCallback, useMemo, useState } from 'react';
import type { FieldErrors, ValidationRule } from '../types/forms';
import { validateFields } from '../utils/validateFields';

export function useFormState<T extends object>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [initialSnapshot, setInitialSnapshot] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FieldErrors<T>>({});

  const setField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }, []);

  const reset = useCallback(
    (nextValues?: T) => {
      const target = nextValues ?? initialSnapshot;
      setValues(target);
      setInitialSnapshot(target);
      setErrors({});
    },
    [initialSnapshot]
  );

  const validate = useCallback(
    (rules: readonly ValidationRule<T>[]): boolean => {
      const nextErrors = validateFields(values, rules);
      setErrors(nextErrors);
      return Object.keys(nextErrors).length === 0;
    },
    [values]
  );

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initialSnapshot),
    [values, initialSnapshot]
  );

  return {
    values,
    setValues,
    setField,
    errors,
    setErrors,
    validate,
    reset,
    isDirty,
  };
}
