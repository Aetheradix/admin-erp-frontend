import { AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import type { ProfileCompletionData } from '@/services/employeeProfileService';

interface ReviewActionBarProps {
  profile: ProfileCompletionData;
  canAssignId: boolean;
  onRequestRevisions: () => void;
  onApprove: () => void;
  onOpenAssignId: () => void;
}

export function ReviewActionBar({
  profile,
  canAssignId,
  onRequestRevisions,
  onApprove,
  onOpenAssignId,
}: ReviewActionBarProps) {
  const isApproved = profile.status === 'approved' || profile.status === 'id_assigned';

  return (
    <div className="border-t border-border-subtle pt-4 flex items-center justify-between">
      <div>
        {profile.employeeId && (
          <span className="text-xs font-bold text-primary">Assigned ID: {profile.employeeId}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRequestRevisions}
          className="px-4 py-2 rounded-xl border border-warning/30 bg-warning/5 text-warning hover:bg-warning/10 text-xs font-bold transition-all flex items-center gap-1.5">
          <AlertCircle size={14} />
          Request Revisions
        </button>
        {!isApproved ? (
          <button
            type="button"
            onClick={onApprove}
            className="px-4 py-2 rounded-xl bg-success text-white hover:bg-success/90 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs">
            <CheckCircle2 size={14} />
            Approve Profile
          </button>
        ) : (
          <span className="px-3 py-2 rounded-xl bg-success/10 text-success border border-success/20 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 size={14} />
            Approved
          </span>
        )}
        {canAssignId && (
          <button
            type="button"
            onClick={onOpenAssignId}
            className="px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs">
            <KeyRound size={14} />
            {profile.employeeId ? 'Edit ID & Role' : 'Assign ID & Role'}
          </button>
        )}
      </div>
    </div>
  );
}
