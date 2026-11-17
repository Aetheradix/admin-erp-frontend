import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import type { StaffMember } from '@/types/models';

export interface BaseEmployeeIdentifier {
  id?: number | string;
  userId?: number | string;
  username?: string;
  name?: string;
  email?: string;
  employeeCode?: string;
  employee_code?: string;
  employeeId?: string;
  role?: string;
  designation?: string;
  department?: string;
  image?: string;
  image_url?: string;
  reporting_manager_id?: number | null;
  manager?: unknown;
  contact_number?: string;
}

export type EmployeeInput =
  | HierarchyNodeUser
  | StaffMember
  | BaseEmployeeIdentifier
  | number
  | string
  | Record<string, unknown>;

export interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ReportPositionItem {
  pos: NodePosition;
  user: HierarchyNodeUser;
  subPositions: Array<{ pos: NodePosition; user: HierarchyNodeUser }>;
}

export interface LayoutBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

export interface ConnectorPath {
  id: string;
  d: string;
  highlighted?: boolean;
}

export interface LayoutResult {
  bounds: LayoutBounds;
  grandManagerPos: NodePosition | null;
  managerPos: NodePosition | null;
  centralPos: NodePosition;
  reportsPositions: ReportPositionItem[];
  emptyReportsPos: NodePosition | null;
  connectors: ConnectorPath[];
}

export type OrgNodeVariant = 'grand' | 'manager' | 'report' | 'sub';

export type DetailTab = 'contact' | 'organization' | 'skills';

export interface JoinDateInfo {
  dateFormatted: string;
  timeFormatted: string;
  timezone: string;
  fullDateTime: string;
}

export interface ResolvedOffice {
  id: number;
  name: string;
  address?: string | null;
  timezone: string;
  is_hq?: boolean;
  isHq?: boolean;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export interface EmployeeModelViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeInput | null;
}
