import { KeyRound, Lock, Shield, Users } from 'lucide-react';

interface RolesStatsProps {
  totalRoles: number;
  systemRoles: number;
  customRoles: number;
  permissionCount: number;
}

export function RolesStats({
  totalRoles,
  systemRoles,
  customRoles,
  permissionCount,
}: RolesStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Total Roles
          </p>
          <h3 className="text-2xl font-black text-foreground mt-1">{totalRoles}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Shield className="w-6 h-6" />
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            System Roles
          </p>
          <h3 className="text-2xl font-black text-foreground mt-1">{systemRoles}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
          <Lock className="w-6 h-6" />
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Custom Roles
          </p>
          <h3 className="text-2xl font-black text-foreground mt-1">{customRoles}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
          <Users className="w-6 h-6" />
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Granular Permissions
          </p>
          <h3 className="text-2xl font-black text-foreground mt-1">{permissionCount}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
          <KeyRound className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
