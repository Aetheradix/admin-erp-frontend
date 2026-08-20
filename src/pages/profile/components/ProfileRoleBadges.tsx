import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface RoleItem {
  id: string;
  name: string;
  color?: string;
}

interface ProfileRoleBadgesProps {
  roles: RoleItem[];
  onAddRole: (roleName: string) => void;
  onRemoveRole: (roleId: string) => void;
}

export const ProfileRoleBadges = ({ roles, onAddRole, onRemoveRole }: ProfileRoleBadgesProps) => {
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [newRoleInput, setNewRoleInput] = useState('');

  const handleAddRoleSubmit = () => {
    if (newRoleInput.trim()) {
      onAddRole(newRoleInput.trim());
      setNewRoleInput('');
      setIsAddingRole(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap mt-1">
      {roles.map((role) => (
        <span
          key={role.id}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-subtle border border-border-subtle text-xs font-bold text-foreground shadow-2xs hover:border-primary/40 transition-all"
        >
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span>{role.name}</span>
          <button
            onClick={() => onRemoveRole(role.id)}
            className="text-muted hover:text-danger cursor-pointer rounded-full p-0.5 hover:bg-danger-soft/30 transition-colors"
            title={`Remove ${role.name} role`}
          >
            <X size={12} />
          </button>
        </span>
      ))}

      {isAddingRole ? (
        <div className="flex items-center gap-1 bg-white border border-primary rounded-full px-2 py-0.5 shadow-sm animate-in fade-in zoom-in-95 duration-150">
          <input
            type="text"
            value={newRoleInput}
            onChange={(e) => setNewRoleInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddRoleSubmit();
              if (e.key === 'Escape') setIsAddingRole(false);
            }}
            placeholder="Role name..."
            className="text-xs font-semibold px-2 py-0.5 outline-none w-28 text-foreground"
            autoFocus
          />
          <button
            onClick={handleAddRoleSubmit}
            className="text-xs font-black bg-primary text-white px-2 py-0.5 rounded-full hover:bg-primary/90 cursor-pointer"
          >
            Add
          </button>
          <button
            onClick={() => setIsAddingRole(false)}
            className="text-xs text-muted hover:text-foreground px-1 cursor-pointer"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingRole(true)}
          className="w-7 h-7 rounded-full bg-surface-subtle border border-dashed border-border-subtle hover:border-primary text-muted hover:text-primary flex items-center justify-center transition-all cursor-pointer shadow-2xs"
          title="Add Role"
        >
          <Plus size={14} />
        </button>
      )}
    </div>
  );
};
