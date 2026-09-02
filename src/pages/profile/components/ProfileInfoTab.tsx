import { useState } from 'react';
import { Mail, Phone, MapPin, Building, Globe, Edit3, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/primitives/Button';
import type { ProfileUserData } from '../hooks/useProfile';

interface ProfileInfoTabProps {
  user: ProfileUserData;
  isEditing: boolean;
  onStartEdit: () => void;
  onElevationClick: () => void;
}

export const ProfileInfoTab = ({
  user,
  isEditing,
  onStartEdit,
  onElevationClick,
}: ProfileInfoTabProps) => {
  const [showMoreContact, setShowMoreContact] = useState(false);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Contact Information Matrix */}
      <div className="bg-surface-subtle/50 p-6 sm:p-8 rounded-2xl border border-border-subtle flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
            <Mail size={16} className="text-primary" /> Contact Information
          </h3>
          {!isEditing && (
            <button
              onClick={onStartEdit}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Edit3 size={12} /> Edit Contact Info
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Email */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider">
              Email
            </span>
            <a
              href={`mailto:${user.email}`}
              className="text-xs font-bold text-foreground hover:text-primary transition-colors flex items-center gap-2"
            >
              <Mail size={14} className="text-muted" />
              {user.email || 'Not specified'}
            </a>
          </div>

          {/* Contact No */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider">
              Contact No
            </span>
            <a
              href={`tel:${user.contactNo}`}
              className="text-xs font-bold text-foreground hover:text-primary transition-colors flex items-center gap-2"
            >
              <Phone size={14} className="text-muted" />
              {user.contactNo || 'Not specified'}
            </a>
          </div>

          {/* Work Location */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider">
              Work Location
            </span>
            <div className="text-xs font-bold text-foreground flex items-center gap-2">
              <MapPin size={14} className="text-muted" />
              {user.workLocation || 'Not specified'}
            </div>
          </div>

          {/* Company */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider">
              Company
            </span>
            <div className="text-xs font-bold text-foreground flex items-center gap-2">
              <Building size={14} className="text-muted" />
              {user.company || 'Not specified'}
            </div>
          </div>

          {/* T-Number */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider">
              T-Number
            </span>
            <div className="text-xs font-bold text-foreground flex items-center gap-2">
              <Phone size={14} className="text-muted" />
              {user.tNumber || 'Not specified'}
            </div>
          </div>

          {/* Joined On */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider">
              Joined Date
            </span>
            <div className="text-xs font-bold text-foreground flex items-center gap-2">
              <Calendar size={14} className="text-muted" />
              {user.joinDate || 'Not specified'}
            </div>
          </div>
        </div>

        {showMoreContact && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-border-subtle animate-in fade-in duration-200">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider">
                Country
              </span>
              <div className="text-xs font-bold text-foreground flex items-center gap-2">
                <Globe size={14} className="text-muted" />
                {user.country || 'Not specified'}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider">
                Cost Center
              </span>
              <div className="text-xs font-bold text-foreground">
                {user.costCenter || 'Not specified'}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider">
                Sub Organization
              </span>
              <div className="text-xs font-bold text-foreground">
                {user.subOrganization || 'Not specified'}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowMoreContact(!showMoreContact)}
          className="text-xs font-extrabold text-primary hover:text-primary-hover self-start cursor-pointer mt-2"
        >
          {showMoreContact ? 'Show Less Details' : 'Show 3 More Contact Details'}
        </button>
      </div>

      {/* Work Hours & Status Banner */}
      <div className="bg-gradient-to-r from-primary-soft/30 via-surface-elevated to-surface-subtle p-6 rounded-2xl border border-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Clock size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black text-foreground uppercase tracking-wider">
              Work Hours & Activity
            </span>
            <span className="text-sm font-bold text-primary">{user.workHours}</span>
            <span className="text-xs font-semibold text-muted">
              Status: {user.statusText} • Last seen {user.lastSeen}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={onElevationClick}
          className="text-xs font-black text-primary hover:bg-primary/10 rounded-xl px-4 py-2 border border-primary/30"
        >
          Request Admin Elevation
        </Button>
      </div>
    </div>
  );
};
