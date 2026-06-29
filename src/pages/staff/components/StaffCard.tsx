import { Mail, Phone, Edit2, Trash2, Shield } from 'lucide-react';
import type { StaffMember } from '@/types/models';

interface StaffCardProps {
  member: StaffMember;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPromote?: (id: string) => void;
}

export function StaffCard({ member, onEdit, onDelete, onPromote }: StaffCardProps) {

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-success';
      case 'On Leave': return 'bg-warning';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="group relative bg-white rounded-4xl p-8 border border-border-subtle shadow-soft hover:shadow-lg transition-all duration-500 hover:-translate-y-1 overflow-hidden">
      {/* Action Buttons (Edit/Delete) - Absolute Positioned */}
      {(onEdit || onPromote || onDelete) && (
        <div className="absolute right-6 top-6 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-20">
          {onEdit && (
            <button
              onClick={() => onEdit?.(String(member.id))}
              className="w-10 h-10 rounded-3xl bg-surface-subtle hover:bg-info hover:text-white transition-all duration-300 flex items-center justify-center border border-border-subtle shadow-sm"
              title="Edit Profile"
              aria-label={`Edit ${member.username || member.name}'s profile`}
            >
              <Edit2 size={16} />
            </button>
          )}
          {onPromote && (
            <button
              onClick={() => onPromote?.(String(member.id))}
              className="w-10 h-10 rounded-3xl bg-surface-subtle hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center border border-border-subtle shadow-sm"
              title="Promote to Admin"
              aria-label={`Promote ${member.username || member.name} to Administrator`}
            >
              <Shield size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete?.(String(member.id))}
              className="w-10 h-10 rounded-3xl bg-surface-subtle hover:bg-error hover:text-white transition-all duration-300 flex items-center justify-center border border-border-subtle shadow-sm"
              title="Remove Member"
              aria-label={`Remove ${member.username || member.name} from staff`}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}

      <div className="relative flex flex-col items-center text-center gap-6">
        {/* Avatar with Status Indicator */}
        <div className="relative">
          <div className="w-24 h-24 rounded-4xl overflow-hidden border-4 border-surface-subtle shadow-inner">
            <img
              src={member.image_url || member.image || `https://api.dicebear.com/7.x/notionists/svg?seed=${member.username || member.name}`}
              alt={member.username || member.name}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white ${getStatusColor(member.status ?? 'Active')} ${member.status === 'Active' ? 'animate-pulse' : ''}`} />
        </div>

        {/* Identity */}
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors duration-300">
            {member.username || member.name}
          </h3>
          <span className="text-xs font-black text-primary uppercase tracking-widest bg-primary/5 px-4 py-1.25 rounded-full">
            {member.designation || member.role}
          </span>
        </div>

        {/* Department & Join Date */}
        <div className="flex items-center gap-6 py-2 border-y border-border-subtle/50 w-full justify-center">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-muted uppercase tracking-tighter">Department</span>
            <span className="text-xs font-bold text-foreground">{member.department}</span>
          </div>
          <div className="h-4 w-px bg-border-subtle/50" />
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-muted uppercase tracking-tighter">Joined</span>
            <span className="text-xs font-bold text-foreground">{member.join_date || member.joinDate}</span>
          </div>
        </div>

        {/* Skills Tags */}
        <div className="flex flex-wrap justify-center gap-2">
          {member.skills.slice(0, 3).map((skill) => (
            <span key={skill} className="px-3 py-1 rounded-lg bg-surface-subtle text-[10px] font-bold text-muted-foreground border border-border-subtle/50">
              {skill}
            </span>
          ))}
          {member.skills.length > 3 && (
            <span className="px-3 py-1 rounded-lg bg-surface-subtle text-[10px] font-bold text-muted">
              +{member.skills.length - 3}
            </span>
          )}
        </div>

        {/* Contact Quick Actions */}
        <div className="grid grid-cols-2 gap-3 w-full pt-2">
          <button
            className="flex items-center justify-center gap-2 h-12 rounded-3xl bg-surface-subtle hover:bg-primary/5 hover:text-primary transition-all duration-300 border border-transparent hover:border-primary/20 group/contact"
            aria-label={`Send email to ${member.name}`}
          >
            <Mail size={16} className="text-muted group-hover/contact:text-primary" />
            <span className="text-xs font-black uppercase tracking-wider">Email</span>
          </button>
          <button
            className="flex items-center justify-center gap-2 h-12 rounded-3xl bg-surface-subtle hover:bg-primary/5 hover:text-primary transition-all duration-300 border border-transparent hover:border-primary/20 group/contact"
            aria-label={`Call ${member.name}`}
          >
            <Phone size={16} className="text-muted group-hover/contact:text-primary" />
            <span className="text-xs font-black uppercase tracking-wider">Call</span>
          </button>
        </div>
      </div>
    </div>
  );
}
