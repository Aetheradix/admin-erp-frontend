export type HiringView = 'table' | 'onboarding';

export type ReviewTab =
  'overview' | 'personal' | 'bank' | 'identity' | 'employment' | 'education' | 'certifications';

export interface HiringActor {
  name: string;
  email: string;
  role: string;
}

export interface HiringMetrics {
  total: number;
  pending: number;
  changes: number;
  approved: number;
  assigned: number;
  onboarding: number;
}

export interface QuickSummaryItem {
  label: string;
  value: string | number | undefined;
}
