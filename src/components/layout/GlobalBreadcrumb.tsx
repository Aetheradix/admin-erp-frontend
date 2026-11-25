import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Check, ChevronRight, Copy, Home, Link2 } from 'lucide-react';
import { navItems } from '@/config/navItems';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { cn } from '@/utils/cn';

interface BreadcrumbItem {
  label: string;
  to: string;
  isCurrent: boolean;
}

const EXACT_ROUTE_LABELS: Record<string, string> = {
  '/': 'Dashboard',
  '/profile': 'My Profile',
  '/profile-completion': 'Complete Profile',
  '/checkin': 'Check-In',
  '/org': 'Organization',
  '/org/approvals': 'User Management',
  '/teams': 'Teams',
  '/users': 'Users',
  '/staff': 'Employee Directory',
  '/staff/approvals': 'Approvals',
  '/staff/history': 'Approval History',
  '/staff/feature-control': 'Feature Control',
  '/staff/elevation-requests': 'Elevation Requests',
  '/departments': 'Departments',
  '/hiring-team': 'Hiring & Onboarding',
  '/hiring-team/form-builder': 'Form Builder',
  '/events': 'Events Planner',
  '/calendar': 'Attendance Calendar',
  '/projects': 'Projects',
  '/projects/monitoring': 'Monitoring & My Work',
  '/tasks': 'Tasks',
  '/resource-booking': 'Resource Booking',
  '/resource-booking/my-bookings': 'My Bookings',
  '/resource-booking/calendar': 'Calendar',
  '/resource-booking/all': 'All Bookings',
  '/benefits-perks': 'Benefits & Perks',
  '/benefits-perks/my-perks': 'My Perks',
  '/benefits-perks/recreation-benefits': 'Recreation Benefits',
  '/benefits-perks/perk-types': 'Perk Types',
  '/benefits-perks/opt-in-benefits': 'Benefits Opt In',
  '/finance': 'Finance',
  '/finance/invoices': 'Invoices',
  '/finance/expenses': 'Expenses',
  '/finance/payroll': 'Payroll',
  '/finance/my-payslip': 'My PaySlip',
  '/finance/audit': 'Audit Book',
  '/finance/reimbursements': 'Reimbursements',
  '/inventory': 'Inventory',
  '/inventory/stock-levels': 'Stock Levels',
  '/inventory/movements': 'Movements',
  '/social': 'Social',
  '/social/blogs': 'Blogs',
  '/social/blogs/create': 'Create Story',
  '/blogs': 'Blogs',
  '/blogs/create': 'Create Story',
  '/social/gallery': 'Gallery',
  '/grievances': 'Grievances',
  '/guest-pass': 'Guest Pass',
  '/careers': 'Careers',
  '/rulebook': 'Rulebook',
  '/channels': 'Channels',
  '/analytics': 'Analytics',
  '/analytics/reports': 'Reports',
  '/settings': 'Settings',
  '/settings/roles': 'Roles & Permissions',
  '/settings/assignment-permissions': 'Assignment Rules',
  '/settings/integrations': 'Integrations',
  '/settings/audit-log': 'Audit Log',
  '/403': 'Access Denied',
};

const NAV_ROUTE_LABELS: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const item of navItems) {
    map[item.path] = item.label;
    if (item.children) {
      for (const child of item.children) {
        if (!map[child.path]) {
          map[child.path] = child.label;
        }
      }
    }
  }
  return map;
})();

