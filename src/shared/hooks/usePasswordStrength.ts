import { useMemo } from 'react';

export const PASSWORD_MIN_LENGTH = 8;

const SPECIAL_CHARACTERS = /[!@#$%^&*(),.?":{}|<>]/;

export interface PasswordChecks {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  matches: boolean;
}

export interface PasswordStrengthResult {
  checks: PasswordChecks;
  score: number;
  isValid: boolean;
}

export function usePasswordStrength(password: string, confirmPassword?: string): PasswordStrengthResult {
  return useMemo(() => {
    const checks: PasswordChecks = {
      minLength: password.length >= PASSWORD_MIN_LENGTH,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: SPECIAL_CHARACTERS.test(password),
      matches:
        confirmPassword === undefined
          ? password.length > 0
          : password.length > 0 && password === confirmPassword,
    };

    const score = [
      checks.minLength,
      checks.hasUpper,
      checks.hasLower,
      checks.hasNumber,
      checks.hasSpecial,
    ].filter(Boolean).length;

    return { checks, score, isValid: score === 5 && checks.matches };
  }, [password, confirmPassword]);
}
