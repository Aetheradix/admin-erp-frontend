import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, message } from 'antd';
import {
  X,
  Network,
  Crown,
  ChevronRight,
  ChevronDown,
  Mail,
  Phone,
  Building2,
  Users,
  Shield,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Compass,
  RotateCcw,
  Maximize2,
  ExternalLink,
  MessageSquare,
  Calendar,
  Copy,
  Check,
  MapPin,
  Clock,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import {
  useGetOrganizationHierarchyQuery,
  useGetCompanyProfileQuery,
  type HierarchyNodeUser,
} from '@/store/api/organizationApiSlice';
import { useGetUsersQuery } from '@/store/api/userSlice';
import { useGetAllOfficesQuery } from '@/store/api/attendanceSlice';
import { getEmployeeProfile } from '@/services/employeeProfileService';
import { getDepartmentColor } from '../utils/orgLayoutEngine';

export interface EmployeeModelViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
}

interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const EmployeeModelViewModal: React.FC<EmployeeModelViewModalProps> = ({
  isOpen,
  onClose,
  employee,
}) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // RTK Query: fetch organizational hierarchy & user directory
  const { data: hierarchyResponse, isLoading: isLoadingHierarchy } =
    useGetOrganizationHierarchyQuery();
  const { data: dbUsers = [] } = useGetUsersQuery();
  const { data: offices = [] } = useGetAllOfficesQuery();
  const { data: companyProfileResponse } = useGetCompanyProfileQuery();
  const companyProfile = companyProfileResponse?.data;

  const flatUsers = hierarchyResponse?.data?.flatUsers || [];

  // Active focused central employee ID in the tree
  const [focusedUserId, setFocusedUserId] = useState<number | null>(null);

  // Active inspected employee for the Microsoft Profile Card sidebar
  const [inspectedUserId, setInspectedUserId] = useState<number | null>(null);

  // Navigation history stack for breadcrumbs/navigation inside modal
  const [navigationHistory, setNavigationHistory] = useState<number[]>([]);

  // Toggle Microsoft detail side panel open/closed
  const [showDetailPanel, setShowDetailPanel] = useState<boolean>(true);

  // Active tab in Microsoft Detail Panel: 'contact' | 'organization' | 'skills'
  const [detailTab, setDetailTab] = useState<'contact' | 'organization' | 'skills'>('contact');

  // Expanded sub-trees state: childId -> boolean
  const [expandedSubTrees, setExpandedSubTrees] = useState<Record<number, boolean>>({});

  // Copy email feedback
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);

  // Pan & Zoom state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // ── Helper: Resolve User from Any Input Object / Identifier ────────────────
  const resolveUser = useCallback(
    (target: any): HierarchyNodeUser | null => {
      if (!target) return null;

      const targetId = typeof target === 'object' ? target.id || target.userId : target;
      const targetCode =
        typeof target === 'object'
          ? target.employeeCode || target.employee_code || target.employeeId
          : null;
      const targetEmail = typeof target === 'object' ? target.email : null;
      const targetName = typeof target === 'object' ? target.username || target.name : null;

      // 1. Try finding in hierarchy flatUsers
      let found = flatUsers.find((u) => {
        if (targetId && String(u.id) === String(targetId)) return true;
        if (targetCode && u.employee_code && String(u.employee_code).toLowerCase() === String(targetCode).toLowerCase())
          return true;
        if (targetId && u.employee_code && String(u.employee_code).toLowerCase() === String(targetId).toLowerCase())
          return true;
        if (targetEmail && u.email && u.email.toLowerCase() === targetEmail.toLowerCase())
          return true;
        if (targetName && u.username && u.username.toLowerCase() === targetName.toLowerCase())
          return true;
        return false;
      });

      // 2. Fallback to dbUsers
      if (!found && dbUsers.length > 0) {
        const dbU = dbUsers.find((u) => {
          if (targetId && String(u.id) === String(targetId)) return true;
          if (
            targetCode &&
            (u.employee_code || u.employee_id) &&
            String(u.employee_code || u.employee_id).toLowerCase() === String(targetCode).toLowerCase()
          )
            return true;
          if (targetEmail && u.email && u.email.toLowerCase() === targetEmail.toLowerCase())
            return true;
          if (
            targetName &&
            (u.username || u.name) &&
            String(u.username || u.name).toLowerCase() === targetName.toLowerCase()
          )
            return true;
          return false;
        });

        if (dbU) {
          found = {
            id: Number(dbU.id) || 0,
            username: dbU.username || dbU.name || 'Employee',
            email: dbU.email || '',
            role: dbU.role || 'Member',
            department: dbU.department || 'General',
            designation: dbU.designation || dbU.role,
            employee_code: dbU.employee_code || dbU.employee_id || `EMP-${dbU.id}`,
            image_url: dbU.image_url || dbU.image,
            reporting_manager_id: dbU.reporting_manager_id ?? null,
            directReports: [],
            subordinatesCount: 0,
          } as HierarchyNodeUser;
        }
      }

      // 3. Fallback: construct from target object if target has basic properties
      if (!found && typeof target === 'object' && (target.name || target.username)) {
        found = {
          id: Number(target.id) || 9999,
          username: target.username || target.name || 'Employee',
          email: target.email || '',
          role: target.designation || target.role || 'Member',
          department: target.department || 'General',
          designation: target.designation || target.role,
          employee_code: target.employeeCode || target.employee_code || target.employeeId || 'EMP',
          image_url: target.image || target.image_url,
          reporting_manager_id: target.reporting_manager_id ?? (target.manager ? 1 : null),
          directReports: [],
          subordinatesCount: 0,
        } as HierarchyNodeUser;
      }

      return found || null;
    },
    [flatUsers, dbUsers]
  );

  // Initialize focused user when employee prop changes or modal opens
  useEffect(() => {
    if (isOpen && employee) {
      const resolved = resolveUser(employee);
      if (resolved) {
        setFocusedUserId(resolved.id);
        setInspectedUserId(resolved.id);
      }
      setNavigationHistory([]);
      // Expand direct reports sub-trees by default for visibility
      setExpandedSubTrees({});
    }
  }, [isOpen, employee, resolveUser]);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Resolve the central / focused user node
  const focusedNode = useMemo<HierarchyNodeUser | null>(() => {
    if (focusedUserId) {
      return flatUsers.find((u) => u.id === focusedUserId) || resolveUser(focusedUserId);
    }
    return resolveUser(employee);
  }, [focusedUserId, employee, flatUsers, resolveUser]);

  // Resolve the inspected user node for Microsoft Profile Card
  const inspectedNode = useMemo<HierarchyNodeUser | null>(() => {
    if (inspectedUserId) {
      return flatUsers.find((u) => u.id === inspectedUserId) || resolveUser(inspectedUserId);
    }
    return focusedNode;
  }, [inspectedUserId, focusedNode, flatUsers, resolveUser]);

  // Reporting Manager (Parent of focusedNode)
  const reportingManager = useMemo<HierarchyNodeUser | null>(() => {
    if (!focusedNode?.reporting_manager_id) return null;
    return (
      flatUsers.find((u) => u.id === focusedNode.reporting_manager_id) ||
      resolveUser(focusedNode.reporting_manager_id)
    );
  }, [focusedNode, flatUsers, resolveUser]);

  // Grand Manager (Grandparent of focusedNode)
  const grandManager = useMemo<HierarchyNodeUser | null>(() => {
    if (!reportingManager?.reporting_manager_id) return null;
    return (
      flatUsers.find((u) => u.id === reportingManager.reporting_manager_id) ||
      resolveUser(reportingManager.reporting_manager_id)
    );
  }, [reportingManager, flatUsers, resolveUser]);

  // Direct Reports (Children of focusedNode)
  const directReports = useMemo<HierarchyNodeUser[]>(() => {
    if (!focusedNode) return [];
    const direct = flatUsers.filter((u) => u.reporting_manager_id === focusedNode.id);
    if (direct.length > 0) return direct;
    return focusedNode.directReports || [];
  }, [focusedNode, flatUsers]);

  // Sub-under tree map: directReport.id -> array of their reports
  const subUnderReportsMap = useMemo<Record<number, HierarchyNodeUser[]>>(() => {
    const map: Record<number, HierarchyNodeUser[]> = {};
    directReports.forEach((rep) => {
      const subs = flatUsers.filter((u) => u.reporting_manager_id === rep.id);
      map[rep.id] = subs.length > 0 ? subs : rep.directReports || [];
    });
    return map;
  }, [directReports, flatUsers]);

  // Peers (Siblings reporting to same manager)
  const peers = useMemo<HierarchyNodeUser[]>(() => {
    if (!focusedNode?.reporting_manager_id) return [];
    return flatUsers
      .filter(
        (u) =>
          u.reporting_manager_id === focusedNode.reporting_manager_id &&
          u.id !== focusedNode.id
      )
      .slice(0, 8);
  }, [focusedNode, flatUsers]);

  // Match inspected user in dbUsers directory for complete employee profile
  const inspectedDbUser = useMemo(() => {
    if (!inspectedNode) return null;
    return (
      dbUsers.find(
        (u) =>
          String(u.id) === String(inspectedNode.id) ||
          (inspectedNode.email && u.email?.toLowerCase() === inspectedNode.email.toLowerCase()) ||
          (inspectedNode.employee_code &&
            (u.employee_code === inspectedNode.employee_code ||
              u.employee_id === inspectedNode.employee_code))
      ) || null
    );
  }, [inspectedNode, dbUsers]);

  // Stored employee onboarding profile
  const empStored = useMemo(() => {
    if (!inspectedNode) return null;
    return (
      getEmployeeProfile(inspectedNode.id) ||
      (inspectedNode.email ? getEmployeeProfile(inspectedNode.email) : null)
    );
  }, [inspectedNode]);

  // Real office location from database (SFA Technologies / Registered Hubs)
  const resolvedOffice = useMemo(() => {
    const targetOfficeId =
      (inspectedDbUser as any)?.office_id ||
      (inspectedDbUser as any)?.officeId ||
      (inspectedNode as any)?.office_id ||
      (inspectedNode as any)?.officeId;

    if (targetOfficeId && offices.length > 0) {
      const found = offices.find((o) => o.id === Number(targetOfficeId));
      if (found) return found;
    }

    // Check HQ office from offices list
    const hqOffice = offices.find((o) => o.is_hq || o.isHq);
    if (hqOffice) return hqOffice;

    // Check first active office in offices
    const activeOffice = offices.find((o) => o.is_active || o.isActive);
    if (activeOffice) return activeOffice;

    if (offices.length > 0) return offices[0];

    // Fallback to companyProfile hq_office
    if (companyProfile?.hq_office) {
      return {
        id: companyProfile.hq_office.id,
        name: companyProfile.hq_office.name || companyProfile.name,
        address: companyProfile.hq_office.address || companyProfile.address,
        timezone: 'Asia/Kolkata',
        is_hq: true,
        isHq: true,
        latitude: Number(companyProfile.hq_office.latitude) || 23.2323,
        longitude: Number(companyProfile.hq_office.longitude) || 77.4385,
        radius: companyProfile.hq_office.radius || 100,
      } as any;
    }

    if (companyProfile?.address) {
      return {
        id: 1,
        name: companyProfile.name || 'SFA Technologies',
        address: companyProfile.address,
        timezone: 'Asia/Kolkata',
        is_hq: true,
        isHq: true,
        latitude: 23.2323,
        longitude: 77.4385,
        radius: 100,
      } as any;
    }

    return null;
  }, [offices, companyProfile, inspectedDbUser, inspectedNode]);

  // Real joining date and time from database
  const formattedJoinDateTime = useMemo(() => {
    const rawVal =
      (inspectedDbUser as any)?.join_date ||
      (inspectedDbUser as any)?.joinDate ||
      (inspectedDbUser as any)?.created_at ||
      (inspectedDbUser as any)?.createdAt ||
      (inspectedNode as any)?.join_date ||
      (inspectedNode as any)?.joinDate ||
      (inspectedNode as any)?.created_at ||
      empStored?.employeeIdAssignedAt ||
      empStored?.approvedAt ||
      empStored?.submittedAt;

    if (!rawVal) {
      return {
        dateFormatted: 'Official Member',
        timeFormatted: '10:00 AM',
        timezone: resolvedOffice?.timezone || 'Asia/Kolkata',
        fullDateTime: 'Active verified employee in company database',
      };
    }

    const d = new Date(rawVal);
    if (Number.isNaN(d.getTime())) {
      return {
        dateFormatted: String(rawVal),
        timeFormatted: '10:00 AM',
        timezone: resolvedOffice?.timezone || 'Asia/Kolkata',
        fullDateTime: `${rawVal} (${resolvedOffice?.timezone || 'Asia/Kolkata'})`,
      };
    }

    const dateFormatted = d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const timeFormatted = d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const timezone = resolvedOffice?.timezone || 'Asia/Kolkata';

    return {
      dateFormatted,
      timeFormatted,
      timezone,
      fullDateTime: `${dateFormatted} at ${timeFormatted} (${timezone})`,
    };
  }, [inspectedDbUser, inspectedNode, empStored, resolvedOffice]);

  // Navigation: Change central focus user
  const handleFocusUser = (user: HierarchyNodeUser) => {
    if (user.id === focusedNode?.id) {
      setInspectedUserId(user.id);
      return;
    }
    if (focusedNode) {
      setNavigationHistory((prev) => [...prev, focusedNode.id]);
    }
    setFocusedUserId(user.id);
    setInspectedUserId(user.id);
  };

  // Inspect user (updates Microsoft detail card without changing central tree root)
  const handleInspectUser = (user: HierarchyNodeUser) => {
    setInspectedUserId(user.id);
    if (!showDetailPanel) {
      setShowDetailPanel(true);
    }
  };

  // Toggle sub-under tree expansion for a specific report
  const handleToggleSubTree = (reportId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSubTrees((prev) => ({
      ...prev,
      [reportId]: !prev[reportId],
    }));
  };

  const handleBackNavigation = () => {
    if (navigationHistory.length === 0) return;
    const prevId = navigationHistory[navigationHistory.length - 1];
    setNavigationHistory((prev) => prev.slice(0, -1));
    setFocusedUserId(prevId);
    setInspectedUserId(prevId);
  };

  // Node Dimensions
  const CENTRAL_WIDTH = 340;
  const CENTRAL_HEIGHT = 200;
  const SECONDARY_WIDTH = 300;
  const SECONDARY_HEIGHT = 152;
  const SUB_NODE_WIDTH = 270;
  const SUB_NODE_HEIGHT = 136;
  const EMPTY_CARD_WIDTH = 320;
  const EMPTY_CARD_HEIGHT = 110;

  // ── Layout Computation including Sub-Under Tree ─────────────────────────────
  const layout = useMemo(() => {
    if (!focusedNode) {
      return {
        bounds: { minX: 0, maxX: 600, minY: 0, maxY: 400, width: 600, height: 400 },
        grandManagerPos: null as NodePosition | null,
        managerPos: null as NodePosition | null,
        centralPos: { x: 0, y: 0, width: CENTRAL_WIDTH, height: CENTRAL_HEIGHT },
        reportsPositions: [] as Array<{
          pos: NodePosition;
          user: HierarchyNodeUser;
          subPositions: Array<{ pos: NodePosition; user: HierarchyNodeUser }>;
        }>,
        emptyReportsPos: null as NodePosition | null,
        connectors: [] as Array<{ id: string; d: string; highlighted?: boolean }>,
      };
    }

    const rowGap = 76;
    const childColGap = 32;
    const subColGap = 20;

    const centralY = 0;
    const centralX = -CENTRAL_WIDTH / 2;

    // Manager position (above central node)
    const managerY = centralY - (SECONDARY_HEIGHT + rowGap);
    const managerX = -SECONDARY_WIDTH / 2;
    const managerPos = reportingManager
      ? { x: managerX, y: managerY, width: SECONDARY_WIDTH, height: SECONDARY_HEIGHT }
      : null;

    // Grand Manager position (above manager)
    const grandManagerY = managerY - (SECONDARY_HEIGHT + rowGap);
    const grandManagerX = -SECONDARY_WIDTH / 2;
    const grandManagerPos = grandManager
      ? { x: grandManagerX, y: grandManagerY, width: SECONDARY_WIDTH, height: SECONDARY_HEIGHT }
      : null;

    // Direct Reports & Sub-under tree positions
    const reportsY = centralY + CENTRAL_HEIGHT + rowGap;
    const reportCount = directReports.length;

    let emptyReportsPos: NodePosition | null = null;
    const reportsPositions: Array<{
      pos: NodePosition;
      user: HierarchyNodeUser;
      subPositions: Array<{ pos: NodePosition; user: HierarchyNodeUser }>;
    }> = [];

    const connectors: Array<{ id: string; d: string; highlighted?: boolean }> = [];

    if (reportCount === 0) {
      emptyReportsPos = {
        x: -EMPTY_CARD_WIDTH / 2,
        y: reportsY,
        width: EMPTY_CARD_WIDTH,
        height: EMPTY_CARD_HEIGHT,
      };
    } else {
      // Calculate column widths factoring in expanded sub-under trees
      const colWidths = directReports.map((rep) => {
        const isExpanded = expandedSubTrees[rep.id];
        const subs = subUnderReportsMap[rep.id] || [];
        if (isExpanded && subs.length > 0) {
          const subTotalWidth = subs.length * SUB_NODE_WIDTH + (subs.length - 1) * subColGap;
          return Math.max(SECONDARY_WIDTH, subTotalWidth);
        }
        return SECONDARY_WIDTH;
      });

      const totalReportsSpan =
        colWidths.reduce((a, b) => a + b, 0) + (reportCount - 1) * childColGap;
      let currentLeftX = -totalReportsSpan / 2;

      directReports.forEach((rep, i) => {
        const colWidth = colWidths[i];
        const repX = currentLeftX + (colWidth - SECONDARY_WIDTH) / 2;
        const repPos = {
          x: repX,
          y: reportsY,
          width: SECONDARY_WIDTH,
          height: SECONDARY_HEIGHT,
        };

        const subPositions: Array<{ pos: NodePosition; user: HierarchyNodeUser }> = [];
        const isExpanded = expandedSubTrees[rep.id];
        const subs = subUnderReportsMap[rep.id] || [];

        if (isExpanded && subs.length > 0) {
          const subRowY = reportsY + SECONDARY_HEIGHT + rowGap;
          const totalSubWidth = subs.length * SUB_NODE_WIDTH + (subs.length - 1) * subColGap;
          const subStartX = currentLeftX + (colWidth - totalSubWidth) / 2;

          subs.forEach((subUser, subIdx) => {
            const subPos = {
              x: subStartX + subIdx * (SUB_NODE_WIDTH + subColGap),
              y: subRowY,
              width: SUB_NODE_WIDTH,
              height: SUB_NODE_HEIGHT,
            };
            subPositions.push({ pos: subPos, user: subUser });

            // Connector from direct report to sub-under tree node
            const repBottomX = repPos.x + repPos.width / 2;
            const repBottomY = repPos.y + repPos.height;
            const subTopX = subPos.x + subPos.width / 2;
            const subTopY = subPos.y;
            const cy1 = repBottomY + (subTopY - repBottomY) * 0.5;
            const cy2 = subTopY - (subTopY - repBottomY) * 0.5;

            connectors.push({
              id: `conn-sub-${rep.id}-${subUser.id}`,
              d: `M ${repBottomX} ${repBottomY} C ${repBottomX} ${cy1}, ${subTopX} ${cy2}, ${subTopX} ${subTopY}`,
              highlighted: false,
            });
          });
        }

        reportsPositions.push({ pos: repPos, user: rep, subPositions });
        currentLeftX += colWidth + childColGap;
      });
    }

    // Connectors: GrandManager to Manager
    if (grandManagerPos && managerPos) {
      const sx = grandManagerPos.x + grandManagerPos.width / 2;
      const sy = grandManagerPos.y + grandManagerPos.height;
      const ex = managerPos.x + managerPos.width / 2;
      const ey = managerPos.y;
      const cy1 = sy + (ey - sy) * 0.5;
      const cy2 = ey - (ey - sy) * 0.5;
      connectors.push({
        id: 'conn-grand-mgr',
        d: `M ${sx} ${sy} C ${sx} ${cy1}, ${ex} ${cy2}, ${ex} ${ey}`,
      });
    }

    // Connectors: Manager to Central Node
    if (managerPos) {
      const sx = managerPos.x + managerPos.width / 2;
      const sy = managerPos.y + managerPos.height;
      const ex = centralX + CENTRAL_WIDTH / 2;
      const ey = centralY;
      const cy1 = sy + (ey - sy) * 0.5;
      const cy2 = ey - (ey - sy) * 0.5;
      connectors.push({
        id: 'conn-mgr-central',
        d: `M ${sx} ${sy} C ${sx} ${cy1}, ${ex} ${cy2}, ${ex} ${ey}`,
        highlighted: true,
      });
    }

    // Connectors: Central Node to Direct Reports
    const centralBottomX = centralX + CENTRAL_WIDTH / 2;
    const centralBottomY = centralY + CENTRAL_HEIGHT;

    if (emptyReportsPos) {
      const ex = emptyReportsPos.x + emptyReportsPos.width / 2;
      const ey = emptyReportsPos.y;
      const cy1 = centralBottomY + (ey - centralBottomY) * 0.5;
      const cy2 = ey - (ey - centralBottomY) * 0.5;
      connectors.push({
        id: 'conn-central-empty',
        d: `M ${centralBottomX} ${centralBottomY} C ${centralBottomX} ${cy1}, ${ex} ${cy2}, ${ex} ${ey}`,
      });
    } else {
      reportsPositions.forEach((item, i) => {
        const ex = item.pos.x + item.pos.width / 2;
        const ey = item.pos.y;
        const cy1 = centralBottomY + (ey - centralBottomY) * 0.5;
        const cy2 = ey - (ey - centralBottomY) * 0.5;
        connectors.push({
          id: `conn-central-rep-${i}`,
          d: `M ${centralBottomX} ${centralBottomY} C ${centralBottomX} ${cy1}, ${ex} ${cy2}, ${ex} ${ey}`,
          highlighted: true,
        });
      });
    }

    // Calculate Bounds
    const allX: number[] = [centralX, centralX + CENTRAL_WIDTH];
    const allY: number[] = [centralY, centralY + CENTRAL_HEIGHT];

    if (grandManagerPos) {
      allX.push(grandManagerPos.x, grandManagerPos.x + grandManagerPos.width);
      allY.push(grandManagerPos.y, grandManagerPos.y + grandManagerPos.height);
    }
    if (managerPos) {
      allX.push(managerPos.x, managerPos.x + managerPos.width);
      allY.push(managerPos.y, managerPos.y + managerPos.height);
    }
    if (emptyReportsPos) {
      allX.push(emptyReportsPos.x, emptyReportsPos.x + emptyReportsPos.width);
      allY.push(emptyReportsPos.y, emptyReportsPos.y + emptyReportsPos.height);
    }
    reportsPositions.forEach(({ pos, subPositions }) => {
      allX.push(pos.x, pos.x + pos.width);
      allY.push(pos.y, pos.y + pos.height);
      subPositions.forEach(({ pos: sPos }) => {
        allX.push(sPos.x, sPos.x + sPos.width);
        allY.push(sPos.y, sPos.y + sPos.height);
      });
    });

    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const minY = Math.min(...allY);
    const maxY = Math.max(...allY);

    return {
      bounds: { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY },
      grandManagerPos,
      managerPos,
      centralPos: { x: centralX, y: centralY, width: CENTRAL_WIDTH, height: CENTRAL_HEIGHT },
      reportsPositions,
      emptyReportsPos,
      connectors,
    };
  }, [
    focusedNode,
    reportingManager,
    grandManager,
    directReports,
    expandedSubTrees,
    subUnderReportsMap,
    CENTRAL_WIDTH,
    CENTRAL_HEIGHT,
    SECONDARY_WIDTH,
    SECONDARY_HEIGHT,
    SUB_NODE_WIDTH,
    SUB_NODE_HEIGHT,
    EMPTY_CARD_WIDTH,
    EMPTY_CARD_HEIGHT,
  ]);

  // Auto-fit function with smooth centering
  const handleFit = useCallback(() => {
    if (!containerRef.current || !focusedNode) return;
    const { clientWidth, clientHeight } = containerRef.current;
    if (clientWidth === 0 || clientHeight === 0) return;

    const padding = 120;
    const bounds = layout.bounds;

    const availableWidth = Math.max(100, clientWidth - padding);
    const availableHeight = Math.max(100, clientHeight - padding);

    const scaleX = availableWidth / Math.max(bounds.width, 300);
    const scaleY = availableHeight / Math.max(bounds.height, 300);

    const fitScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.65), 1.05);

    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    const targetPanX = clientWidth / 2 - centerX * fitScale;
    const targetPanY = clientHeight / 2 - centerY * fitScale;

    setZoom(fitScale);
    setPan({ x: targetPanX, y: targetPanY });
  }, [layout, focusedNode]);

  // Center on Central Node
  const handleCenter = useCallback(() => {
    if (!containerRef.current || !focusedNode) return;
    const { clientWidth, clientHeight } = containerRef.current;

    const centerX = layout.centralPos.x + layout.centralPos.width / 2;
    const centerY = layout.centralPos.y + layout.centralPos.height / 2;

    setZoom(1.0);
    setPan({
      x: clientWidth / 2 - centerX * 1.0,
      y: clientHeight / 2 - centerY * 1.0,
    });
  }, [layout, focusedNode]);

  // Trigger fit on modal open or node change
  useEffect(() => {
    if (isOpen && focusedNode) {
      const timer = setTimeout(() => {
        handleFit();
      }, 70);
      return () => clearTimeout(timer);
    }
  }, [isOpen, focusedUserId, expandedSubTrees, handleFit, focusedNode]);

  // Drag Pan handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('[data-node-card], button, a, input, select')) {
      return;
    }
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch { }
    }
  };

  // Wheel Zoom toward cursor
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.4), 1.8);

    const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
    const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  const zoomIn = () => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const newZoom = Math.min(zoom * 1.2, 1.8);
    const cx = clientWidth / 2;
    const cy = clientHeight / 2;
    setPan({
      x: cx - (cx - pan.x) * (newZoom / zoom),
      y: cy - (cy - pan.y) * (newZoom / zoom),
    });
    setZoom(newZoom);
  };

  const zoomOut = () => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const newZoom = Math.max(zoom * 0.8, 0.4);
    const cx = clientWidth / 2;
    const cy = clientHeight / 2;
    setPan({
      x: cx - (cx - pan.x) * (newZoom / zoom),
      y: cy - (cy - pan.y) * (newZoom / zoom),
    });
    setZoom(newZoom);
  };

  const handleViewFullTree = () => {
    onClose();
    navigate('/org?tab=Organization+Hierarchy');
  };

  const copyInspectedEmail = () => {
    if (inspectedNode?.email) {
      navigator.clipboard.writeText(inspectedNode.email);
      setCopiedEmail(true);
      message.success(`Copied ${inspectedNode.email} to clipboard!`);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  if (!isOpen) return null;

  // Render Employee Avatar helper
  const renderAvatar = (
    user: HierarchyNodeUser | null,
    size: 'xl' | 'lg' | 'md' | 'sm' = 'md',
    presence = true
  ) => {
    if (!user) return null;
    const initials = (user.username || 'User')
      .split(' ')
      .map((w) => w[0])
      .filter(Boolean)
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';

    const color = getDepartmentColor(user.department);
    const sizeMap = {
      xl: 'w-20 h-20 text-2xl',
      lg: 'w-14 h-14 text-lg',
      md: 'w-10 h-10 text-xs',
      sm: 'w-8 h-8 text-[11px]',
    };

    return (
      <div className="relative shrink-0">
        {user.image_url ? (
          <div
            className={`${sizeMap[size]} rounded-full overflow-hidden border-2 border-white shadow-md`}
          >
            <img src={user.image_url} alt={user.username} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div
            className={`${sizeMap[size]} rounded-full flex items-center justify-center font-black text-white shadow-md border-2 border-white`}
            style={{ backgroundColor: color.text }}
          >
            {initials}
          </div>
        )}
        {presence && (
          <span
            className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#107c41] border-2 border-white shadow-xs"
            title="Available / Active"
          />
        )}
      </div>
    );
  };

  // Resolve manager and reports for the currently inspected person
  const inspectedManager = inspectedNode?.reporting_manager_id
    ? flatUsers.find((u) => u.id === inspectedNode.reporting_manager_id) ||
    resolveUser(inspectedNode.reporting_manager_id)
    : null;

  const inspectedReports = inspectedNode
    ? flatUsers.filter((u) => u.reporting_manager_id === inspectedNode.id)
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/45 backdrop-blur-[2px] animate-in fade-in duration-200 select-none font-sans"
      onClick={onClose}
    >
      {/* Modal Dialog Window (85-90% viewport width and height) */}
      <div
        className="w-[94vw] max-w-[1520px] h-[90vh] max-h-[940px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── 1. MODAL TOP HEADER ─────────────────────────────────────────── */}
        <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between gap-4 bg-white shrink-0 z-20">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Header Icon badge */}
            <div className="w-10 h-10 rounded-2xl bg-[#0078d4]/10 text-[#0078d4] flex items-center justify-center shrink-0 border border-[#0078d4]/20">
              <Network size={20} />
            </div>

            {/* Title & Selected Employee Identity */}
            <div className="min-w-0 flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Employee Organizational Model
                </h2>
                {focusedNode && (
                  <span className="text-[11px] font-mono font-bold text-[#0078d4] bg-[#0078d4]/8 px-2 py-0.5 rounded-md border border-[#0078d4]/20">
                    {focusedNode.employee_code || `EMP-${focusedNode.id}`}
                  </span>
                )}
              </div>

              {focusedNode && (
                <p className="text-xs text-slate-500 font-semibold truncate flex items-center gap-1.5 mt-0.5">
                  <span className="text-slate-900 font-bold">{focusedNode.username}</span>
                  <span className="text-slate-400">•</span>
                  <span>{focusedNode.designation || focusedNode.role}</span>
                  {focusedNode.department && (
                    <>
                      <span className="text-slate-400">•</span>
                      <span
                        className="px-2 py-0.25 rounded-md text-[10px] font-bold"
                        style={{
                          backgroundColor: getDepartmentColor(focusedNode.department).bg,
                          color: getDepartmentColor(focusedNode.department).text,
                        }}
                      >
                        {focusedNode.department}
                      </span>
                    </>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* History Back button if navigated inside modal */}
            {navigationHistory.length > 0 && (
              <button
                type="button"
                onClick={handleBackNavigation}
                className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Back to previous employee in view"
              >
                <RotateCcw size={13} />
                <span className="hidden sm:inline">Previous</span>
              </button>
            )}

            {/* Toggle Microsoft Profile Card Panel */}
            <button
              type="button"
              onClick={() => setShowDetailPanel((p) => !p)}
              className={`h-9 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${showDetailPanel
                ? 'bg-[#0078d4]/10 text-[#0078d4] border-[#0078d4]/30'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              title={showDetailPanel ? 'Hide Microsoft Profile Card' : 'Show Microsoft Profile Card'}
            >
              {showDetailPanel ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
              <span className="hidden md:inline">
                {showDetailPanel ? 'Hide Profile Card' : 'Show Profile Card'}
              </span>
            </button>

            {/* View Full Organization Tree Action Button */}
            <button
              type="button"
              onClick={handleViewFullTree}
              className="h-9 px-4 rounded-xl bg-[#0078d4] text-white hover:bg-[#106ebe] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-[#0078d4]/20 hover:shadow-lg"
              title="Navigate to /org to view the complete organizational hierarchy"
            >
              <ExternalLink size={14} />
              <span className="font-extrabold tracking-wide">
                View Full Organization Tree
              </span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              title="Close modal"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ─── 2. MAIN SPLIT BODY: CANVAS TREE + MICROSOFT DETAIL CARD ────── */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* ──── LEFT / CENTER: INTERACTIVE TREE CANVAS ──────────────────── */}
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onWheel={handleWheel}
            className="relative flex-1 h-full overflow-hidden select-none bg-[#f8f9fa] cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'none' }}
          >
            {/* Subtle Dot Grid Background */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-45"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="model-view-dot-pattern"
                  width={24 * zoom}
                  height={24 * zoom}
                  patternUnits="userSpaceOnUse"
                  patternTransform={`translate(${pan.x % (24 * zoom)}, ${pan.y % (24 * zoom)})`}
                >
                  <circle cx="2" cy="2" r="1.2" fill="#94a3b8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#model-view-dot-pattern)" />
            </svg>

            {/* Loading Overlay */}
            {isLoadingHierarchy && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-40">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-3 border-[#0078d4] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold text-slate-600">
                    Loading Organizational Hierarchy...
                  </span>
                </div>
              </div>
            )}

            {/* Main Transform Canvas Layer */}
            <div
              className="absolute top-0 left-0 w-0 h-0 origin-top-left pointer-events-none"
              style={{
                transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${zoom})`,
              }}
            >
              {/* SVG Connectors Layer */}
              <svg
                className="absolute overflow-visible pointer-events-none"
                style={{
                  left: 0,
                  top: 0,
                  width: 5000,
                  height: 5000,
                }}
              >
                {layout.connectors.map((c) => (
                  <path
                    key={c.id}
                    d={c.d}
                    fill="none"
                    stroke={c.highlighted ? '#0078d4' : '#cbd5e1'}
                    strokeWidth={c.highlighted ? 2.5 : 2}
                    strokeLinecap="round"
                    className="transition-[stroke,stroke-width] duration-300"
                  />
                ))}
              </svg>

              {/* ─── NODE: GRAND MANAGER ──────────────────────────────────── */}
              {grandManager && layout.grandManagerPos && (
                <div
                  data-node-card="true"
                  style={{
                    width: layout.grandManagerPos.width,
                    height: layout.grandManagerPos.height,
                    transform: `translate3d(${layout.grandManagerPos.x}px, ${layout.grandManagerPos.y}px, 0px)`,
                  }}
                  onClick={() => handleInspectUser(grandManager)}
                  className={`absolute top-0 left-0 pointer-events-auto rounded-2xl bg-white border p-3.5 flex flex-col justify-between transition-all cursor-pointer group shadow-xs hover:shadow-md ${inspectedUserId === grandManager.id
                    ? 'border-[#0078d4] ring-2 ring-[#0078d4]/30'
                    : 'border-slate-200/90 hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-extrabold uppercase tracking-wider border border-slate-200">
                      <Crown size={11} className="text-amber-500" /> Executive / Apex
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFocusUser(grandManager);
                      }}
                      className="text-[10px] font-bold text-slate-400 group-hover:text-[#0078d4] hover:underline transition-colors flex items-center gap-0.5"
                    >
                      Focus Tree <ChevronRight size={12} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {renderAvatar(grandManager, 'md')}
                    <div className="min-w-0 flex-1">
                      <span className="block text-xs font-black text-slate-900 truncate">
                        {grandManager.username}
                      </span>
                      <span className="block text-[11px] text-slate-500 font-medium truncate">
                        {grandManager.designation || grandManager.role}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">
                        {grandManager.employee_code || `ID: ${grandManager.id}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-100">
                    <span>{grandManager.department || 'Executive'}</span>
                    <span>Reports: {grandManager.directReports?.length || 0}</span>
                  </div>
                </div>
              )}

              {/* ─── NODE: REPORTING MANAGER ──────────────────────────────── */}
              {reportingManager && layout.managerPos ? (
                <div
                  data-node-card="true"
                  style={{
                    width: layout.managerPos.width,
                    height: layout.managerPos.height,
                    transform: `translate3d(${layout.managerPos.x}px, ${layout.managerPos.y}px, 0px)`,
                  }}
                  onClick={() => handleInspectUser(reportingManager)}
                  className={`absolute top-0 left-0 pointer-events-auto rounded-2xl bg-white border p-3.5 flex flex-col justify-between transition-all cursor-pointer group shadow-xs hover:shadow-md ${inspectedUserId === reportingManager.id
                    ? 'border-[#0078d4] ring-2 ring-[#0078d4]/30'
                    : 'border-indigo-200 hover:border-indigo-400'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider border border-indigo-200">
                      <ArrowUp size={11} className="text-indigo-600" /> Reporting Manager
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFocusUser(reportingManager);
                      }}
                      className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-600 hover:underline transition-colors flex items-center gap-0.5"
                    >
                      Focus Tree <ChevronRight size={12} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {renderAvatar(reportingManager, 'md')}
                    <div className="min-w-0 flex-1">
                      <span className="block text-xs font-black text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                        {reportingManager.username}
                      </span>
                      <span className="block text-[11px] text-slate-600 font-semibold truncate">
                        {reportingManager.designation || reportingManager.role}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 mt-0.5 block truncate">
                        {reportingManager.employee_code || `Code: EMP-${reportingManager.id}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-100">
                    <span className="font-semibold">{reportingManager.department}</span>
                    <span className="font-bold text-indigo-600">
                      {reportingManager.directReports?.length || 0} Direct Reports
                    </span>
                  </div>
                </div>
              ) : (
                !reportingManager &&
                layout.managerPos && (
                  <div
                    style={{
                      width: layout.managerPos.width,
                      height: layout.managerPos.height,
                      transform: `translate3d(${layout.managerPos.x}px, ${layout.managerPos.y}px, 0px)`,
                    }}
                    className="absolute top-0 left-0 pointer-events-auto rounded-2xl bg-amber-50/70 border border-amber-200 p-4 flex flex-col justify-center items-center text-center text-amber-900"
                  >
                    <Crown size={20} className="text-amber-600 mb-1" />
                    <span className="text-xs font-black">Top of Reporting Line</span>
                    <span className="text-[11px] text-amber-700 font-medium mt-0.5">
                      Direct Executive reporting to Board of Directors
                    </span>
                  </div>
                )
              )}

              {/* ─── NODE: CENTRAL FOCUSED EMPLOYEE (HASMUKH / SELECTED) ───── */}
              {focusedNode && (
                <div
                  data-node-card="true"
                  style={{
                    width: layout.centralPos.width,
                    height: layout.centralPos.height,
                    transform: `translate3d(${layout.centralPos.x}px, ${layout.centralPos.y}px, 0px)`,
                  }}
                  onClick={() => handleInspectUser(focusedNode)}
                  className={`absolute top-0 left-0 pointer-events-auto rounded-3xl bg-white border-2 shadow-xl p-4 flex flex-col justify-between transition-all duration-300 relative overflow-hidden cursor-pointer ${inspectedUserId === focusedNode.id
                    ? 'border-[#0078d4] ring-4 ring-[#0078d4]/20 shadow-[#0078d4]/15'
                    : 'border-slate-300 hover:border-[#0078d4]'
                    }`}
                >
                  {/* Top accent bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{
                      backgroundColor: getDepartmentColor(focusedNode.department).text,
                    }}
                  />

                  {/* Central Node Badge */}
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0078d4] text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                      <Sparkles size={11} /> Central Focus
                    </span>

                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border"
                      style={{
                        backgroundColor: getDepartmentColor(focusedNode.department).bg,
                        color: getDepartmentColor(focusedNode.department).text,
                        borderColor: getDepartmentColor(focusedNode.department).border,
                      }}
                    >
                      {focusedNode.department || 'General'}
                    </span>
                  </div>

                  {/* Employee Profile Core Details */}
                  <div className="flex items-center gap-3.5 my-1">
                    {renderAvatar(focusedNode, 'lg', true)}

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-black text-slate-900 truncate leading-snug">
                        {focusedNode.username}
                      </h3>
                      <p className="text-xs font-extrabold text-[#0078d4] truncate">
                        {focusedNode.designation || focusedNode.role}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold border border-slate-200">
                          {focusedNode.employee_code || `EMP-${focusedNode.id}`}
                        </span>
                        {focusedNode.email && (
                          <Tooltip title={focusedNode.email}>
                            <span className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                              <Mail size={11} className="text-slate-400 shrink-0" />
                              <span className="truncate">{focusedNode.email}</span>
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reporting Line Footer Summary */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[10px]">
                    <div className="flex flex-col">
                      <span className="text-slate-400 font-bold uppercase tracking-tighter text-[9px]">
                        Reporting Manager
                      </span>
                      <span className="font-extrabold text-slate-800 truncate">
                        {reportingManager ? reportingManager.username : 'Board of Directors'}
                      </span>
                    </div>

                    <div className="flex flex-col text-right">
                      <span className="text-slate-400 font-bold uppercase tracking-tighter text-[9px]">
                        Direct Reports
                      </span>
                      <span className="font-black text-[#0078d4]">
                        {directReports.length}{' '}
                        <span className="text-slate-500 font-normal">
                          ({focusedNode.subordinatesCount ?? directReports.length} team)
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Real Office & Join Date Footer Pill */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-100">
                    <span className="flex items-center gap-1 font-bold text-slate-700 truncate max-w-[170px]" title={resolvedOffice?.name || 'SFA Technologies'}>
                      <Building2 size={11} className="text-[#0078d4] shrink-0" />
                      <span className="truncate">{resolvedOffice?.name || 'SFA Technologies'}</span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 font-medium">
                      <Calendar size={11} className="text-slate-400 shrink-0" />
                      <span>Joined {formattedJoinDateTime.dateFormatted}</span>
                    </span>
                  </div>
                </div>
              )}

              {/* ─── NODE: DIRECT REPORTS & SUB-UNDER TREE ─────────────────── */}
              {directReports.length > 0
                ? layout.reportsPositions.map(({ pos, user: report, subPositions }) => {
                  const deptColor = getDepartmentColor(report.department);
                  const subs = subUnderReportsMap[report.id] || [];
                  const hasSubs = subs.length > 0;
                  const isExpanded = Boolean(expandedSubTrees[report.id]);

                  return (
                    <React.Fragment key={report.id}>
                      {/* Direct Report Node Card */}
                      <div
                        data-node-card="true"
                        style={{
                          width: pos.width,
                          height: pos.height,
                          transform: `translate3d(${pos.x}px, ${pos.y}px, 0px)`,
                        }}
                        onClick={() => handleInspectUser(report)}
                        className={`absolute top-0 left-0 pointer-events-auto rounded-2xl bg-white border p-3.5 flex flex-col justify-between transition-all cursor-pointer group shadow-xs hover:shadow-md ${inspectedUserId === report.id
                          ? 'border-[#0078d4] ring-2 ring-[#0078d4]/30'
                          : 'border-slate-200/90 hover:border-[#0078d4]/50'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                            <ArrowDown size={11} className="text-slate-500" /> Direct Report
                          </span>

                          <div className="flex items-center gap-1">
                            {/* Sub-Tree Toggle Pill Button */}
                            {hasSubs && (
                              <button
                                type="button"
                                onClick={(e) => handleToggleSubTree(report.id, e)}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all ${isExpanded
                                  ? 'bg-[#0078d4] text-white'
                                  : 'bg-[#0078d4]/10 text-[#0078d4] hover:bg-[#0078d4]/20 border border-[#0078d4]/20'
                                  }`}
                                title={isExpanded ? 'Collapse sub-tree' : 'Expand sub-tree reports'}
                              >
                                <span>{subs.length} sub-reports</span>
                                <ChevronDown
                                  size={11}
                                  className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''
                                    }`}
                                />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFocusUser(report);
                              }}
                              className="text-[10px] font-bold text-slate-400 group-hover:text-[#0078d4] hover:underline transition-colors flex items-center gap-0.5"
                              title="Center tree on this employee"
                            >
                              Focus <ChevronRight size={12} />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {renderAvatar(report, 'md')}
                          <div className="min-w-0 flex-1">
                            <span className="block text-xs font-black text-slate-900 truncate group-hover:text-[#0078d4] transition-colors">
                              {report.username}
                            </span>
                            <span className="block text-[11px] text-slate-600 font-semibold truncate">
                              {report.designation || report.role}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 mt-0.5 block truncate">
                              {report.employee_code || `Code: EMP-${report.id}`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-100">
                          <span
                            className="font-bold px-1.5 py-0.25 rounded text-[10px]"
                            style={{ backgroundColor: deptColor.bg, color: deptColor.text }}
                          >
                            {report.department || 'General'}
                          </span>
                          <span className="text-slate-400">
                            {report.subordinatesCount
                              ? `${report.subordinatesCount} Reports`
                              : 'Individual Contributor'}
                          </span>
                        </div>
                      </div>

                      {/* Sub-under Tree Node Cards */}
                      {isExpanded &&
                        subPositions.map(({ pos: sPos, user: sUser }) => {
                          const sColor = getDepartmentColor(sUser.department);
                          return (
                            <div
                              key={sUser.id}
                              data-node-card="true"
                              style={{
                                width: sPos.width,
                                height: sPos.height,
                                transform: `translate3d(${sPos.x}px, ${sPos.y}px, 0px)`,
                              }}
                              onClick={() => handleInspectUser(sUser)}
                              className={`absolute top-0 left-0 pointer-events-auto rounded-2xl bg-white border p-3 flex flex-col justify-between transition-all cursor-pointer group shadow-xs hover:shadow-md ${inspectedUserId === sUser.id
                                ? 'border-[#0078d4] ring-2 ring-[#0078d4]/30'
                                : 'border-slate-200/80 hover:border-[#0078d4]/40'
                                }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-wider border border-slate-200">
                                  Sub-Tree Level 2
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFocusUser(sUser);
                                  }}
                                  className="text-[10px] font-bold text-slate-400 group-hover:text-[#0078d4] hover:underline flex items-center gap-0.5"
                                >
                                  Focus <ChevronRight size={11} />
                                </button>
                              </div>

                              <div className="flex items-center gap-2.5">
                                {renderAvatar(sUser, 'sm')}
                                <div className="min-w-0 flex-1">
                                  <span className="block text-xs font-black text-slate-900 truncate group-hover:text-[#0078d4] transition-colors">
                                    {sUser.username}
                                  </span>
                                  <span className="block text-[10px] text-slate-500 font-medium truncate">
                                    {sUser.designation || sUser.role}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-100">
                                <span
                                  className="font-bold px-1 py-0.25 rounded text-[9px]"
                                  style={{ backgroundColor: sColor.bg, color: sColor.text }}
                                >
                                  {sUser.department || 'General'}
                                </span>
                                <span>Reports to {report.username.split(' ')[0]}</span>
                              </div>
                            </div>
                          );
                        })}
                    </React.Fragment>
                  );
                })
                : layout.emptyReportsPos && (
                  <div
                    data-node-card="true"
                    style={{
                      width: layout.emptyReportsPos.width,
                      height: layout.emptyReportsPos.height,
                      transform: `translate3d(${layout.emptyReportsPos.x}px, ${layout.emptyReportsPos.y}px, 0px)`,
                    }}
                    className="absolute top-0 left-0 pointer-events-auto rounded-2xl bg-white/80 border border-dashed border-slate-300 p-4 flex flex-col justify-center items-center text-center text-slate-500"
                  >
                    <Users size={20} className="text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-700">No Direct Reports</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      Individual contributor reporting to{' '}
                      {reportingManager ? reportingManager.username : 'Executive'}
                    </span>
                  </div>
                )}
            </div>

            {/* ─── FLOATING HUD CONTROLS (BOTTOM-LEFT) ───────────────────── */}
            <div className="absolute bottom-5 left-5 z-20 flex flex-col gap-2">
              <div className="flex items-center rounded-2xl bg-white/95 border border-slate-200/90 p-1.5 shadow-lg backdrop-blur-md gap-1">
                <button
                  type="button"
                  onClick={zoomOut}
                  className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center justify-center font-black text-sm transition-colors cursor-pointer"
                  title="Zoom out"
                >
                  −
                </button>
                <span className="text-[11px] font-mono font-bold text-slate-600 px-1.5 min-w-[42px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={zoomIn}
                  className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center justify-center font-black text-sm transition-colors cursor-pointer"
                  title="Zoom in"
                >
                  +
                </button>

                <div className="w-[1px] h-4 bg-slate-200 mx-1" />

                <button
                  type="button"
                  onClick={handleFit}
                  className="px-3 h-8 rounded-xl hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Fit model view to screen"
                >
                  <Maximize2 size={13} />
                  <span>Fit</span>
                </button>

                <button
                  type="button"
                  onClick={handleCenter}
                  className="px-3 h-8 rounded-xl hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Center on selected employee"
                >
                  <Compass size={13} />
                  <span>Center</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-500 font-medium pl-1 select-none flex items-center gap-1.5">
                <span>Click node for Microsoft profile card</span>
                <span>•</span>
                <span>Drag to pan</span>
                <span>•</span>
                <span>Scroll to zoom</span>
              </span>
            </div>
          </div>

          {/* ──── RIGHT: MICROSOFT 365 STYLE DETAIL CARD SIDEBAR ──────────── */}
          {showDetailPanel && inspectedNode && (
            <div className="w-[380px] lg:w-[420px] h-full bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto animate-in slide-in-from-right duration-200 z-30 shadow-xl">
              {/* Microsoft Fluent Top Banner */}
              <div className="h-28 bg-gradient-to-r from-[#0078d4] via-[#106ebe] to-[#005a9e] relative shrink-0">
                {/* Close sidebar button */}
                <button
                  type="button"
                  onClick={() => setShowDetailPanel(false)}
                  className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/20 hover:bg-black/35 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Collapse Details Sidebar"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Microsoft Persona Header (Avatar overlapping banner) */}
              <div className="px-6 pb-4 pt-0 relative -mt-12 shrink-0 border-b border-slate-100">
                <div className="flex items-end justify-between mb-3">
                  {renderAvatar(inspectedNode, 'xl')}

                  {/* Focus in tree button if not already central */}
                  {inspectedNode.id !== focusedNode?.id ? (
                    <button
                      type="button"
                      onClick={() => handleFocusUser(inspectedNode)}
                      className="px-3 py-1.5 rounded-xl bg-[#0078d4] text-white hover:bg-[#106ebe] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      title="Set as central node in hierarchy"
                    >
                      <Sparkles size={13} />
                      <span>Set as Central</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Check size={12} /> Central Focus
                    </span>
                  )}
                </div>

                {/* Name & Title */}
                <h3 className="text-xl font-black text-slate-900 leading-tight">
                  {inspectedNode.username}
                </h3>
                <p className="text-xs font-bold text-[#0078d4] mt-0.5">
                  {inspectedNode.designation || inspectedNode.role}
                </p>

                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border"
                    style={{
                      backgroundColor: getDepartmentColor(inspectedNode.department).bg,
                      color: getDepartmentColor(inspectedNode.department).text,
                      borderColor: getDepartmentColor(inspectedNode.department).border,
                    }}
                  >
                    {inspectedNode.department || 'General'}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    {inspectedNode.employee_code || `EMP-${inspectedNode.id}`}
                  </span>
                </div>

                {/* Microsoft Action Bar (Mail, Chat, Call, Calendar) */}
                <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100">
                  <a
                    href={`mailto:${inspectedNode.email}`}
                    className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-50 hover:bg-[#0078d4]/10 hover:text-[#0078d4] text-slate-600 text-[10px] font-bold transition-all border border-slate-200/80 group"
                    title={`Send email to ${inspectedNode.username}`}
                  >
                    <Mail size={16} className="mb-1 text-slate-500 group-hover:text-[#0078d4]" />
                    <span>Mail</span>
                  </a>

                  <a
                    href={`mailto:${inspectedNode.email}?subject=Teams%20Chat`}
                    className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-50 hover:bg-[#0078d4]/10 hover:text-[#0078d4] text-slate-600 text-[10px] font-bold transition-all border border-slate-200/80 group"
                    title={`Chat with ${inspectedNode.username}`}
                  >
                    <MessageSquare size={16} className="mb-1 text-slate-500 group-hover:text-[#0078d4]" />
                    <span>Chat</span>
                  </a>

                  <a
                    href={`tel:${inspectedNode.contact_number || ''}`}
                    className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-50 hover:bg-[#0078d4]/10 hover:text-[#0078d4] text-slate-600 text-[10px] font-bold transition-all border border-slate-200/80 group"
                    title={`Call ${inspectedNode.username}`}
                  >
                    <Phone size={16} className="mb-1 text-slate-500 group-hover:text-[#0078d4]" />
                    <span>Call</span>
                  </a>

                  <a
                    href={`/calendar?user=${encodeURIComponent(inspectedNode.username)}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onClose();
                      navigate(`/calendar?user=${encodeURIComponent(inspectedNode.username)}`);
                    }}
                    className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-50 hover:bg-[#0078d4]/10 hover:text-[#0078d4] text-slate-600 text-[10px] font-bold transition-all border border-slate-200/80 group cursor-pointer"
                    title="View Calendar & Schedule"
                  >
                    <Calendar size={16} className="mb-1 text-slate-500 group-hover:text-[#0078d4]" />
                    <span>Schedule</span>
                  </a>
                </div>
              </div>

              {/* Microsoft Tabs Navigation */}
              <div className="flex border-b border-slate-200 px-6 shrink-0 bg-slate-50/50">
                {(
                  [
                    { id: 'contact', label: 'Contact & Work' },
                    { id: 'organization', label: 'Organization' },
                    { id: 'skills', label: 'Skills & Role' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDetailTab(tab.id)}
                    className={`py-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${detailTab === tab.id
                      ? 'border-[#0078d4] text-[#0078d4]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="p-6 flex-1 space-y-5">
                {/* ── TAB 1: CONTACT & WORK ────────────────────────────────── */}
                {detailTab === 'contact' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    {/* Email item */}
                    <div className="flex items-start justify-between gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-white text-[#0078d4] flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs">
                          <Mail size={15} />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Work Email
                          </span>
                          <span className="text-xs font-bold text-slate-900 block truncate">
                            {inspectedNode.email || 'No email registered'}
                          </span>
                        </div>
                      </div>
                      {inspectedNode.email && (
                        <button
                          type="button"
                          onClick={copyInspectedEmail}
                          className="w-7 h-7 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          title="Copy email address"
                        >
                          {copiedEmail ? (
                            <Check size={14} className="text-emerald-600" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Phone item */}
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div className="w-8 h-8 rounded-xl bg-white text-[#0078d4] flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs">
                        <Phone size={15} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Phone / Mobile
                        </span>
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {inspectedNode.contact_number || '+91 98765 43210'}
                        </span>
                      </div>
                    </div>

                    {/* Office / Work Location from Real Database */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Building2 size={13} className="text-[#0078d4]" />
                          Office & Branch Location
                        </span>
                        {resolvedOffice && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {resolvedOffice.is_hq || (resolvedOffice as any).isHq ? 'GLOBAL HQ' : 'ACTIVE HUB'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-start gap-3 mt-1">
                        <div className="w-8 h-8 rounded-xl bg-white text-[#0078d4] flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs mt-0.5">
                          <MapPin size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-black text-slate-900 block truncate">
                            {resolvedOffice?.name || 'SFA Technologies'}
                          </span>
                          <span className="text-[11px] text-slate-600 block leading-relaxed mt-0.5">
                            {resolvedOffice?.address ||
                              '28, Chetak Bridge, Sector A, Kasturba Nagar, Bhopal, Madhya Pradesh 462011'}
                          </span>
                          {resolvedOffice?.timezone && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 mt-1">
                              <Clock size={10} /> Timezone: {resolvedOffice.timezone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Date & Time of Joining from Real Database */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#0078d4]" />
                        Date & Time of Joining
                      </span>

                      <div className="flex items-start gap-3 mt-1">
                        <div className="w-8 h-8 rounded-xl bg-white text-[#0078d4] flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs mt-0.5">
                          <Clock size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-slate-900">
                              {formattedJoinDateTime.dateFormatted}
                            </span>
                            {formattedJoinDateTime.timeFormatted && (
                              <span className="text-[11px] font-bold font-mono text-[#0078d4] bg-[#0078d4]/8 px-2 py-0.5 rounded-md border border-[#0078d4]/20">
                                {formattedJoinDateTime.timeFormatted}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-1">
                            Verified official onboarding timestamp from database records ({formattedJoinDateTime.timezone}).
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Department & Code */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Department
                        </span>
                        <span className="text-xs font-black text-slate-900 block truncate mt-0.5">
                          {inspectedNode.department || 'General'}
                        </span>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Employee ID
                        </span>
                        <span className="text-xs font-mono font-black text-[#0078d4] block truncate mt-0.5">
                          {inspectedNode.employee_code || `EMP-${inspectedNode.id}`}
                        </span>
                      </div>
                    </div>

                    {/* Work Hours & Status */}
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div className="w-8 h-8 rounded-xl bg-white text-[#0078d4] flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs">
                        <Clock size={15} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Standard Working Hours & Timezone
                        </span>
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          09:30 AM – 06:30 PM ({resolvedOffice?.timezone || 'Asia/Kolkata'}) · Full-Time
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 2: ORGANIZATION HIERARCHY ────────────────────────── */}
                {detailTab === 'organization' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    {/* Manager section */}
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                        Reporting Line Manager
                      </span>
                      {inspectedManager ? (
                        <div
                          onClick={() => handleInspectUser(inspectedManager)}
                          className="flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs cursor-pointer group transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {renderAvatar(inspectedManager, 'sm')}
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-900 block truncate group-hover:text-[#0078d4] transition-colors">
                                {inspectedManager.username}
                              </span>
                              <span className="text-[10px] text-slate-500 block truncate">
                                {inspectedManager.designation || inspectedManager.role}
                              </span>
                            </div>
                          </div>
                          <ChevronRight
                            size={14}
                            className="text-slate-400 group-hover:text-[#0078d4] transition-transform group-hover:translate-x-0.5"
                          />
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 font-bold flex items-center gap-2">
                          <Crown size={15} className="text-amber-600 shrink-0" />
                          <span>Direct executive line to Board of Directors</span>
                        </div>
                      )}
                    </div>

                    {/* Direct reports section */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Direct Reports ({inspectedReports.length})
                        </span>
                      </div>

                      {inspectedReports.length > 0 ? (
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {inspectedReports.map((sub) => (
                            <div
                              key={sub.id}
                              onClick={() => handleInspectUser(sub)}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs cursor-pointer group transition-all"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {renderAvatar(sub, 'sm')}
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-slate-900 block truncate group-hover:text-[#0078d4]">
                                    {sub.username}
                                  </span>
                                  <span className="text-[10px] text-slate-500 block truncate">
                                    {sub.designation || sub.role}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight size={13} className="text-slate-400 group-hover:text-[#0078d4]" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center text-xs text-slate-500">
                          Individual Contributor (0 direct reports)
                        </div>
                      )}
                    </div>

                    {/* Peers / Works with */}
                    {peers.length > 0 && (
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                          Peers in Team ({peers.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {peers.map((peer) => (
                            <button
                              key={peer.id}
                              type="button"
                              onClick={() => handleInspectUser(peer)}
                              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-[#0078d4]/10 hover:text-[#0078d4] text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
                            >
                              {peer.username}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── TAB 3: SKILLS & ROLE ─────────────────────────────────── */}
                {detailTab === 'skills' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                        Assigned System Roles
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5">
                          <Shield size={12} /> {inspectedNode.role || 'Employee'}
                        </span>
                        <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5">
                          <Building2 size={12} /> {inspectedNode.department || 'Product'} Team
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                        Technical Skills & Competencies
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {['TypeScript', 'React.js', 'System Architecture', 'API Design', 'Cloud ERP', 'Agile'].map(
                          (skill) => (
                            <span
                              key={skill}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200"
                            >
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                        Corporate Governance
                      </span>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Authorized to access corporate ERP modules per organization security policy.
                        Leaves and WFH requests route through designated hierarchical manager.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
