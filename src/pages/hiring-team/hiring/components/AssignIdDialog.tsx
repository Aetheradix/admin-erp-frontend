import { CheckCircle2, KeyRound, User } from 'lucide-react';
import { Dialog } from '@/components/ui/composed/Dialog';
import type { ProfileCompletionData } from '@/services/employeeProfileService';
import { AVAILABLE_DEPTS, AVAILABLE_ROLES, STATUS_MAP } from '../constants';

interface AssignIdDialogProps {
  visible: boolean;
  profile: ProfileCompletionData | null;
  userRole: string;
  empIdInput: string;
  onEmpIdChange: (value: string) => void;
  roleInput: string;
  onRoleChange: (value: string) => void;
  departmentInput: string;
  onDepartmentChange: (value: string) => void;
  designationInput: string;
  onDesignationChange: (value: string) => void;
  assignError: string;
  isAssigning: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AssignIdDialog({
  visible,
  profile,
  userRole,
  empIdInput,
  onEmpIdChange,
  roleInput,
  onRoleChange,
  departmentInput,
  onDepartmentChange,
  designationInput,
  onDesignationChange,
  assignError,
  isAssigning,
  onClose,
  onConfirm,
}: AssignIdDialogProps) {
  const statusConf = profile ? (STATUS_MAP[profile.status] ?? STATUS_MAP.incomplete) : null;

  return (
    <Dialog
      visible={visible}
      onHide={onClose}
      width={560}
      header={
        <div className="flex items-center gap-2">
          <KeyRound size={18} className="text-primary" />
          <h3 className="text-base font-black text-foreground">
            {profile?.employeeId ? 'Manage Official Profile & Role' : 'Assign Official ID & Role'}
          </h3>
        </div>
      }>
      <div className="space-y-4 pt-2">
        {/* Target employee summary card */}
        {profile && (
          <div className="p-3.5 rounded-2xl bg-surface-subtle border border-border-subtle flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center shrink-0 border border-primary/20">
              {profile.profilePictureUrl ? (
                <img
                  src={profile.profilePictureUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={18} className="text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-foreground truncate">
                {profile.personal?.fullName || 'Unnamed Employee'}
              </div>
              <div className="text-xs text-muted truncate">{profile.userEmail}</div>
            </div>
            <span
              className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusConf?.bg || 'bg-surface-subtle'}`}>
              {statusConf?.label || profile.status}
            </span>
          </div>
        )}

        <div className="p-3 rounded-2xl bg-primary/5 border border-primary/20 flex items-center gap-3">
          <div className="text-xs text-primary leading-relaxed">
            <strong>Role Verified:</strong> You are authorized ({userRole}) to assign or update
            official employee identifiers, system roles, and department affiliations.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">
              Official Employee ID *
            </label>
            <input
              type="text"
              value={empIdInput}
              onChange={(e) => onEmpIdChange(e.target.value)}
              placeholder="e.g. EMP-0042 or ARX-01"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">
              System Role *
            </label>
            <select
              value={roleInput}
              onChange={(e) => onRoleChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle text-xs font-semibold text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
              {AVAILABLE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">
              Department
            </label>
            <select
              value={departmentInput}
              onChange={(e) => onDepartmentChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle text-xs font-semibold text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
              <option value="">-- Select Department --</option>
              {AVAILABLE_DEPTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">
              Designation / Job Title
            </label>
            <input
              type="text"
              value={designationInput}
              onChange={(e) => onDesignationChange(e.target.value)}
              placeholder="e.g. Frontend Developer"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {assignError && <p className="text-xs text-error font-medium">{assignError}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border-subtle bg-white text-foreground text-xs font-bold hover:bg-surface-subtle transition-all">
            Cancel
          </button>
          <button
            type="button"
            disabled={isAssigning}
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            <CheckCircle2 size={13} />
            {isAssigning ? 'Saving Profile...' : 'Confirm & Save Details'}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
