import { BADGE_PALETTES } from '../constants';

export function getRoleBadgeClass(role?: string): string {
  if (!role) return 'bg-surface-subtle text-muted border-border-subtle';
  const clean = role.toLowerCase().replace(/[\s_-]/g, '');
  if (clean.includes('superadmin') || clean.includes('founder') || clean.includes('ceo')) {
    return 'bg-error/10 text-error border-error/20';
  }
  if (clean.includes('admin') && !clean.includes('hr') && !clean.includes('finance')) {
    return 'bg-warning/10 text-warning border-warning/20';
  }
  if (clean.includes('hr')) {
    return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
  }
  if (clean.includes('finance')) {
    return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
  }
  if (clean.includes('manager') || clean.includes('lead')) {
    return 'bg-primary/10 text-primary border-primary/20';
  }
  if (clean.includes('developer') || clean.includes('engineer') || clean.includes('devops')) {
    return 'bg-sky-500/10 text-sky-600 border-sky-500/20';
  }
  if (
    clean.includes('analyst') ||
    clean.includes('design') ||
    clean.includes('ui') ||
    clean.includes('ux')
  ) {
    return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
  }
  if (clean.includes('employee') || clean.includes('staff')) {
    return 'bg-info/10 text-info border-info/20';
  }
  if (clean.includes('inventory') || clean.includes('operator')) {
    return 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20';
  }

  let hash = 0;
  for (let i = 0; i < role.length; i++) {
    hash = role.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palette = BADGE_PALETTES[Math.abs(hash) % BADGE_PALETTES.length];
  return `${palette.bg} ${palette.text} border ${palette.border}`;
}

export function getDepartmentBadgeClass(dept?: string): string {
  if (!dept) return 'bg-surface-subtle text-muted border-border-subtle';
  let hash = 0;
  for (let i = 0; i < dept.length; i++) {
    hash = dept.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palette = BADGE_PALETTES[Math.abs(hash) % BADGE_PALETTES.length];
  return `${palette.bg} ${palette.text} border ${palette.border}`;
}
