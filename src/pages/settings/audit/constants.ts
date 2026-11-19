import { FileText, KeyRound, Shield, Terminal, User, UserPlus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const STATUS_COLORS: Record<string, string> = {
  Success: 'text-success bg-success/10 border-success/20',
  Warning: 'text-warning bg-warning/10 border-warning/20',
  Critical: 'text-error bg-error/10 border-error/20',
  Info: 'text-info bg-info/10 border-info/20',
};

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  invitation: UserPlus,
  profile: FileText,
  security: KeyRound,
  user_management: User,
  admin: Shield,
};

export const STEP_STATUS_STYLE: Record<string, string> = {
  done: 'bg-success text-white',
  pending: 'bg-border-subtle/60 text-muted',
  failed: 'bg-error text-white',
};

export const INVITATION_STATUS_BADGE: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border border-warning/20',
  accepted: 'bg-success/10 text-success border border-success/20',
  expired: 'bg-muted/10 text-muted border border-border-subtle',
  revoked: 'bg-error/10 text-error border border-error/20',
};

export const STATUS_FILTERS = ['all', 'Success', 'Warning', 'Critical'] as const;

export const CATEGORY_FILTERS: Array<{ id: string; label: string; icon: LucideIcon }> = [
  { id: 'all', label: 'All Activities', icon: Terminal },
  { id: 'invitation', label: 'User Invitations', icon: UserPlus },
  { id: 'profile', label: 'Profile Changes', icon: FileText },
  { id: 'security', label: 'Security & Password', icon: KeyRound },
  { id: 'admin', label: 'Administration', icon: Shield },
];

export const FALLBACK_ADMIN_NAME = 'Administrator';
export const FALLBACK_ADMIN_ROLE = 'SuperAdmin';
export const FALLBACK_ADMIN_EMAIL = 'admin@aetheradix.com';
