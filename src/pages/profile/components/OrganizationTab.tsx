import { useState } from 'react';
import {
  GitBranch,
  ShieldCheck,
  KeyRound,
  Briefcase,
  Layers,
  ChevronDown,
  ExternalLink,
  Users,
  Crown,
  ArrowUpRight,
} from 'lucide-react';
import { Tag, Tooltip } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Button } from '@/components/ui/primitives/Button';
import type { ProfileUserData } from '../hooks/useProfile';
import { useGetOrganizationHierarchyQuery } from '@/store/api/organizationApiSlice';
import { useGetLeaveApproverForUserQuery } from '@/store/api/leaveSlice';
import { useGetPermissionsQuery } from '@/store/api/roleApiSlice';

interface OrganizationTabProps {
  user: ProfileUserData;
}

// ─── Helper: Avatar circle ───────────────────────────────────────────────────
function HierarchyAvatar({
  name,
  image,
  size = 'md',
  colorClass = 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
}: {
  name: string;
  image?: string;
  size?: 'sm' | 'md' | 'lg';
  colorClass?: string;
}) {
  const sizeMap = { sm: 'w-9 h-9 text-xs', md: 'w-11 h-11 text-sm', lg: 'w-14 h-14 text-base' };
  return (
    <div
      className={`${sizeMap[size]} rounded-2xl border font-black flex items-center justify-center shrink-0 overflow-hidden ${colorClass}`}
    >
      {image ? (
        <img src={image} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{(name || 'U').slice(0, 2).toUpperCase()}</span>
      )}
    </div>
  );
}

