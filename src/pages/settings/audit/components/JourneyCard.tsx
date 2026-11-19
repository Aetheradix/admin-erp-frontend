import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { AuditLogEntry, InvitationRecord } from '@/services/auditService';
import { INVITATION_STATUS_BADGE } from '../constants';
import type { AuditActorInfo } from '../types';
import { buildJourney } from '../utils';
import { JourneyTimeline } from './JourneyTimeline';

interface JourneyCardProps {
  invitation: InvitationRecord;
  logs: AuditLogEntry[];
  actor: AuditActorInfo;
}

export function JourneyCard({ invitation, logs, actor }: JourneyCardProps) {
  const [expanded, setExpanded] = useState(false);
  const steps = buildJourney(invitation, logs, actor);
  const doneCount = steps.filter((s) => s.status === 'done').length;

  const adminName = invitation.invitedBy?.name || actor.name;
  const adminRole = invitation.invitedBy?.role || actor.role;
  const adminEmail = invitation.invitedBy?.email || actor.email;
  const progress = Math.round((doneCount / steps.length) * 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-border-subtle shadow-soft overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full text-left p-5 flex items-center gap-4 hover:bg-surface-subtle/40 transition-colors cursor-pointer">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-black text-sm flex items-center justify-center shrink-0">
          {(invitation.name || invitation.email).charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-black text-foreground truncate">
              {invitation.name || invitation.email}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              Role: {invitation.role}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${INVITATION_STATUS_BADGE[invitation.status]}`}>
              {invitation.status}
            </span>
          </div>
          <div className="text-[11px] text-muted truncate font-mono">
            {invitation.email} · {invitation.department}
          </div>
          <div className="text-[11px] text-muted mt-1.5 flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 bg-surface-subtle px-2.5 py-1 rounded-lg border border-border-subtle">
              <span className="text-muted text-[10px] font-bold uppercase tracking-wider">
                Invited by:
              </span>
              <strong className="text-foreground font-bold">{adminName}</strong>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                {adminRole}
              </span>
              <span className="text-[10px] text-muted font-mono">({adminEmail})</span>
            </span>
            <span className="text-[10px] text-muted">
              {new Date(invitation.invitedAt).toLocaleDateString()} at{' '}
              {new Date(invitation.invitedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Progress ring */}
        <div className="shrink-0 flex flex-col items-center gap-1">
          <div className="relative w-12 h-12">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-border-subtle/40"
              />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke={progress === 100 ? '#22c55e' : '#6366f1'}
                strokeWidth="3"
                strokeDasharray={`${(progress / 100) * 97.4} 97.4`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-foreground">
              {progress}%
            </span>
          </div>
          <span className="text-[9px] font-bold text-muted uppercase tracking-wider">
            {doneCount}/{steps.length}
          </span>
        </div>

        {/* Expand caret */}
        <div className="text-muted ml-1">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Progress bar */}
      <div className="h-1 w-full bg-border-subtle/30">
        <div
          className="h-full transition-all duration-700 ease-out rounded-full"
          style={{
            width: `${progress}%`,
            background: progress === 100 ? '#22c55e' : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
          }}
        />
      </div>

      {/* Timeline (expandable) */}
      {expanded && (
        <div className="px-5 pb-5 pt-4">
          <JourneyTimeline steps={steps} />
        </div>
      )}
    </motion.div>
  );
}
