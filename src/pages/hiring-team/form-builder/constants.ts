import {
  Award,
  Briefcase,
  Camera,
  CreditCard,
  GraduationCap,
  Shield,
  User,
  type LucideIcon,
} from 'lucide-react';
import type { FieldType } from '@/services/employeeProfileService';
import type { FieldDraft } from './types';

export const SECTION_ICONS: Record<string, LucideIcon> = {
  personal: User,
  bank: CreditCard,
  identity: Shield,
  employment: Briefcase,
  education: GraduationCap,
  certifications: Award,
  profile_picture: Camera,
};

export const TEAM_OPTIONS = [
  { value: 'Employee', label: 'Team: Employee' },
  { value: 'HiringTeam', label: 'Team: Hiring Team' },
  { value: 'Finance', label: 'Team: Finance' },
  { value: 'DeptHead', label: 'Team: Dept Head' },
];

export const FIELD_TYPE_OPTIONS: Array<{ value: FieldType; label: string }> = [
  { value: 'text', label: 'Text Input' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'date', label: 'Date' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'file', label: 'File Upload' },
  { value: 'select', label: 'Dropdown Select' },
];

export const EMPTY_FIELD_DRAFT: FieldDraft = {
  label: '',
  key: '',
  type: 'text',
  required: false,
  placeholder: '',
  description: '',
};
