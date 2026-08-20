import { Users } from 'lucide-react';
import type { ProfileUserData } from '../hooks/useProfile';

interface OrganizationTabProps {
  user: ProfileUserData;
}

export const OrganizationTab = ({ user }: OrganizationTabProps) => {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Organization Tree */}
      <div className="bg-surface-subtle/50 p-6 sm:p-8 rounded-2xl border border-border-subtle flex flex-col gap-6">
        <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
          <Users size={16} className="text-primary" /> Reporting Hierarchy
        </h3>

        <div className="flex flex-col items-center gap-6 max-w-xl mx-auto w-full py-4">
          {/* Line Leader (if exists) */}
          {user.lineLeader && (
            <>
              <div className="w-full bg-white p-4 rounded-2xl border border-border-subtle shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      user.lineLeader.image ||
                      `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user.lineLeader.name)}`
                    }
                    alt={user.lineLeader.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-foreground">
                      {user.lineLeader.name}
                    </span>
                    <span className="text-[10px] font-semibold text-muted">
                      {user.lineLeader.role}
                    </span>
                    <span className="text-[10px] font-bold text-muted mt-0.5">
                      {user.lineLeader.code}
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-surface-subtle text-[10px] font-extrabold text-muted uppercase">
                  Line Leader
                </span>
              </div>
              <div className="w-0.5 h-6 bg-border-subtle" />
            </>
          )}

          {/* Direct Manager (if exists) */}
          {user.manager && (
            <>
              <div className="w-full bg-white p-4 rounded-2xl border border-border-subtle shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      user.manager.image ||
                      `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user.manager.name)}`
                    }
                    alt={user.manager.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-foreground">{user.manager.name}</span>
                    <span className="text-[10px] font-semibold text-muted">
                      {user.manager.role}
                    </span>
                    <span className="text-[10px] font-bold text-muted mt-0.5">
                      {user.manager.code}
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-[10px] font-extrabold text-primary uppercase">
                  Direct Manager
                </span>
              </div>
              <div className="w-0.5 h-6 bg-border-subtle" />
            </>
          )}

          {/* Current User Node */}
          <div className="w-full bg-gradient-to-r from-primary-soft/40 to-white p-5 rounded-2xl border-2 border-primary shadow-soft flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full border-2 border-primary shadow-md overflow-hidden bg-primary/10 flex items-center justify-center text-primary font-black">
                {user.image ? (
                  <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{user.name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-foreground">{user.name} (You)</span>
                <span className="text-xs font-bold text-primary">{user.designation}</span>
                <span className="text-[10px] font-semibold text-muted">{user.department}</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-primary text-white text-[10px] font-extrabold uppercase">
              You
            </span>
          </div>

          {/* Team Members / Direct Reports (if any) */}
          {user.teamMembers.length > 0 && (
            <>
              <div className="w-0.5 h-6 bg-border-subtle" />
              <div className="w-full flex flex-col gap-3">
                <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider text-center">
                  You work with
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {user.teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="bg-white p-3 rounded-xl border border-border-subtle flex items-center gap-3"
                    >
                      <img
                        src={
                          member.image ||
                          `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(member.name)}`
                        }
                        alt={member.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground">{member.name}</span>
                        <span className="text-[10px] text-muted">{member.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
