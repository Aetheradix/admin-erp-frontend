import { Check, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { PASSWORD_MIN_LENGTH, type PasswordChecks } from '../hooks/usePasswordStrength';

export type PasswordStrengthProps =
  | {
      variant: 'bar';
      score: number;
      className?: string;
      labelClassName?: string;
    }
  | {
      variant: 'checklist';
      checks: PasswordChecks;
      className?: string;
      itemClassName?: string;
    };

const SCORE_LABELS = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'] as const;
const SCORE_CLASSES = [
  'bg-error',
  'bg-error',
  'bg-warning',
  'bg-warning',
  'bg-info',
  'bg-success',
] as const;

export function PasswordStrength(props: PasswordStrengthProps) {
  if (props.variant === 'bar') {
    const { score, className, labelClassName } = props;
    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        <div className="flex gap-1.5">
          {Array.from({ length: 5 }, (_, index) => (
            <span
              key={index}
              className={cn(
                'h-1.5 flex-1 rounded-full bg-surface-subtle transition-colors',
                index < score && SCORE_CLASSES[score]
              )}
            />
          ))}
        </div>
        <span className={cn('text-[11px] font-bold text-muted', labelClassName)}>
          {SCORE_LABELS[score]}
        </span>
      </div>
    );
  }

  const { checks, className, itemClassName } = props;
  const items = [
    { label: `At least ${PASSWORD_MIN_LENGTH} characters`, passed: checks.minLength },
    { label: 'One uppercase letter', passed: checks.hasUpper },
    { label: 'One lowercase letter', passed: checks.hasLower },
    { label: 'One number', passed: checks.hasNumber },
    { label: 'One special character', passed: checks.hasSpecial },
    { label: 'Passwords match', passed: checks.matches },
  ];

  return (
    <ul className={cn('flex flex-col gap-1.5', className)}>
      {items.map((item) => (
        <li
          key={item.label}
          className={cn(
            'flex items-center gap-2 text-[11px] font-bold',
            item.passed ? 'text-success' : 'text-muted',
            itemClassName
          )}>
          {item.passed ? <Check size={12} /> : <X size={12} />}
          {item.label}
        </li>
      ))}
    </ul>
  );
}