// ─── Connector line ──────────────────────────────────────────────────────────
function Connector({ branching = false }: { branching?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        className={`bg-gradient-to-b from-primary/40 to-primary/10 ${branching ? 'w-0.5 h-8' : 'w-0.5 h-6'}`}
        initial={{ scaleY: 0, originY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
    </div>
  );
}

export const OrganizationTab = ({ user }: OrganizationTabProps) => {
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [reportsExpanded, setReportsExpanded] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // RTK Query: fetch organizational hierarchy & leave approver
  const { data: hierarchyData } = useGetOrganizationHierarchyQuery();
  const { data: approverData } = useGetLeaveApproverForUserQuery(user.id);
  const { data: permsData } = useGetPermissionsQuery();

  // allPermissions from permsData
  const modules = permsData?.data?.modules || {};

  // Find user's node in flatUsers
  const flatUsers = hierarchyData?.data?.flatUsers || [];
  const currentHierarchyUser = flatUsers.find(
    (u) =>
      (user.id && String(u.id) === String(user.id)) ||
      (user.email && u.email?.toLowerCase() === user.email.toLowerCase())
  );

  // Resolved reporting manager
  const reportingManager = currentHierarchyUser?.reporting_manager_id
    ? flatUsers.find((u) => u.id === currentHierarchyUser.reporting_manager_id)
    : user.manager;

  // Direct reports under this user
  const directReports = currentHierarchyUser
    ? flatUsers.filter((u) => u.reporting_manager_id === currentHierarchyUser.id)
    : user.teamMembers;

  // Resolved Leave Approver
  const resolvedApprover = approverData?.data?.approvers?.[0] || null;
  const approverReason = resolvedApprover?.reason || 'Organization Founder / System Executive';

  // Dynamic assigned roles
  const assignedRoles = currentHierarchyUser?.roles?.length
    ? currentHierarchyUser.roles
    : user.roles?.length
      ? user.roles.map((r) => ({ id: Number(r.id) || 0, name: r.name, is_system: true }))
      : [{ id: 0, name: 'Employee', is_system: true }];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Top Cards Grid: Roles & Leave Approver Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Assigned Roles & Permissions */}
        <div className="bg-surface-subtle/50 p-6 rounded-2xl border border-border-subtle flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary" /> Assigned Roles & Access
              </h3>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                {assignedRoles.length} {assignedRoles.length === 1 ? 'Role' : 'Roles'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {assignedRoles.map((r) => (
                <Tag
                  key={r.name}
                  color={r.name.toLowerCase().includes('admin') || r.name.toLowerCase().includes('founder') ? 'volcano' : 'blue'}
                  className="px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 shadow-2xs">
                  <ShieldCheck size={12} /> {r.name}
                </Tag>
              ))}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Permissions are dynamically inherited from your assigned role policies across modules (User Management, Leaves, Finance, Projects).
            </p>
          </div>

          <Button
            variant="outline"
            size="small"
            onClick={() => setShowPermissionsModal(true)}
            className="w-full text-xs font-bold gap-2 rounded-xl! justify-center">
            <KeyRound size={14} /> View Effective Permissions Breakdown
          </Button>
        </div>

        {/* Card 2: Designated Leave Approver */}
        <div className="bg-surface-subtle/50 p-6 rounded-2xl border border-border-subtle flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <Briefcase size={16} className="text-emerald-600" /> Designated Leave Approver
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                Active Routing
              </span>
            </div>

            {resolvedApprover ? (
              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white border border-border-subtle shadow-2xs">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                  {resolvedApprover.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-black text-foreground block truncate">
                    {resolvedApprover.username}
                  </span>
                  <span className="text-[11px] text-muted-foreground block truncate">
                    {resolvedApprover.email}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                    {approverReason}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-white border border-border-subtle text-xs text-muted-foreground italic">
                Routed to Organization Founder / System Executive
              </div>
            )}

            <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
              When you submit a Work-From-Home or Leave request, it is automatically routed to this designated approver according to the corporate governance policy.
            </p>
          </div>
        </div>
      </div>

      {/* Organization Reporting Hierarchy Tree */}
      <div className="bg-surface-subtle/50 p-6 sm:p-8 rounded-2xl border border-border-subtle flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
            <GitBranch size={16} className="text-primary" /> Reporting Hierarchy
          </h3>
          <span className="text-xs text-muted-foreground font-medium">
            Department: <strong className="text-foreground">{user.department}</strong>
          </span>
        </div>

        <div className="flex flex-col items-center gap-0 max-w-xl mx-auto w-full py-4">

          {/* ── MANAGER NODE ─────────────────────────────── */}
          {reportingManager ? (
            <motion.div
              className="w-full"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Tooltip title="Click to view manager's profile" placement="top">
                <motion.div
                  className={`w-full bg-white p-4 rounded-2xl border shadow-xs flex items-center justify-between cursor-pointer select-none transition-all duration-200 ${
                    hoveredId === 'manager'
                      ? 'border-indigo-400 shadow-indigo-100 shadow-md -translate-y-0.5'
                      : 'border-border-subtle'
                  }`}
                  onHoverStart={() => setHoveredId('manager')}
                  onHoverEnd={() => setHoveredId(null)}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const mgr = reportingManager as any;
                    const id = mgr?.id || mgr?.userId;
                    if (id) window.location.href = `/profile?userId=${id}`;
                  }}
                >
                  <div className="flex items-center gap-3">
                    <HierarchyAvatar
                      name={('username' in reportingManager ? reportingManager.username : reportingManager.name) || 'M'}
                      size="md"
                      colorClass="bg-indigo-500/10 text-indigo-600 border border-indigo-500/20"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-foreground">
                          {'username' in reportingManager ? reportingManager.username : reportingManager.name}
                        </span>
                        <Crown size={11} className="text-amber-500" />
                      </div>
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {(reportingManager as any).role || (reportingManager as any).designation || 'Manager'}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {('email' in reportingManager ? reportingManager.email : (reportingManager as any).code) || ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 text-[10px] font-extrabold uppercase">
                      Reporting Manager
                    </span>
                    <ArrowUpRight size={14} className={`transition-opacity ${hoveredId === 'manager' ? 'opacity-100 text-indigo-500' : 'opacity-0'}`} />
                  </div>
                </motion.div>
              </Tooltip>

              <Connector />
            </motion.div>
          ) : (
            <motion.div
              className="w-full text-center py-3 text-xs text-muted-foreground italic bg-white/60 rounded-xl border border-dashed border-border-subtle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              🏛️ Executive Level — Direct reporting line to Founder / Board of Directors
            </motion.div>
          )}

          {/* ── CURRENT USER NODE ────────────────────────── */}
          <motion.div
            className="w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="w-full bg-gradient-to-r from-primary-soft/40 to-white p-5 rounded-2xl border-2 border-primary shadow-soft flex items-center justify-between relative overflow-hidden">
              {/* Glow ring effect */}
              <div className="absolute inset-0 rounded-2xl ring-2 ring-primary/10 animate-pulse pointer-events-none" />
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl border-2 border-primary shadow-md overflow-hidden bg-primary/10 flex items-center justify-center text-primary font-black text-lg">
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.name.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-foreground">{user.name}</span>
                  <span className="text-xs font-bold text-primary">{user.designation}</span>
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {user.department} • Code: {user.employeeCode || user.employeeId}
                  </span>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-full bg-primary text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                YOU
              </span>
            </div>
          </motion.div>

          {/* ── DIRECT REPORTS ───────────────────────────── */}
          {directReports && directReports.length > 0 && (
            <motion.div
              className="w-full flex flex-col items-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Connector branching />

              {/* Collapsible header */}
              <button
                onClick={() => setReportsExpanded((p) => !p)}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/20 text-primary text-[10px] font-extrabold uppercase tracking-wider mb-4 hover:bg-primary/15 transition-colors cursor-pointer"
              >
                <Users size={12} />
                Direct Reports ({directReports.length})
                <motion.span animate={{ rotate: reportsExpanded ? 0 : 180 }} transition={{ duration: 0.25 }}>
                  <ChevronDown size={12} />
                </motion.span>
              </button>

              <AnimatePresence>
                {reportsExpanded && (
                  <motion.div
                    className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {directReports.map((member: any, idx: number) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.07 }}
                      >
                        <Tooltip title={`View ${member.username || member.name}'s profile`} placement="top">
                          <motion.div
                            className={`bg-white p-3 rounded-xl border flex items-center gap-3 shadow-2xs cursor-pointer select-none transition-all duration-150 ${
                              hoveredId === `report-${member.id}`
                                ? 'border-primary/40 shadow-primary/10 shadow-md -translate-y-0.5'
                                : 'border-border-subtle'
                            }`}
                            onHoverStart={() => setHoveredId(`report-${member.id}`)}
                            onHoverEnd={() => setHoveredId(null)}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              if (member.id) window.location.href = `/profile?userId=${member.id}`;
                            }}
                          >
                            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/15">
                              {(member.username || member.name || 'E').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-xs font-bold text-foreground truncate">
                                {member.username || member.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground truncate">
                                {member.designation || member.role || 'Team Member'}
                              </span>
                            </div>
                            <ExternalLink
                              size={12}
                              className={`shrink-0 transition-opacity ${hoveredId === `report-${member.id}` ? 'opacity-60 text-primary' : 'opacity-0'}`}
                            />
                          </motion.div>
                        </Tooltip>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Permissions Breakdown Dialog */}
      <Dialog
        visible={showPermissionsModal}
        onHide={() => setShowPermissionsModal(false)}
        header="Your Effective Permissions Breakdown"
        className="max-w-2xl">
        <div className="space-y-4 pt-2">
          <p className="text-xs text-muted-foreground leading-relaxed">
            These permissions define what actions you are authorized to perform across the ERP system.
          </p>

          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
            {Object.keys(modules).map((modKey) => {
              const permsInMod = modules[modKey];
              return (
                <div
                  key={modKey}
                  className="p-3.5 rounded-xl border border-border-subtle bg-surface-subtle/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-foreground tracking-wider flex items-center gap-2">
                      <Layers size={14} className="text-primary" /> {modKey} Module
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {permsInMod.length} Actions
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {permsInMod.map((p) => (
                      <Tag key={p.id} color="cyan" className="text-[11px] font-medium m-0">
                        {p.action}
                      </Tag>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-3 border-t border-border-subtle">
            <Button variant="ghost" onClick={() => setShowPermissionsModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
