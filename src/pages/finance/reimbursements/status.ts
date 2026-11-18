import { CheckCircle2, Clock, Receipt, XCircle, type LucideIcon } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  approved: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  paid: 'bg-primary/10 text-primary border-primary/20',
  rejected: 'bg-error/10 text-error border-error/20',
};

export const REIMBURSEMENT_STATUS_ICONS: Record<string, LucideIcon> = {
  approved: CheckCircle2,
  pending: Clock,
  paid: Receipt,
  rejected: XCircle,
};

export function getReimbursementStatusStyles(status: string): string {
  return STATUS_STYLES[status?.toLowerCase()] ?? 'bg-muted/10 text-muted';
}
