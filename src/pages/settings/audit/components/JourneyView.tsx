import { motion } from 'framer-motion';
import type { AuditLogEntry, InvitationRecord } from '@/services/auditService';
import type { AuditActorInfo } from '../types';
import { buildJourneyStats } from '../utils';
import { JourneyCard } from './JourneyCard';

interface JourneyViewProps {
  invitations: InvitationRecord[];
  filteredInvitations: InvitationRecord[];
  logs: AuditLogEntry[];
  search: string;
  actor: AuditActorInfo;
}

export function JourneyView({
  invitations,
  filteredInvitations,
  logs,
  search,
  actor,
}: JourneyViewProps) {
  const stats = buildJourneyStats(invitations);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bg} rounded-2xl p-4 border border-border-subtle`}>
            <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-muted font-semibold mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {filteredInvitations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border-subtle p-12 text-center text-muted text-sm">
          No invitation journeys found{search ? ' matching your search' : ''}.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredInvitations.map((inv) => (
            <JourneyCard key={inv.id} invitation={inv} logs={logs} actor={actor} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
