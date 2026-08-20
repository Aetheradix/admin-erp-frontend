import type { ProfileUserData } from '../hooks/useProfile';

interface OverviewTabProps {
  user: ProfileUserData;
}

export const OverviewTab = ({ user }: OverviewTabProps) => {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Primary Details Card */}
        <div className="bg-surface-subtle/50 p-6 rounded-2xl border border-border-subtle flex flex-col gap-4">
          <h4 className="text-xs font-black text-foreground uppercase tracking-wider">
            Quick Overview
          </h4>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs py-2 border-b border-border-subtle">
              <span className="text-muted font-bold">Display Name</span>
              <span className="font-extrabold text-foreground">{user.name}</span>
            </div>
            <div className="flex items-center justify-between text-xs py-2 border-b border-border-subtle">
              <span className="text-muted font-bold">Employee ID</span>
              <span className="font-extrabold text-foreground">{user.employeeId}</span>
            </div>
            <div className="flex items-center justify-between text-xs py-2 border-b border-border-subtle">
              <span className="text-muted font-bold">Designation</span>
              <span className="font-extrabold text-primary">{user.designation}</span>
            </div>
            <div className="flex items-center justify-between text-xs py-2">
              <span className="text-muted font-bold">Department</span>
              <span className="font-extrabold text-foreground">{user.department}</span>
            </div>
          </div>
        </div>

        {/* Direct Manager Card */}
        <div className="bg-surface-subtle/50 p-6 rounded-2xl border border-border-subtle flex flex-col gap-4">
          <h4 className="text-xs font-black text-foreground uppercase tracking-wider">Manager</h4>
          {user.manager ? (
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-border-subtle">
              {user.manager.image ? (
                <img
                  src={user.manager.image}
                  alt={user.manager.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
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
            <span className="text-xs font-semibold text-muted">No manager assigned</span>
          )}
        </div>
      </div>
    </div>
  );
};
