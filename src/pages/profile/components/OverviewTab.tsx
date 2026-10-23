import { ShieldCheck, CreditCard, CheckCircle2 } from 'lucide-react';
import type { ProfileUserData } from '../hooks/useProfile';
import type { ProfileCompletionData } from '@/services/employeeProfileService';

interface OverviewTabProps {
  user: ProfileUserData;
  empProfile?: ProfileCompletionData | null;
}

export const OverviewTab = ({ user, empProfile }: OverviewTabProps) => {
  const hasId = user.employeeId && user.employeeId !== 'N/A' && user.employeeId !== 'NA';
  const hasBank = Boolean(empProfile?.bank?.bankName);
  const hasIdentity = Boolean(empProfile?.identity?.panNumber || empProfile?.identity?.aadhaarNumber);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Primary Details Card */}
        <div className="bg-surface-subtle/50 p-6 sm:p-7 rounded-3xl border border-border-subtle flex flex-col gap-4 shadow-xs">
          <h4 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Quick Overview
          </h4>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs py-2 border-b border-border-subtle">
              <span className="text-muted font-bold">Display Name</span>
              <span className="font-extrabold text-foreground">{user.name}</span>
            </div>
            <div className="flex items-center justify-between text-xs py-2 border-b border-border-subtle">
              <span className="text-muted font-bold">Employee ID</span>
              <span className="font-extrabold text-foreground">
                {hasId ? (
                  <span className="inline-flex items-center gap-1 font-mono text-primary bg-primary/10 px-2.5 py-0.5 rounded-md border border-primary/20 text-xs">
                    {user.employeeId}
                  </span>
                ) : (
                  <span className="text-muted italic text-xs">Not Assigned</span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-2 border-b border-border-subtle">
              <span className="text-muted font-bold">Designation</span>
              <span className="font-extrabold text-primary">{user.designation}</span>
            </div>
            <div className="flex items-center justify-between text-xs py-2 border-b border-border-subtle">
              <span className="text-muted font-bold">Department</span>
              <span className="font-extrabold text-foreground">{user.department}</span>
            </div>
            <div className="flex items-center justify-between text-xs py-2">
              <span className="text-muted font-bold">Primary Work Location</span>
              <span className="font-bold text-foreground">{user.workLocation || 'Main Campus'}</span>
            </div>
          </div>
        </div>

        {/* Direct Manager Card */}
        <div className="bg-surface-subtle/50 p-6 sm:p-7 rounded-3xl border border-border-subtle flex flex-col gap-4 shadow-xs">
          <h4 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Manager & Team
          </h4>
          {user.manager ? (
            <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-border-subtle shadow-2xs">
              {user.manager.image ? (
                <img
                  src={user.manager.image}
                  alt={user.manager.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary/20 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                  {user.manager.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xs font-black text-foreground">{user.manager.name}</span>
                <span className="text-[10px] font-semibold text-muted">{user.manager.role}</span>
                <span className="text-[10px] font-extrabold text-primary uppercase mt-0.5">
                  {user.manager.code}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-white/60 border border-border-subtle text-center text-xs text-muted font-medium">
              Direct manager not assigned yet.
            </div>
          )}

          {/* Verification Highlights */}
          <div className="mt-2 pt-4 border-t border-border-subtle grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-white border border-border-subtle">
              <div className="text-[10px] font-bold text-muted uppercase flex items-center gap-1 mb-1">
                <CreditCard size={11} /> Bank Account
              </div>
              <div className="text-xs font-bold text-foreground flex items-center gap-1">
                {hasBank ? (
                  <span className="text-success flex items-center gap-1">
                    <CheckCircle2 size={12} /> {empProfile?.bank?.bankName || 'Linked'}
                  </span>
                ) : (
                  <span className="text-muted italic">Pending</span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-border-subtle">
              <div className="text-[10px] font-bold text-muted uppercase flex items-center gap-1 mb-1">
                <ShieldCheck size={11} /> Identity Proof
              </div>
              <div className="text-xs font-bold text-foreground flex items-center gap-1">
                {hasIdentity ? (
                  <span className="text-success flex items-center gap-1">
                    <CheckCircle2 size={12} /> PAN / Aadhaar OK
                  </span>
                ) : (
                  <span className="text-muted italic">Pending</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
