import type { Office, GeofenceAuditLog } from '@/store/api/attendanceSlice';

export type { Office, GeofenceAuditLog };

export type BranchesSubTab = 'offices' | 'logs';

export interface BranchesPageProps {
  autoOpenHQ?: boolean;
  autoOpenCreate?: boolean;
  onClearAutoOpen?: () => void;
}

export interface OfficeFormData {
  id?: number;
  name: string;
  address: string;
  latitude: number | '';
  longitude: number | '';
  radius: number;
  timezone: string;
  is_active: boolean;
  is_hq: boolean;
}
