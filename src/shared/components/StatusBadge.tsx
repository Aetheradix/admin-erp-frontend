import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/primitives/Badge';
import type { StatusVariant } from '../types/common';
import { resolveStatusVariant } from '../constants/statusVariants';
import { FALLBACK } from '../constants/fallbacks';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger';

const VARIANT_MAP: Record<StatusVariant, BadgeVariant> = {
  primary: 'primary',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
  neutral: 'secondary',
};

export interface StatusBadgeProps {
  status?: string | null;
  label?: ReactNode;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <Badge variant={VARIANT_MAP[resolveStatusVariant(status)]} className={className}>
      {label ?? status ?? FALLBACK.UNKNOWN}
    </Badge>
  );
}