function formatSegment(segment: string): string {
  const decoded = decodeURIComponent(segment);
  if (/^\d+$/.test(decoded)) {
    return `#${decoded}`;
  }
  return decoded.replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function resolveLabel(path: string, segment: string): string {
  return EXACT_ROUTE_LABELS[path] || NAV_ROUTE_LABELS[path] || formatSegment(segment);
}

function buildBreadcrumbs(pathname: string, search: string): BreadcrumbItem[] {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';

  if (cleanPath === '/') {
    return [{ label: 'Dashboard', to: `/${search}`, isCurrent: true }];
  }

  const segments = cleanPath.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [{ label: 'Home', to: '/', isCurrent: false }];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const prevSeg = i > 0 ? segments[i - 1] : '';
    const nextSeg = i + 1 < segments.length ? segments[i + 1] : '';
    const pathUpToHere = `/${segments.slice(0, i + 1).join('/')}`;

    // Collapse non-routable intermediate blog ID/edit segments (e.g. /social/blogs/:id/edit or /blogs/edit/:id)
    if (
      (prevSeg === 'blogs' && nextSeg === 'edit') ||
      (seg === 'edit' && prevSeg === 'blogs' && nextSeg)
    ) {
      continue;
    }

    let label = resolveLabel(pathUpToHere, seg);

    if (seg === 'edit' && (prevSeg === 'blogs' || segments[i - 2] === 'blogs')) {
      const idSeg = prevSeg === 'blogs' ? '' : ` #${decodeURIComponent(prevSeg)}`;
      label = `Edit Story${idSeg}`;
    } else if (prevSeg === 'blogs' && segments[i - 2] === 'edit') {
      label = `Edit Story #${decodeURIComponent(seg)}`;
    } else if (prevSeg === 'projects' && seg !== 'monitoring') {
      label = `Project #${decodeURIComponent(seg)}`;
    } else if (prevSeg === 'teams') {
      label = `Team #${decodeURIComponent(seg)}`;
    } else if (prevSeg === 'departments') {
      label = formatSegment(seg);
    }

    const isLast = i === segments.length - 1;
    items.push({
      label,
      to: isLast && search ? `${pathUpToHere}${search}` : pathUpToHere,
      isCurrent: isLast,
    });
  }

  return items;
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function GlobalBreadcrumb() {
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  const crumbs = useMemo(
    () => buildBreadcrumbs(location.pathname, location.search),
    [location.pathname, location.search]
  );

  const currentUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${location.pathname}${location.search}${location.hash}`
      : `${location.pathname}${location.search}`;

  const handleCopyCurrentUrl = async () => {
    const ok = await copyTextToClipboard(currentUrl);
    if (ok) {
      setCopied(true);
      showToast({
        severity: 'success',
        summary: 'Link Copied',
        detail: 'Page link copied to clipboard.',
        life: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } else {
      showToast({
        severity: 'error',
        summary: 'Copy Failed',
        detail: 'Unable to copy link automatically. You can copy from the link bar.',
        life: 3000,
      });
    }
  };

  return (
    <div className="w-full px-3 sm:px-6 lg:px-10 py-2 bg-surface-subtle/80 backdrop-blur-md border-b border-border-subtle flex items-center justify-between gap-3 shrink-0 z-10">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1 sm:gap-1.5 min-w-0 overflow-x-auto no-scrollbar py-0.5">
        {crumbs.map((crumb, index) => {
          const isHome = index === 0;
          return (
            <React.Fragment key={`${crumb.to}-${index}`}>
              {index > 0 && (
                <ChevronRight size={13} className="text-muted/45 shrink-0" aria-hidden="true" />
              )}
              <Link
                to={crumb.to}
                title={`Click to open or right-click to copy link: ${typeof window !== 'undefined' ? window.location.origin : ''}${crumb.to}`}
                aria-current={crumb.isCurrent ? 'page' : undefined}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-all duration-150 whitespace-nowrap shrink-0',
                  crumb.isCurrent
                    ? 'bg-surface-elevated text-foreground font-bold border border-border-subtle shadow-2xs hover:border-primary/40 hover:text-primary'
                    : 'text-muted font-semibold hover:text-primary hover:bg-surface-elevated/70'
                )}>
                {isHome && (
                  <Home
                    size={13}
                    className={cn('shrink-0', crumb.isCurrent ? 'text-primary' : 'text-muted/80')}
                  />
                )}
                <span>{crumb.label}</span>
              </Link>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Copyable Link Pill & Action */}
      <div className="flex items-center gap-2 shrink-0">
        <div
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-elevated/80 border border-border-subtle text-[11px] font-mono text-muted max-w-[280px] xl:max-w-[360px]"
          title={currentUrl}>
          <Link2 size={12} className="text-primary/75 shrink-0" />
          <span className="truncate select-all">
            {`${location.pathname}${location.search}` || '/'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopyCurrentUrl}
          aria-label="Copy current page link"
          title="Copy full page URL"
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all duration-150 cursor-pointer shrink-0 active:scale-95',
            copied
              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
              : 'bg-surface-elevated text-muted border-border-subtle hover:text-primary hover:border-primary/40 shadow-2xs'
          )}>
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy Link'}</span>
        </button>
      </div>
    </div>
  );
}
