import {
  AlertCircle,
  Award,
  Briefcase,
  Camera,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  GraduationCap,
  ListChecks,
  Send,
  ShieldCheck,
  User,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ProfileStatus } from '@/services/employeeProfileService';
import type { ReviewTab } from './types';

export const AVAILABLE_ROLES = [
  'Employee',
  'Manager',
  'HrAdmin',
  'FinanceAdmin',
  'Admin',
  'Inventory operator',
  'SuperAdmin',
];

export const AVAILABLE_DEPTS = [
  'Engineering',
  'Design',
  'Marketing',
  'Operations',
  'Sales',
  'HR',
  'Finance',
  'Product',
  'Customer Support',
  'Management',
];

export const STATUS_MAP: Record<
  ProfileStatus,
  { label: string; color: string; bg: string; icon: LucideIcon }
> = {
  incomplete: {
    label: 'Incomplete',
    color: 'text-error',
    bg: 'bg-error/10 border-error/20 text-error',
    icon: AlertCircle,
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-warning',
    bg: 'bg-warning/10 border-warning/20 text-warning',
    icon: Clock,
  },
  submitted: {
    label: 'Pending Review',
    color: 'text-info',
    bg: 'bg-info/10 border-info/20 text-info',
    icon: Send,
  },
  changes_required: {
    label: 'Changes Required',
    color: 'text-warning',
    bg: 'bg-warning/10 border-warning/20 text-warning',
    icon: AlertCircle,
  },
  approved: {
    label: 'Approved',
    color: 'text-success',
    bg: 'bg-success/10 border-success/20 text-success',
    icon: CheckCircle2,
  },
  id_assigned: {
    label: 'ID Assigned',
    color: 'text-success',
    bg: 'bg-success/10 border-success/20 text-success',
    icon: ShieldCheck,
  },
};

export const SECTION_ICON_MAP: Record<string, LucideIcon> = {
  personal: User,
  bank: CreditCard,
  identity: FileText,
  employment: Briefcase,
  education: GraduationCap,
  certifications: Award,
  profile_picture: Camera,
};

export const HIRING_TABS = [
  'All',
  'Pending Review',
  'Changes Required',
  'Approved',
  'ID Assigned',
  'Incomplete',
];

export const ONBOARDING_TABS: Array<{
  id: Exclude<ReviewTab, 'overview'>;
  label: string;
  icon: LucideIcon;
}> = [
  { id: 'personal', label: 'Personal & Contact', icon: User },
  { id: 'bank', label: 'Bank Details', icon: CreditCard },
  { id: 'identity', label: 'Identity Documents', icon: FileText },
  { id: 'employment', label: 'Employment History', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'certifications', label: 'Certifications', icon: Award },
];

export const OVERVIEW_TAB = { id: 'overview' as const, label: 'Overview', icon: ListChecks };
