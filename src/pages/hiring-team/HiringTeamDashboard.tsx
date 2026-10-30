import { useState, useMemo, useEffect } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Tabs } from '@/components/ui/primitives/Tabs';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  User,
  FileText,
  CreditCard,
  Briefcase,
  GraduationCap,
  Award,
  ExternalLink,
  RefreshCw,
  Send,
  Building,
  KeyRound,
  Eye,
  Camera,
  ListChecks,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Dialog } from '@/components/ui/composed/Dialog';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { useAuth } from '@/hooks/useAuth';
import {
  getEmployeeProfile,
  getAllEmployeeProfiles,
  syncProfilesFromBackend,
  approveProfile,
  requestProfileChanges,
  assignEmployeeId,
  getFormConfiguration,
  calculateCompletionPercentage,
  type ProfileCompletionData,
  type ProfileStatus,
  type FormSectionConfig,
} from '@/services/employeeProfileService';
import { Link } from 'react-router-dom';
import { useGetUsersQuery, useUpdateStaffMutation } from '@/store/api/userSlice';

const AVAILABLE_ROLES = [
  'Employee',
  'Manager',
  'HrAdmin',
  'FinanceAdmin',
  'Admin',
  'Inventory operator',
  'SuperAdmin',
];

const AVAILABLE_DEPTS = [
  'Engineering',
  'Design',
  'Marketing',
  'Operations',
  'Sales',
  'HR',
  'Finance',
  'Product',
  'Customer Support',
  'Management',
];

const STATUS_MAP: Record<ProfileStatus, { label: string; color: string; bg: string; icon: any }> = {
  incomplete: {
    label: 'Incomplete',
    color: 'text-error',
    bg: 'bg-error/10 border-error/20 text-error',
    icon: AlertCircle,
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-warning',
    bg: 'bg-warning/10 border-warning/20 text-warning',
    icon: Clock,
  },
  submitted: {
    label: 'Pending Review',
    color: 'text-info',
    bg: 'bg-info/10 border-info/20 text-info',
    icon: Send,
  },
  changes_required: {
    label: 'Changes Required',
    color: 'text-warning',
    bg: 'bg-warning/10 border-warning/20 text-warning',
    icon: AlertCircle,
  },
  approved: {
    label: 'Approved',
    color: 'text-success',
    bg: 'bg-success/10 border-success/20 text-success',
    icon: CheckCircle2,
  },
  id_assigned: {
    label: 'ID Assigned',
    color: 'text-success',
    bg: 'bg-success/10 border-success/20 text-success',
    icon: ShieldCheck,
  },
};

// Section icon map
const SECTION_ICON_MAP: Record<string, any> = {
  personal: User,
  bank: CreditCard,
  identity: FileText,
  employment: Briefcase,
  education: GraduationCap,
  certifications: Award,
  profile_picture: Camera,
};

