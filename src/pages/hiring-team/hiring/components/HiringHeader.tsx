import { Building, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/composed/PageHeader';

interface HiringHeaderProps {
  onRefresh: () => void;
}

export function HiringHeader({ onRefresh }: HiringHeaderProps) {
  return (
    <PageHeader
      title="Hiring & Onboarding Management"
      subtitle="Review employee profile submissions, track onboarding progress, and assign official Employee IDs."
      actions={
        <div className="flex items-center gap-3">
          <Link
            to="/hiring-team/form-builder"
            className="px-4 py-2 rounded-xl bg-surface-subtle border border-border-subtle text-foreground hover:bg-white text-xs font-bold transition-all flex items-center gap-1.5">
            <Building size={14} className="text-primary" />
            Configure Form Fields
          </Link>
          <button
            type="button"
            onClick={onRefresh}
            className="p-2.5 rounded-xl border border-border-subtle bg-white hover:bg-surface-subtle text-muted hover:text-foreground transition-all"
            title="Refresh profiles">
            <RefreshCw size={15} />
          </button>
        </div>
      }
    />
  );
}
