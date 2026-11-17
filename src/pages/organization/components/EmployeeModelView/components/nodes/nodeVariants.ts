import React from 'react';
import { Crown, ArrowUp, ArrowDown } from 'lucide-react';
import type { OrgNodeVariant } from '../../types';

export interface NodeVariantConfig {
  badgeLabel: string;
  badgeClass: string;
  badgeIcon: React.ReactNode | null;
  borderClass: string;
  avatarSize: 'xl' | 'lg' | 'md' | 'sm';
  focusText: string;
  subTitleClass?: string;
}

export const NODE_VARIANTS: Record<OrgNodeVariant, NodeVariantConfig> = {
  grand: {
    badgeLabel: 'Executive / Apex',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    badgeIcon: React.createElement(Crown, { size: 11, className: 'text-amber-500' }),
    borderClass: 'border-slate-200/90 hover:border-slate-300',
    avatarSize: 'md',
    focusText: 'Focus Tree',
  },
  manager: {
    badgeLabel: 'Reporting Manager',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    badgeIcon: React.createElement(ArrowUp, { size: 11, className: 'text-indigo-600' }),
    borderClass: 'border-indigo-200 hover:border-indigo-400',
    avatarSize: 'md',
    focusText: 'Focus Tree',
    subTitleClass: 'group-hover:text-indigo-600',
  },
  report: {
    badgeLabel: 'Direct Report',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    badgeIcon: React.createElement(ArrowDown, { size: 11, className: 'text-slate-500' }),
    borderClass: 'border-slate-200/90 hover:border-[#0078d4]/50',
    avatarSize: 'md',
    focusText: 'Focus',
    subTitleClass: 'group-hover:text-[#0078d4]',
  },
  sub: {
    badgeLabel: 'Sub-Tree Level 2',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    badgeIcon: null,
    borderClass: 'border-slate-200/80 hover:border-[#0078d4]/40',
    avatarSize: 'sm',
    focusText: 'Focus',
    subTitleClass: 'group-hover:text-[#0078d4]',
  },
};