// Compact section completion badge
function SectionBadge({
  sectionId,
  sectionLabel,
  completed,
}: {
  sectionId: string;
  sectionLabel: string;
  completed: boolean;
}) {
  const Icon = SECTION_ICON_MAP[sectionId] || FileText;
  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold transition-all ${
        completed
          ? 'bg-success/10 border-success/25 text-success'
          : 'bg-surface-subtle border-border-subtle text-muted'
      }`}>
      <Icon size={11} />
      <span>{sectionLabel}</span>
      {completed ? <CheckCircle2 size={10} className="text-success" /> : <Clock size={10} />}
    </div>
  );
}

// Onboarding Progress Panel — shows each employee's section-by-section status
function OnboardingProgressPanel({
  profiles,
  formConfig,
}: {
  profiles: ProfileCompletionData[];
  formConfig: FormSectionConfig[];
}) {
  const [expanded, setExpanded] = useState<number | null>(null);

  const onboardingProfiles = profiles.filter(
    (p) =>
      p.status === 'in_progress' ||
      p.status === 'incomplete' ||
      p.status === 'submitted' ||
      p.status === 'changes_required'
  );

  if (onboardingProfiles.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-muted italic">
        No employees currently in the onboarding process.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {onboardingProfiles.map((profile) => {
        const pct = calculateCompletionPercentage(profile, formConfig);
        const isExpanded = expanded === profile.userId;
        const conf = STATUS_MAP[profile.status] || STATUS_MAP.incomplete;
        const Icon = conf.icon;
        const totalSections = formConfig.filter((s) => !s.hidden).length;
        const completedCount = formConfig.filter(
          (s) => !s.hidden && profile.completedSections?.[s.id]
        ).length;

        return (
          <div
            key={profile.userId}
            className="border border-border-subtle rounded-2xl overflow-hidden bg-white hover:shadow-sm transition-all">
            {/* Row header */}
            <button
              type="button"
              onClick={() => setExpanded(isExpanded ? null : profile.userId)}
              className="w-full flex items-center justify-between px-5 py-4 text-left group">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-primary/10 border border-border-subtle flex items-center justify-center shrink-0 overflow-hidden">
                  {profile.profilePictureUrl ? (
                    <img
                      src={profile.profilePictureUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={16} className="text-primary" />
                  )}
                </div>

                {/* Name + email */}
                <div className="min-w-0">
                  <div className="text-sm font-bold text-foreground truncate">
                    {profile.personal?.fullName || profile.userEmail}
                  </div>
                  <div className="text-[11px] text-muted truncate">{profile.userEmail}</div>
                </div>

                {/* Status badge */}
                <span
                  className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${conf.bg} shrink-0`}
                  style={{ lineHeight: '1' }}>
                  <Icon size={10} style={{ display: 'block', flexShrink: 0 }} />
                  <span>{conf.label}</span>
                </span>

                {/* Progress bar */}
                <div className="hidden lg:flex items-center gap-3 flex-1 max-w-xs">
                  <div className="flex-1 h-1.5 bg-surface-subtle rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct === 100 ? 'bg-success' : pct > 50 ? 'bg-primary' : 'bg-warning'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-foreground shrink-0">{pct}%</span>
                  <span className="text-[10px] text-muted shrink-0">
                    {completedCount}/{totalSections} sections
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className="text-[11px] text-muted hidden md:block">
                  Updated{' '}
                  {profile.lastSavedAt ? new Date(profile.lastSavedAt).toLocaleDateString() : '—'}
                </span>
                {isExpanded ? (
                  <ChevronUp
                    size={16}
                    className="text-muted group-hover:text-foreground transition-colors"
                  />
                ) : (
                  <ChevronDown
                    size={16}
                    className="text-muted group-hover:text-foreground transition-colors"
                  />
                )}
              </div>
            </button>

            {/* Expanded detail */}
            {isExpanded && (
              <div className="border-t border-border-subtle px-5 py-4 bg-surface-subtle/50 space-y-4">
                {/* Section completion grid */}
                <div>
                  <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ListChecks size={11} />
                    Section Completion Status
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formConfig
                      .filter((s) => !s.hidden)
                      .sort((a, b) => a.order - b.order)
                      .map((section) => (
                        <SectionBadge
                          key={section.id}
                          sectionId={section.id}
                          sectionLabel={section.label}
                          completed={!!profile.completedSections?.[section.id]}
                        />
                      ))}
                  </div>
                </div>

                {/* Quick data highlights */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-white border border-border-subtle">
                    <div className="text-[10px] font-bold text-muted uppercase mb-1">Full Name</div>
                    <div className="text-xs font-semibold text-foreground">
                      {profile.personal?.fullName || '—'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-border-subtle">
                    <div className="text-[10px] font-bold text-muted uppercase mb-1">Contact</div>
                    <div className="text-xs font-semibold text-foreground">
                      {profile.personal?.contactNumber || '—'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-border-subtle">
                    <div className="text-[10px] font-bold text-muted uppercase mb-1">Bank</div>
                    <div className="text-xs font-semibold text-foreground">
                      {profile.bank?.bankName || '—'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-border-subtle">
                    <div className="text-[10px] font-bold text-muted uppercase mb-1">Documents</div>
                    <div className="text-xs font-semibold text-foreground">
                      {profile.documents?.length
                        ? `${profile.documents.length} uploaded`
                        : 'None yet'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-border-subtle">
                    <div className="text-[10px] font-bold text-muted uppercase mb-1">PAN</div>
                    <div className="text-xs font-mono font-semibold text-foreground">
                      {profile.identity?.panNumber || '—'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-border-subtle">
                    <div className="text-[10px] font-bold text-muted uppercase mb-1">Aadhaar</div>
                    <div className="text-xs font-mono font-semibold text-foreground">
                      {profile.identity?.aadhaarNumber
                        ? `•••• ${profile.identity.aadhaarNumber.slice(-4)}`
                        : '—'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-border-subtle">
                    <div className="text-[10px] font-bold text-muted uppercase mb-1">
                      Employment Entries
                    </div>
                    <div className="text-xs font-semibold text-foreground">
                      {profile.employment?.length ? `${profile.employment.length} entries` : 'None'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-border-subtle">
                    <div className="text-[10px] font-bold text-muted uppercase mb-1">
                      Education Entries
                    </div>
                    <div className="text-xs font-semibold text-foreground">
                      {profile.education?.length ? `${profile.education.length} entries` : 'None'}
                    </div>
                  </div>
                </div>

                {/* Review notes if present */}
                {profile.reviewNotes && (
                  <div className="p-3 rounded-xl bg-warning/5 border border-warning/20">
                    <div className="text-[10px] font-bold text-warning uppercase mb-1">
                      Pending Revision Notes
                    </div>
                    <div className="text-xs text-foreground">{profile.reviewNotes}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function HiringTeamDashboard() {
  const { user, isSuperadmin } = useAuth();
  const {
    data: dbUsers = [],
    isLoading: isUsersLoading,
    refetch: refetchDbUsers,
  } = useGetUsersQuery();
  const [updateStaff] = useUpdateStaffMutation();
  const [profiles, setProfiles] = useState<ProfileCompletionData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [mainView, setMainView] = useState<'table' | 'onboarding'>('table');

  // Modals state
  const [selectedProfile, setSelectedProfile] = useState<ProfileCompletionData | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewTab, setReviewTab] = useState<
    'overview' | 'personal' | 'bank' | 'identity' | 'employment' | 'education' | 'certifications'
  >('overview');

  // Request changes modal state
  const [isChangesModalOpen, setIsChangesModalOpen] = useState(false);
  const [changesNotes, setChangesNotes] = useState('');
  const [targetUserId, setTargetUserId] = useState<number | null>(null);

  // Assign Employee Profile Details (ID, Role, Department, Designation) modal state
  const [isAssignIdModalOpen, setIsAssignIdModalOpen] = useState(false);
  const [empIdInput, setEmpIdInput] = useState('');
  const [roleInput, setRoleInput] = useState('Employee');
  const [departmentInput, setDepartmentInput] = useState('');
  const [designationInput, setDesignationInput] = useState('');
  const [assignError, setAssignError] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const formConfig = useMemo(() => getFormConfiguration(), []);

  // Sync DB users list to local storage for persistence & cross-component access
  useEffect(() => {
    if (dbUsers && dbUsers.length > 0) {
      try {
        localStorage.setItem('aether_staff_list', JSON.stringify(dbUsers));
      } catch {}
    }
  }, [dbUsers]);

  // Current user info
  const userRole = user?.role || (isSuperadmin ? 'SuperAdmin' : 'Employee');
  const userName = user?.username || (user as any)?.name || 'HR Admin';
  const userEmail = user?.email || '';
  const normalizedUserRole = (userRole || '').toLowerCase().replace(/[\s_-]/g, '');
  const canAssignId =
    isSuperadmin ||
    ['superadmin', 'admin', 'hradmin', 'hr', 'hiringmanager', 'hiringteam'].includes(
      normalizedUserRole
    ) ||
    ['SuperAdmin', 'Admin', 'HrAdmin'].includes(userRole);

  // Initial sync from backend database and periodic polling
  useEffect(() => {
    syncProfilesFromBackend();
    const interval = setInterval(() => {
      syncProfilesFromBackend();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (dbUsers && dbUsers.length > 0) {
      syncProfilesFromBackend();
    }
  }, [dbUsers]);

  // Listen to cross-module employee profile and invitation updates
  useEffect(() => {
    const handleUpdate = () => setRefreshTrigger((prev) => prev + 1);
    window.addEventListener('aether_employee_profiles_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('aether_employee_profiles_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Load profiles from local storage
  useEffect(() => {
    const list = getAllEmployeeProfiles();
    setProfiles(list);
  }, [refreshTrigger]);

  // Merge database users with onboarding profiles so ALL DB users appear with their form status
  const combinedProfiles = useMemo<ProfileCompletionData[]>(() => {
    const list: ProfileCompletionData[] = [];
    const seenEmails = new Set<string>();
    const seenUserIds = new Set<string>();

    // 1. Process all registered users from database (/users)
    for (const dbUser of dbUsers) {
      if (!dbUser.email && !dbUser.id) continue;
      const emailLower = (dbUser.email || '').toLowerCase().trim();
      const userIdStr = String(dbUser.id);
      if (emailLower) seenEmails.add(emailLower);
      seenUserIds.add(userIdStr);

      // Match with existing onboarding profile if available
      const existingProfile = profiles.find(
        (p) =>
          String(p.userId) === userIdStr ||
          (Boolean(emailLower) && p.userEmail?.toLowerCase().trim() === emailLower)
      );

      if (existingProfile) {
        list.push({
          ...existingProfile,
          userId: typeof dbUser.id === 'number' ? dbUser.id : existingProfile.userId || Date.now(),
          userEmail: emailLower || existingProfile.userEmail,
          employeeId:
            existingProfile.employeeId &&
            existingProfile.employeeId !== 'N/A' &&
            existingProfile.employeeId !== 'NA'
              ? existingProfile.employeeId
              : dbUser.employee_id || dbUser.employee_code || undefined,
          role: existingProfile.role || dbUser.role || 'Employee',
          department: existingProfile.department || dbUser.department || '',
          designation: existingProfile.designation || dbUser.designation || '',
          personal: {
            ...existingProfile.personal,
            fullName:
              existingProfile.personal?.fullName ||
              dbUser.name ||
              dbUser.username ||
              'Unnamed Employee',
            email: emailLower || existingProfile.personal?.email || '',
            contactNumber:
              existingProfile.personal?.contactNumber || dbUser.contact_no || dbUser.phone || '',
          },
        });
      } else {
        // User registered in DB but hasn't submitted onboarding yet
        list.push({
          userId: typeof dbUser.id === 'number' ? dbUser.id : Date.now(),
          userEmail: emailLower,
          status: 'incomplete',
          employeeId: dbUser.employee_id || dbUser.employee_code,
          role: dbUser.role || 'Employee',
          department: dbUser.department || '',
          designation: dbUser.designation || '',
          completedSections: {},
          lastSavedAt: dbUser.join_date || dbUser.joinDate || new Date().toISOString(),
          personal: {
            fullName: dbUser.name || dbUser.username || 'Unnamed Employee',
            email: emailLower,
            contactNumber: dbUser.contact_no || dbUser.phone || '',
          },
        });
      }
    }

    // 2. Also preserve any local/seeded profiles not present in dbUsers (e.g., test candidates)
    for (const p of profiles) {
      const emailLower = (p.userEmail || '').toLowerCase().trim();
      const userIdStr = String(p.userId);
      if ((emailLower && seenEmails.has(emailLower)) || (userIdStr && seenUserIds.has(userIdStr))) {
        continue;
      }
      if (emailLower) seenEmails.add(emailLower);
      seenUserIds.add(userIdStr);
      list.push(p);
    }

    return list;
  }, [dbUsers, profiles]);

  // Keep selectedProfile fresh if list changes
  useEffect(() => {
    if (selectedProfile) {
      const fresh = combinedProfiles.find(
        (p) =>
          String(p.userId) === String(selectedProfile.userId) ||
          (Boolean(p.userEmail) &&
            p.userEmail.toLowerCase() === selectedProfile.userEmail?.toLowerCase())
      );
      if (fresh) setSelectedProfile(fresh);
    }
  }, [combinedProfiles]);

  const refreshList = () => {
    refetchDbUsers();
    setRefreshTrigger((prev) => prev + 1);
  };

  // Summary Metrics
  const metrics = useMemo(
    () => ({
      total: combinedProfiles.length,
      pending: combinedProfiles.filter((p) => p.status === 'submitted').length,
      changes: combinedProfiles.filter((p) => p.status === 'changes_required').length,
      approved: combinedProfiles.filter((p) => p.status === 'approved').length,
      assigned: combinedProfiles.filter((p) => p.status === 'id_assigned').length,
      onboarding: combinedProfiles.filter(
        (p) => p.status === 'in_progress' || p.status === 'incomplete'
      ).length,
    }),
    [combinedProfiles]
  );

  // Tab Filtering
  const filteredProfiles = useMemo(() => {
    return combinedProfiles.filter((p) => {
      const matchesSearch =
        p.personal?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.department?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === 'Pending Review') return p.status === 'submitted';
      if (activeTab === 'Changes Required') return p.status === 'changes_required';
      if (activeTab === 'Approved') return p.status === 'approved';
      if (activeTab === 'ID Assigned') return p.status === 'id_assigned';
      if (activeTab === 'Incomplete')
        return p.status === 'incomplete' || p.status === 'in_progress';
      return true;
    });
  }, [combinedProfiles, searchQuery, activeTab]);

  // Actions
  const handleApprove = (
    userId: number | string,
    employeeEmail?: string,
    employeeName?: string
  ) => {
    try {
      approveProfile(userId, userName, userEmail, userRole, employeeEmail, employeeName);
      showToast.success('Employee profile approved!');
      const fresh = getEmployeeProfile(userId);
      if (fresh) setSelectedProfile(fresh);
      refreshList();
    } catch (err) {
      console.error('Error in handleApprove:', err);
      showToast.error('Failed to approve profile.');
    }
  };

  const handleOpenChangesModal = (userId: number) => {
    setTargetUserId(userId);
    setChangesNotes('');
    setIsChangesModalOpen(true);
  };

  const handleSubmitChanges = () => {
    if (!targetUserId) return;
    if (!changesNotes.trim()) {
      showToast.error('Please provide details on what changes are needed.');
      return;
    }
    try {
      requestProfileChanges(targetUserId, userName, userEmail, userRole, changesNotes.trim());
      showToast.warning('Requested changes sent to employee.');
      setIsChangesModalOpen(false);
      refreshList();
    } catch (err) {
      console.error('Error in handleSubmitChanges:', err);
      showToast.error('Failed to request changes.');
    }
  };

  const handleOpenAssignIdModal = (profile: ProfileCompletionData) => {
    setSelectedProfile(profile);
    setEmpIdInput(profile.employeeId || `EMP-${String(profile.userId).padStart(4, '0')}`);
    setRoleInput(profile.role || 'Employee');
    setDepartmentInput(profile.department || '');
    setDesignationInput(profile.designation || '');
    setAssignError('');
    setIsAssignIdModalOpen(true);
  };

  const handleConfirmAssignId = async () => {
    if (!selectedProfile || isAssigning) return;
    if (!empIdInput.trim()) {
      setAssignError('Employee ID cannot be empty');
      return;
    }

    setIsAssigning(true);
    setAssignError('');

    try {
      const cleanId = empIdInput.trim();
      const cleanRole = roleInput.trim() || 'Employee';
      const cleanDept = departmentInput.trim();
      const cleanDesig = designationInput.trim();

      const result = assignEmployeeId(
        selectedProfile.userId,
        cleanId,
        userName,
        userEmail,
        userRole,
        selectedProfile.userEmail,
        selectedProfile.personal?.fullName,
        {
          role: cleanRole,
          department: cleanDept,
          designation: cleanDesig,
        }
      );

      if (result.success) {
        // Also persist to backend MySQL users table if userId exists
        try {
          const targetDbUser = dbUsers.find(
            (u) =>
              (selectedProfile.userEmail &&
                u.email?.toLowerCase().trim() === selectedProfile.userEmail.toLowerCase().trim()) ||
              String(u.id) === String(selectedProfile.userId)
          );
          const targetUserId = targetDbUser?.id || selectedProfile.userId;

          if (targetUserId) {
            await updateStaff({
              id: targetUserId,
              employee_id: cleanId,
              employee_code: cleanId,
              role: cleanRole as any,
              department: cleanDept,
              designation: cleanDesig,
            }).unwrap();

            if (typeof refetchDbUsers === 'function') {
              refetchDbUsers();
            }

            // Sync auth session if the assigned user is the currently logged-in user
            const savedUserRaw = localStorage.getItem('user');
            if (savedUserRaw) {
              try {
                const currentAuthUser = JSON.parse(savedUserRaw);
                if (
                  (currentAuthUser.email &&
                    selectedProfile.userEmail &&
                    currentAuthUser.email.toLowerCase() ===
                      selectedProfile.userEmail.toLowerCase()) ||
                  String(currentAuthUser.id) === String(targetUserId)
                ) {
                  const updatedAuthUser = {
                    ...currentAuthUser,
                    employee_id: cleanId,
                    employee_code: cleanId,
                    employeeId: cleanId,
                    role: cleanRole,
                    department: cleanDept,
                    designation: cleanDesig,
                  };
                  localStorage.setItem('user', JSON.stringify(updatedAuthUser));
                  window.dispatchEvent(
                    new CustomEvent('auth_user_updated', { detail: updatedAuthUser })
                  );
                  window.dispatchEvent(
                    new CustomEvent('aether_user_updated', { detail: updatedAuthUser })
                  );
                }
              } catch {}
            }
          }
        } catch (apiErr) {
          console.warn('Backend updateStaff note:', apiErr);
        }

        showToast.success(
          `Employee ID "${cleanId}", Role "${cleanRole}" and details assigned successfully!`
        );
        setIsAssignIdModalOpen(false);
        const fresh = getEmployeeProfile(selectedProfile.userId);
        if (fresh) setSelectedProfile(fresh);
        refreshList();
      } else {
        const errMsg = result.error || 'Failed to assign employee details.';
        setAssignError(errMsg);
        showToast.error(errMsg);
      }
    } catch (err: any) {
      console.error('Error in handleConfirmAssignId:', err);
      const msg = err?.data?.message || err?.message || 'An unexpected error occurred.';
      setAssignError(msg);
      showToast.error(msg);
    } finally {
      setIsAssigning(false);
    }
  };

  // Ant Design Table Columns
  const columns: ColumnsType<ProfileCompletionData> = [
    {
      title: 'Employee',
      key: 'employee',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0 border border-border-subtle">
            {record.profilePictureUrl ? (
              <img src={record.profilePictureUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <User size={18} className="text-primary" />
            )}
          </div>
          <div>
            <div className="font-bold text-foreground text-sm">
              {record.personal?.fullName || 'Unnamed Employee'}
            </div>
            <div className="text-xs text-muted">{record.userEmail}</div>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              {record.role && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                  {record.role}
                </span>
              )}
              {record.department && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-surface-subtle text-muted border border-border-subtle">
                  {record.department}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const conf = STATUS_MAP[record.status] || STATUS_MAP.incomplete;
        const Icon = conf.icon;
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${conf.bg}`}
            style={{ lineHeight: '1' }}>
            <Icon size={12} style={{ display: 'block', flexShrink: 0 }} />
            <span>{conf.label}</span>
          </span>
        );
      },
    },
    {
      title: 'Completion',
      key: 'completion',
      render: (_, record) => {
        const pct = calculateCompletionPercentage(record, formConfig);
        const totalSections = formConfig.filter((s) => !s.hidden).length;
        const completedCount = formConfig.filter(
          (s) => !s.hidden && record.completedSections?.[s.id]
        ).length;
        return (
          <div className="w-36">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-foreground">{pct}%</span>
              <span className="text-[10px] text-muted">
                {completedCount}/{totalSections} secs
              </span>
            </div>
            <div className="h-1.5 w-full bg-surface-subtle rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  pct === 100 ? 'bg-success' : pct > 50 ? 'bg-primary' : 'bg-warning'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            {/* Mini section dots */}
            <div className="flex gap-1 mt-1.5">
              {formConfig
                .filter((s) => !s.hidden)
                .map((section) => (
                  <div
                    key={section.id}
                    title={section.label}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      record.completedSections?.[section.id]
                        ? 'bg-success'
                        : 'bg-surface-subtle border border-border-subtle'
                    }`}
                  />
                ))}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Employee ID',
      key: 'employeeId',
      render: (_, record) =>
        record.employeeId ? (
          <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
            <KeyRound size={12} />
            {record.employeeId}
          </span>
        ) : (
          <span className="text-xs text-muted italic">Not Assigned</span>
        ),
    },
    {
      title: 'Last Updated',
      key: 'lastSavedAt',
      render: (_, record) => (
        <span className="text-xs text-muted">
          {record.lastSavedAt ? new Date(record.lastSavedAt).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedProfile(record);
              setReviewTab('overview');
              setIsReviewOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl border border-border-subtle bg-white hover:bg-surface-subtle text-foreground text-xs font-bold transition-all flex items-center gap-1">
            <Eye size={13} />
            Review
          </button>

          {(record.status === 'submitted' ||
            record.status === 'changes_required' ||
            record.status === 'in_progress') && (
            <button
              type="button"
              onClick={() =>
                handleApprove(record.userId, record.userEmail, record.personal?.fullName)
              }
              className="px-3 py-1.5 rounded-xl bg-success text-white hover:bg-success/90 text-xs font-bold transition-all flex items-center gap-1 shadow-xs">
              <CheckCircle2 size={13} />
              Approve
            </button>
          )}

          {record.status === 'approved' && (
            <span className="px-2.5 py-1 rounded-xl bg-success/10 text-success text-[11px] font-bold flex items-center gap-1 border border-success/20">
              <CheckCircle2 size={12} />
              Approved
            </span>
          )}

          {canAssignId && (
            <button
              type="button"
              onClick={() => handleOpenAssignIdModal(record)}
              className="px-3 py-1.5 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-bold transition-all flex items-center gap-1 shadow-xs">
              <KeyRound size={13} />
              {record.employeeId ? 'Edit ID & Role' : 'Assign ID & Role'}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Hiring & Onboarding Management"
        subtitle="Review employee profile submissions, track onboarding progress, and assign official Employee IDs."
        actions={
          <div className="flex items-center gap-3">
            <Link
              to="/hiring-team/form-builder"
              className="px-4 py-2 rounded-xl bg-surface-subtle border border-border-subtle text-foreground hover:bg-white text-xs font-bold transition-all flex items-center gap-1.5">
              <Building size={14} className="text-primary" />
              Configure Form Fields
            </Link>
            <button
              type="button"
              onClick={refreshList}
              className="p-2.5 rounded-xl border border-border-subtle bg-white hover:bg-surface-subtle text-muted hover:text-foreground transition-all"
              title="Refresh profiles">
              <RefreshCw size={15} />
            </button>
          </div>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="p-5 rounded-2xl bg-surface-subtle border border-border-subtle">
          <div className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Total</div>
          <div className="text-2xl font-black text-foreground">{metrics.total}</div>
        </div>
        <div
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${mainView === 'onboarding' ? 'bg-warning/10 border-warning/30 ring-2 ring-warning/20' : 'bg-warning/5 border-warning/20 hover:bg-warning/10'}`}
          onClick={() => setMainView(mainView === 'onboarding' ? 'table' : 'onboarding')}>
          <div className="text-xs font-bold text-warning uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <TrendingUp size={12} />
            In Onboarding
          </div>
          <div className="text-2xl font-black text-warning">{metrics.onboarding}</div>
          <div className="text-[10px] text-warning/70 mt-0.5">
            {mainView === 'onboarding' ? '▲ Click to hide' : 'Click to view'}
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-info/5 border border-info/20">
          <div className="text-xs font-bold text-info uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Clock size={12} />
            Pending Review
          </div>
          <div className="text-2xl font-black text-info">{metrics.pending}</div>
        </div>
        <div className="p-5 rounded-2xl bg-warning/5 border border-warning/20">
          <div className="text-xs font-bold text-warning uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <AlertCircle size={12} />
            Changes Needed
          </div>
          <div className="text-2xl font-black text-warning">{metrics.changes}</div>
        </div>
        <div className="p-5 rounded-2xl bg-success/5 border border-success/20">
          <div className="text-xs font-bold text-success uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <CheckCircle2 size={12} />
            Approved
          </div>
          <div className="text-2xl font-black text-success">{metrics.approved}</div>
        </div>
        <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20">
          <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <KeyRound size={12} />
            ID Assigned
          </div>
          <div className="text-2xl font-black text-primary">{metrics.assigned}</div>
        </div>
      </div>

      {/* ── ONBOARDING PROGRESS PANEL ── */}
      {mainView === 'onboarding' && (
        <div className="bg-white rounded-3xl border border-border-subtle overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-warning" />
              <h2 className="text-sm font-black text-foreground">Live Onboarding Progress</h2>
              <span className="text-[10px] font-bold text-muted bg-surface-subtle border border-border-subtle px-2 py-0.5 rounded-full">
                {metrics.onboarding + metrics.pending + metrics.changes} employees
              </span>
            </div>
            <div className="text-xs text-muted">Click any row to see filled section details</div>
          </div>
          <div className="p-5">
            <OnboardingProgressPanel profiles={combinedProfiles} formConfig={formConfig} />
          </div>
        </div>
      )}

      {/* Controls & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <Tabs
          items={[
            'All',
            'Pending Review',
            'Changes Required',
            'Approved',
            'ID Assigned',
            'Incomplete',
          ]}
          activeItem={activeTab}
          onItemChange={setActiveTab}
        />
        <div className="relative min-w-[280px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search by name, email, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border-subtle bg-white text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-border-subtle overflow-hidden shadow-xs">
        <Table
          scroll={{ x: 'max-content' }}
          columns={columns}
          dataSource={filteredProfiles}
          rowKey="userId"
          loading={isUsersLoading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          locale={{ emptyText: 'No employee profile submissions found' }}
        />
      </div>

      {/* ── DETAIL REVIEW DIALOG ── */}
      <Dialog
        visible={isReviewOpen}
        onHide={() => setIsReviewOpen(false)}
        width={900}
        header={
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center">
                {selectedProfile?.profilePictureUrl ? (
                  <img
                    src={selectedProfile.profilePictureUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={20} className="text-primary" />
                )}
              </div>
              <div>
                <h3 className="text-base font-black text-foreground">
                  {selectedProfile?.personal?.fullName || 'Employee Profile'}
                </h3>
                <p className="text-xs text-muted">{selectedProfile?.userEmail}</p>
              </div>
            </div>
            {selectedProfile && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_MAP[selectedProfile.status]?.bg}`}>
                {STATUS_MAP[selectedProfile.status]?.label}
              </span>
            )}
          </div>
        }>
        {selectedProfile && (
          <div className="space-y-6 pt-2">
            {/* Review Section Navigation */}
            <div className="flex items-center gap-2 border-b border-border-subtle pb-3 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: ListChecks },
                { id: 'personal', label: 'Personal & Contact', icon: User },
                { id: 'bank', label: 'Bank Details', icon: CreditCard },
                { id: 'identity', label: 'Identity Documents', icon: FileText },
                { id: 'employment', label: 'Employment History', icon: Briefcase },
                { id: 'education', label: 'Education', icon: GraduationCap },
                { id: 'certifications', label: 'Certifications', icon: Award },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = reviewTab === tab.id;
                // Mark completion status for non-overview tabs
                const isDone = tab.id !== 'overview' && selectedProfile.completedSections?.[tab.id];
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setReviewTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all relative ${
                      isActive
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-surface-subtle text-muted hover:text-foreground'
                    }`}>
                    <Icon size={14} />
                    {tab.label}
                    {tab.id !== 'overview' && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${isDone ? 'bg-success' : 'bg-muted/40'} ${isActive ? 'bg-white/50' : ''}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Tab: Overview (Section Completion Summary) ── */}
            {reviewTab === 'overview' && (
              <div className="space-y-5">
                {/* Completion progress */}
                <div className="p-5 rounded-2xl bg-surface-subtle border border-border-subtle">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-foreground">
                      Overall Profile Completion
                    </span>
                    <span className="text-xl font-black text-primary">
                      {calculateCompletionPercentage(selectedProfile, formConfig)}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-white rounded-full overflow-hidden border border-border-subtle">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-700"
                      style={{
                        width: `${calculateCompletionPercentage(selectedProfile, formConfig)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Section-by-section status */}
                <div>
                  <div className="text-xs font-bold text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <ListChecks size={13} />
                    Section Completion Status
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {formConfig
                      .filter((s) => !s.hidden)
                      .sort((a, b) => a.order - b.order)
                      .map((section) => {
                        const SectionIcon = SECTION_ICON_MAP[section.id] || FileText;
                        const done = !!selectedProfile.completedSections?.[section.id];
                        return (
                          <div
                            key={section.id}
                            onClick={() => setReviewTab(section.id as any)}
                            className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all hover:shadow-xs ${
                              done
                                ? 'bg-success/5 border-success/25'
                                : 'bg-surface-subtle border-border-subtle'
                            }`}>
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center ${done ? 'bg-success/15' : 'bg-surface-subtle border border-border-subtle'}`}>
                              <SectionIcon
                                size={15}
                                className={done ? 'text-success' : 'text-muted'}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-foreground">
                                {section.label}
                              </div>
                              <div className="text-[10px] text-muted">{section.description}</div>
                            </div>
                            <div className="shrink-0">
                              {done ? (
                                <CheckCircle2 size={16} className="text-success" />
                              ) : (
                                <Clock size={16} className="text-muted" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Key data summary */}
                <div>
                  <div className="text-xs font-bold text-muted uppercase tracking-wider mb-3">
                    Quick Data Summary
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Full Name', value: selectedProfile.personal?.fullName },
                      { label: 'Assigned ID', value: selectedProfile.employeeId },
                      { label: 'System Role', value: selectedProfile.role || 'Employee' },
                      { label: 'Department', value: selectedProfile.department || 'Not Assigned' },
                      { label: 'Designation', value: selectedProfile.designation || '—' },
                      { label: 'Contact', value: selectedProfile.personal?.contactNumber },
                      { label: 'Date of Birth', value: selectedProfile.personal?.dateOfBirth },
                      { label: 'Gender', value: selectedProfile.personal?.gender },
                      { label: 'Bank', value: selectedProfile.bank?.bankName },
                      { label: 'Account Type', value: selectedProfile.bank?.accountType },
                      { label: 'PAN Number', value: selectedProfile.identity?.panNumber },
                      {
                        label: 'Documents',
                        value: selectedProfile.documents?.length
                          ? `${selectedProfile.documents.length} file(s)`
                          : 'None',
                      },
                      {
                        label: 'Employment Entries',
                        value: selectedProfile.employment?.length
                          ? `${selectedProfile.employment.length} jobs`
                          : 'None',
                      },
                      {
                        label: 'Education Entries',
                        value: selectedProfile.education?.length
                          ? `${selectedProfile.education.length} qualifications`
                          : 'None',
                      },
                      {
                        label: 'Certifications',
                        value: selectedProfile.certifications?.length
                          ? `${selectedProfile.certifications.length} certs`
                          : 'None',
                      },
                      {
                        label: 'Submitted At',
                        value: selectedProfile.submittedAt
                          ? new Date(selectedProfile.submittedAt).toLocaleString()
                          : 'Not yet',
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="p-3 rounded-xl bg-surface-subtle border border-border-subtle">
                        <div className="text-[10px] font-bold text-muted uppercase mb-0.5">
                          {item.label}
                        </div>
                        <div className="text-xs font-semibold text-foreground">
                          {item.value || '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review notes if any */}
                {selectedProfile.reviewNotes && (
                  <div className="p-4 rounded-2xl bg-warning/5 border border-warning/20">
                    <div className="text-[10px] font-bold text-warning uppercase mb-1 flex items-center gap-1.5">
                      <AlertCircle size={11} />
                      Revision Notes (sent to employee)
                    </div>
                    <div className="text-xs text-foreground">{selectedProfile.reviewNotes}</div>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Personal ── */}
            {reviewTab === 'personal' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-surface-subtle">
                    <div className="text-[10px] font-bold text-muted uppercase">Full Name</div>
                    <div className="text-sm font-semibold text-foreground mt-1">
                      {selectedProfile.personal?.fullName || '—'}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-surface-subtle">
                    <div className="text-[10px] font-bold text-muted uppercase">Contact Phone</div>
                    <div className="text-sm font-semibold text-foreground mt-1">
                      {selectedProfile.personal?.contactNumber || '—'}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-surface-subtle">
                    <div className="text-[10px] font-bold text-muted uppercase">Email</div>
                    <div className="text-sm font-semibold text-foreground mt-1">
                      {selectedProfile.personal?.email || selectedProfile.userEmail || '—'}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-surface-subtle">
                    <div className="text-[10px] font-bold text-muted uppercase">
                      Date of Birth / Gender
                    </div>
                    <div className="text-sm font-semibold text-foreground mt-1">
                      {selectedProfile.personal?.dateOfBirth || '—'} (
                      {selectedProfile.personal?.gender || '—'})
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-surface-subtle">
                    <div className="text-[10px] font-bold text-muted uppercase">
                      Nationality / Marital Status
                    </div>
                    <div className="text-sm font-semibold text-foreground mt-1">
                      {selectedProfile.personal?.nationality || '—'} /{' '}
                      {selectedProfile.personal?.maritalStatus || '—'}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-surface-subtle">
                    <div className="text-[10px] font-bold text-muted uppercase">
                      Alternate Contact
                    </div>
                    <div className="text-sm font-semibold text-foreground mt-1">
                      {selectedProfile.personal?.alternateContact || '—'}
                    </div>
                  </div>
                  <div className="col-span-2 p-4 rounded-2xl bg-surface-subtle">
                    <div className="text-[10px] font-bold text-muted uppercase">
                      Current Address
                    </div>
                    <div className="text-sm text-foreground mt-1">
                      {selectedProfile.personal?.currentAddress || '—'}
                    </div>
                  </div>
                  <div className="col-span-2 p-4 rounded-2xl bg-surface-subtle">
                    <div className="text-[10px] font-bold text-muted uppercase">
                      Permanent Address
                    </div>
                    <div className="text-sm text-foreground mt-1">
                      {selectedProfile.personal?.permanentAddress || '—'}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-surface-subtle">
                    <div className="text-[10px] font-bold text-muted uppercase">
                      Emergency Contact Name
                    </div>
                    <div className="text-sm font-semibold text-foreground mt-1">
                      {selectedProfile.personal?.emergencyContactName || '—'}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-surface-subtle">
                    <div className="text-[10px] font-bold text-muted uppercase">
                      Emergency Contact Phone
                    </div>
                    <div className="text-sm font-semibold text-foreground mt-1">
                      {selectedProfile.personal?.emergencyContactPhone || '—'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab: Bank ── */}
            {reviewTab === 'bank' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-surface-subtle">
                    <div className="text-[10px] font-bold text-muted uppercase">
                      Account Holder Name
                    </div>
                    <div className="text-sm font-semibold text-foreground mt-1">
                      {selectedProfile.bank?.accountHolderName || '—'}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-surface-subtle">
                    <div className="text-[10px] font-bold text-muted uppercase">Bank Name</div>
                    <div className="text-sm font-semibold text-foreground mt-1">
                      {selectedProfile.bank?.bankName || '—'}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-surface-subtle">
                    <div className="text-[10px] font-bold text-muted uppercase">Account Number</div>
                    <div className="text-sm font-mono font-semibold text-foreground mt-1">
                      {selectedProfile.bank?.accountNumber
                        ? `••••••••${selectedProfile.bank.accountNumber.slice(-4)}`
                        : '—'}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-surface-subtle">
                    <div className="text-[10px] font-bold text-muted uppercase">IFSC Code</div>
                    <div className="text-sm font-mono font-semibold text-foreground mt-1">
                      {selectedProfile.bank?.ifscCode || '—'}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-surface-subtle">
                    <div className="text-[10px] font-bold text-muted uppercase">Branch Name</div>
                    <div className="text-sm font-semibold text-foreground mt-1">
                      {selectedProfile.bank?.branchName || '—'}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-surface-subtle">
                    <div className="text-[10px] font-bold text-muted uppercase">Account Type</div>
                    <div className="text-sm font-semibold text-foreground mt-1 capitalize">
                      {selectedProfile.bank?.accountType || '—'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab: Identity ── */}
            {reviewTab === 'identity' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-surface-subtle">
                    <div className="text-[10px] font-bold text-muted uppercase">PAN Number</div>
                    <div className="text-sm font-mono font-semibold text-foreground mt-1">
                      {selectedProfile.identity?.panNumber || '—'}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-surface-subtle">
                    <div className="text-[10px] font-bold text-muted uppercase">Aadhaar Number</div>
                    <div className="text-sm font-mono font-semibold text-foreground mt-1">
                      {selectedProfile.identity?.aadhaarNumber
                        ? `•••• •••• ${selectedProfile.identity.aadhaarNumber.slice(-4)}`
                        : '—'}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-surface-subtle">
                    <div className="text-[10px] font-bold text-muted uppercase">
                      Passport Number
                    </div>
                    <div className="text-sm font-mono font-semibold text-foreground mt-1">
                      {selectedProfile.identity?.passportNumber || '—'}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-surface-subtle">
                    <div className="text-[10px] font-bold text-muted uppercase">
                      Driving License
                    </div>
                    <div className="text-sm font-mono font-semibold text-foreground mt-1">
                      {selectedProfile.identity?.drivingLicense || '—'}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-xs font-bold text-foreground mb-3">
                    Uploaded Identity Documents:
                  </div>
                  {selectedProfile.documents && selectedProfile.documents.length > 0 ? (
                    <div className="space-y-2">
                      {selectedProfile.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-3 rounded-xl border border-border-subtle bg-white flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-primary" />
                            <div>
                              <div className="text-xs font-bold text-foreground">
                                {doc.fileName || doc.label}
                              </div>
                              <div className="text-[10px] text-muted capitalize">
                                {doc.type} •{' '}
                                {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(0)} KB` : ''} •
                                Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                doc.status === 'verified'
                                  ? 'bg-success/10 border-success/25 text-success'
                                  : doc.status === 'rejected'
                                    ? 'bg-error/10 border-error/25 text-error'
                                    : 'bg-surface-subtle border-border-subtle text-muted'
                              }`}>
                              {doc.status}
                            </span>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1 rounded-lg bg-surface-subtle text-primary hover:bg-primary/10 text-xs font-bold transition-all flex items-center gap-1">
                              <ExternalLink size={12} />
                              View
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-muted italic p-4 bg-surface-subtle rounded-xl text-center">
                      No documents attached yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Tab: Employment ── */}
            {reviewTab === 'employment' && (
              <div className="space-y-3">
                {selectedProfile.employment && selectedProfile.employment.length > 0 ? (
                  selectedProfile.employment.map((emp, i) => (
                    <div
                      key={emp.id || i}
                      className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-bold text-foreground">{emp.designation}</div>
                          <div className="text-xs text-muted">{emp.employer}</div>
                        </div>
                        <span className="text-[11px] font-mono text-muted">
                          {emp.startDate} — {emp.isCurrent ? 'Present' : emp.endDate}
                        </span>
                      </div>
                      {emp.salary && <div className="text-xs text-muted">Salary: {emp.salary}</div>}
                      {emp.responsibilities && (
                        <div className="text-xs text-muted border-t border-border-subtle pt-2">
                          {emp.responsibilities}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-muted italic p-4 bg-surface-subtle rounded-xl text-center">
                    No previous employment recorded.
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Education ── */}
            {reviewTab === 'education' && (
              <div className="space-y-3">
                {selectedProfile.education && selectedProfile.education.length > 0 ? (
                  selectedProfile.education.map((edu, i) => (
                    <div
                      key={edu.id || i}
                      className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle space-y-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-bold text-foreground">
                            {edu.degree}
                            {edu.field ? ` in ${edu.field}` : ''}
                          </div>
                          <div className="text-xs text-muted">{edu.institution}</div>
                        </div>
                        <span className="text-[11px] font-mono text-muted">
                          {edu.startYear} – {edu.endYear}
                        </span>
                      </div>
                      {edu.grade && (
                        <div className="text-xs text-muted">Grade / Percentage: {edu.grade}</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-muted italic p-4 bg-surface-subtle rounded-xl text-center">
                    No education history recorded.
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Certifications ── */}
            {reviewTab === 'certifications' && (
              <div className="space-y-3">
                {selectedProfile.certifications && selectedProfile.certifications.length > 0 ? (
                  selectedProfile.certifications.map((cert, i) => (
                    <div
                      key={cert.id || i}
                      className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle space-y-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-bold text-foreground">{cert.title}</div>
                          <div className="text-xs text-muted">{cert.issuingOrganization}</div>
                        </div>
                        <span className="text-[11px] font-mono text-muted">
                          Issued: {cert.issueDate}
                        </span>
                      </div>
                      {cert.credentialId && (
                        <div className="text-xs text-muted">Credential ID: {cert.credentialId}</div>
                      )}
                      {cert.expiryDate && (
                        <div className="text-xs text-muted">Expires: {cert.expiryDate}</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-muted italic p-4 bg-surface-subtle rounded-xl text-center">
                    No certifications recorded.
                  </div>
                )}
              </div>
            )}

            {/* Action Bar inside Dialog */}
            <div className="border-t border-border-subtle pt-4 flex items-center justify-between">
              <div>
                {selectedProfile.employeeId && (
                  <span className="text-xs font-bold text-primary">
                    Assigned ID: {selectedProfile.employeeId}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenChangesModal(selectedProfile.userId)}
                  className="px-4 py-2 rounded-xl border border-warning/30 bg-warning/5 text-warning hover:bg-warning/10 text-xs font-bold transition-all flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  Request Revisions
                </button>
                {selectedProfile.status !== 'approved' &&
                selectedProfile.status !== 'id_assigned' ? (
                  <button
                    type="button"
                    onClick={() =>
                      handleApprove(
                        selectedProfile.userId,
                        selectedProfile.userEmail,
                        selectedProfile.personal?.fullName
                      )
                    }
                    className="px-4 py-2 rounded-xl bg-success text-white hover:bg-success/90 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs">
                    <CheckCircle2 size={14} />
                    Approve Profile
                  </button>
                ) : (
                  <span className="px-3 py-2 rounded-xl bg-success/10 text-success border border-success/20 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    Approved
                  </span>
                )}
                {canAssignId && (
                  <button
                    type="button"
                    onClick={() => handleOpenAssignIdModal(selectedProfile)}
                    className="px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs">
                    <KeyRound size={14} />
                    {selectedProfile.employeeId ? 'Edit ID & Role' : 'Assign ID & Role'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* ── REQUEST CHANGES MODAL ── */}
      <Dialog
        visible={isChangesModalOpen}
        onHide={() => setIsChangesModalOpen(false)}
        width={500}
        header={<h3 className="text-base font-black text-foreground">Request Profile Changes</h3>}>
        <div className="space-y-4 pt-2">
          <p className="text-xs text-muted">
            Explain what documents or fields the employee needs to update or re-upload. The employee
            will see this message upon logging in.
          </p>
          <div>
            <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">
              Feedback & Correction Instructions *
            </label>
            <textarea
              rows={4}
              value={changesNotes}
              onChange={(e) => setChangesNotes(e.target.value)}
              placeholder="e.g. Please upload a clear photo of your PAN card, and verify your bank account number."
              className="w-full px-4 py-3 rounded-xl border border-border-subtle text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsChangesModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-border-subtle bg-white text-foreground text-xs font-bold">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitChanges}
              className="px-5 py-2 rounded-xl bg-warning text-white hover:bg-warning/90 text-xs font-bold shadow-xs flex items-center gap-1.5">
              <Send size={13} />
              Send to Employee
            </button>
          </div>
        </div>
      </Dialog>

      {/* ── ASSIGN OFFICIAL PROFILE DETAILS (ID, ROLE, DEPARTMENT, DESIGNATION) MODAL ── */}
      <Dialog
        visible={isAssignIdModalOpen}
        onHide={() => setIsAssignIdModalOpen(false)}
        width={560}
        header={
          <div className="flex items-center gap-2">
            <KeyRound size={18} className="text-primary" />
            <h3 className="text-base font-black text-foreground">
              {selectedProfile?.employeeId
                ? 'Manage Official Profile & Role'
                : 'Assign Official ID & Role'}
            </h3>
          </div>
        }>
        <div className="space-y-4 pt-2">
          {/* Target employee summary card */}
          {selectedProfile && (
            <div className="p-3.5 rounded-2xl bg-surface-subtle border border-border-subtle flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center shrink-0 border border-primary/20">
                {selectedProfile.profilePictureUrl ? (
                  <img
                    src={selectedProfile.profilePictureUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={18} className="text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-foreground truncate">
                  {selectedProfile.personal?.fullName || 'Unnamed Employee'}
                </div>
                <div className="text-xs text-muted truncate">{selectedProfile.userEmail}</div>
              </div>
              <span
                className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_MAP[selectedProfile.status]?.bg || 'bg-surface-subtle'}`}>
                {STATUS_MAP[selectedProfile.status]?.label || selectedProfile.status}
              </span>
            </div>
          )}

          <div className="p-3 rounded-2xl bg-primary/5 border border-primary/20 flex items-center gap-3">
            <div className="text-xs text-primary leading-relaxed">
              <strong>Role Verified:</strong> You are authorized ({userRole}) to assign or update
              official employee identifiers, system roles, and department affiliations.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">
                Official Employee ID *
              </label>
              <input
                type="text"
                value={empIdInput}
                onChange={(e) => {
                  setEmpIdInput(e.target.value);
                  setAssignError('');
                }}
                placeholder="e.g. EMP-0042 or ARX-01"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">
                System Role *
              </label>
              <select
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle text-xs font-semibold text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                {AVAILABLE_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">
                Department
              </label>
              <select
                value={departmentInput}
                onChange={(e) => setDepartmentInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle text-xs font-semibold text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option value="">-- Select Department --</option>
                {AVAILABLE_DEPTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">
                Designation / Job Title
              </label>
              <input
                type="text"
                value={designationInput}
                onChange={(e) => setDesignationInput(e.target.value)}
                placeholder="e.g. Frontend Developer"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {assignError && <p className="text-xs text-error font-medium">{assignError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAssignIdModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-border-subtle bg-white text-foreground text-xs font-bold hover:bg-surface-subtle transition-all">
              Cancel
            </button>
            <button
              type="button"
              disabled={isAssigning}
              onClick={handleConfirmAssignId}
              className="px-5 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              <CheckCircle2 size={13} />
              {isAssigning ? 'Saving Profile...' : 'Confirm & Save Details'}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
