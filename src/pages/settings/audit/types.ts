import type { LucideIcon } from 'lucide-react';
import type { AuditLogEntry } from '@/services/auditService';

export type AuditView = 'stream' | 'journey';

export type JourneyStatus = 'done' | 'pending' | 'failed';

export interface JourneyStep {
  label: string;
  description: string;
  timestamp?: string;
  status: JourneyStatus;
  icon: LucideIcon;
  logEntry?: AuditLogEntry;
}

export interface AuditActorInfo {
  name: string;
  role: string;
  email: string;
}

export interface JourneyStat {
  label: string;
  value: number;
  color: string;
  bg: string;
}
