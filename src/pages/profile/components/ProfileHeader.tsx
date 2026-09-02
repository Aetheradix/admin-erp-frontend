import { Camera, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/primitives/Button';
import { ProfileRoleBadges } from './ProfileRoleBadges';
import type { ProfileUserData } from '../hooks/useProfile';

export type TabType = 'overview' | 'profile' | 'organization';

interface ProfileHeaderProps {
  user: ProfileUserData;
  isEditing: boolean;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onStartEdit: () => void;
  onAddRole: (roleName: string) => void;
  onRemoveRole: (roleId: string) => void;
}

export const ProfileHeader = ({
  user,
  isEditing,
  activeTab,
  onTabChange,
  onStartEdit,
  onAddRole,
  onRemoveRole,
}: ProfileHeaderProps) => {
  return (
    <div className="bg-surface-elevated rounded-3xl border border-border-subtle shadow-soft overflow-hidden">
      <div className="p-8 sm:p-10 border-b border-border-subtle bg-gradient-to-r from-surface-subtle via-surface-elevated to-primary-soft/20 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          {/* Avatar & Info */}
          <div className="flex items-center gap-6">
            <div className="relative group/avatar">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-surface-elevated shadow-lg overflow-hidden bg-primary/10 flex items-center justify-center text-primary text-3xl font-black">
                {user.image ? (
                  <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{user.name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <button
                onClick={onStartEdit}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer border-2 border-surface-elevated"
                title="Change picture / Edit profile"
              >
                <Camera size={14} />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  {user.name}
                </h1>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-extrabold uppercase tracking-wider">
                  {user.employeeType}
                </span>
              </div>
              <p className="text-sm font-semibold text-muted">
                {user.designation} • {user.department}
              </p>

              {/* Dynamic Role Badges */}
              <ProfileRoleBadges
                roles={user.roles}
                onAddRole={onAddRole}
                onRemoveRole={onRemoveRole}
              />

              <div className="flex items-center gap-4 text-xs font-medium text-muted mt-1">
                <span className="flex items-center gap-1.5 text-success font-semibold">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  Available
                </span>
                <span>ID: {user.employeeId}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            {isEditing ? (
              <span className="px-4 py-2 rounded-2xl bg-primary/10 text-primary text-xs font-black uppercase tracking-wider flex items-center gap-2">
                <Edit3 size={14} /> Editing Mode
              </span>
            ) : (
              <Button
                variant="secondary"
                onClick={onStartEdit}
                className="h-10 px-5 rounded-2xl! gap-2 border-border-subtle! hover:border-primary/40!"
              >
                <Edit3 size={14} />
                <span className="font-bold text-xs">Edit Details</span>
              </Button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-8 mt-8 border-t border-border-subtle/60 pt-4 -mb-4 overflow-x-auto no-scrollbar">
          {(['overview', 'profile', 'organization'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`pb-3 text-sm font-extrabold capitalize tracking-wide transition-all relative cursor-pointer ${activeTab === tab ? 'text-primary' : 'text-muted hover:text-foreground'
                }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full animate-in fade-in zoom-in-75 duration-200" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
