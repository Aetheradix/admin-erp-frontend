import { Plus, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/primitives/Button';

interface RolesHeaderProps {
  canCreateRole: boolean;
  onRefresh: () => void;
  onCreate: () => void;
}

export function RolesHeader({ canCreateRole, onRefresh, onCreate }: RolesHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Role & Permission Management
          </h1>
          <p className="text-xs text-muted-foreground font-medium">
            Configure granular access controls, scope-based permissions, and inspect security audit
            trails
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="small" onClick={onRefresh} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
        {canCreateRole && (
          <Button variant="primary" size="small" onClick={onCreate} className="gap-2">
            <Plus className="w-4 h-4" /> New Custom Role
          </Button>
        )}
      </div>
    </div>
  );
}
