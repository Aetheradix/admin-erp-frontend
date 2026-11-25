import { History, KeyRound, Shield, Users } from 'lucide-react';
import type { RolesTab } from '../types';

interface RolesTabNavProps {
  activeTab: RolesTab;
  roleCount: number;
  onChange: (tab: RolesTab) => void;
}

const TABS: Array<{
  id: RolesTab;
  icon: React.ComponentType<{ className?: string }>;
  label: (count: number) => string;
}> = [
  { id: 'roles', icon: Shield, label: (count) => `Role Directory (${count})` },
  { id: 'matrix', icon: KeyRound, label: () => 'Permission Matrix (Modules × Actions)' },
  { id: 'assignments', icon: Users, label: () => 'User Role Assignments' },
  { id: 'audit', icon: History, label: () => 'RBAC Security Audit Logs' },
];

export function RolesTabNav({ activeTab, roleCount, onChange }: RolesTabNavProps) {
  return (
    <div className="flex border-b border-border/60 gap-8">
      {TABS.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === id
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}>
          <Icon className="w-4 h-4" /> {label(roleCount)}
        </button>
      ))}
    </div>
  );
}
