import React, { useEffect, useState } from 'react';
import { Tooltip, message } from 'antd';
import {
  Crown,
  ChevronRight,
  Mail,
  Copy,
  Calendar,
  Hash,
  Phone,
  UserPlus,
  Trash2,
  Edit2,
  Layers,
  Check,
  X,
} from 'lucide-react';
import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import { getDepartmentColor } from '../utils/orgLayoutEngine';

interface OrgEmployeeDrawerProps {
  user: HierarchyNodeUser | null;
  open: boolean;
  onClose: () => void;
  flatUsers: HierarchyNodeUser[];
  onSelectUser: (user: HierarchyNodeUser) => void;
  onAddDirectReport: (user: HierarchyNodeUser) => void;
  onRemoveUser: (user: HierarchyNodeUser) => void;
  onChangeManager?: (user: HierarchyNodeUser) => void;
  onMatrixManager?: (user: HierarchyNodeUser) => void;
  canManage: boolean;
}

export const OrgEmployeeDrawer: React.FC<OrgEmployeeDrawerProps> = ({
  user,
  open,
  onClose,
  flatUsers,
  onSelectUser,
  onAddDirectReport,
  onRemoveUser,
  onChangeManager,
  onMatrixManager,
  canManage,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || !user) return null;

  const isRoot =
    !user.reporting_manager_id ||
    user.username.toLowerCase().includes('founder') ||
    user.designation?.toLowerCase().includes('founder') ||
    user.designation?.toLowerCase().includes('ceo');

  const deptColor = getDepartmentColor(user.department);

  // Manager
  const manager = flatUsers.find((u) => u.id === user.reporting_manager_id);
  const managerDeptColor = getDepartmentColor(manager?.department);

  // Direct Reports & Subtree Team Count
  const directReports = user.directReports || [];
  const teamOfM = (user.subordinatesCount ?? 0) || directReports.length;

  // Peers: share the same manager, exclude self, max 4
  const peers = user.reporting_manager_id
    ? flatUsers
        .filter((u) => u.id !== user.id && u.reporting_manager_id === user.reporting_manager_id)
        .slice(0, 4)
    : [];

  const initials = (user.username || 'User')
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const employeeId = user.employee_code || `EMP-${String(user.id).padStart(4, '0')}`;
  const joinDate =
    (user as any).join_date ||
    (user as any).joinDate ||
    (user as any).created_at?.split('T')[0] ||
    (user as any).createdAt?.split('T')[0] ||
    'Active Member';

  const copyEmail = () => {
    if (user.email) {
      navigator.clipboard.writeText(user.email);
      setCopiedEmail(true);
      message.success('Email copied to clipboard');
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[560px] max-h-[90vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl text-slate-800 font-sans overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header Banner */}
        <div className="p-6 pb-4 border-b border-slate-100 bg-[#faf9f8] relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors text-sm font-bold cursor-pointer shadow-xs"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-4">
            {/* Circular Avatar */}
            {user.image_url ? (
              <img
                src={user.image_url}
                alt={user.username}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-white shadow-md"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold tracking-wide shadow-md text-white shrink-0"
                style={{
                  backgroundColor: isRoot ? '#f59e0b' : deptColor.text,
                }}
              >
                {isRoot ? <Crown size={26} className="text-white" /> : initials}
              </div>
            )}

            <div className="min-w-0 flex-1 pr-6">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight truncate">
                  {user.username}
                </h2>
                {isRoot && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Founder & CEO
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                {user.designation || (isRoot ? 'Founder & CEO' : user.role)}
              </p>
              {user.department && (
                <span
                  className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold mt-1.5"
                  style={{
                    backgroundColor: deptColor.bg,
                    color: deptColor.text,
                  }}
                >
                  {user.department}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Information Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Metadata Cards Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#faf9f8] border border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0 shadow-xs">
                <Hash size={14} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                  Employee ID
                </span>
                <span className="text-xs font-bold text-slate-800 truncate block">
                  {employeeId}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0 shadow-xs">
                <Calendar size={14} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                  Joining Date
                </span>
                <span className="text-xs font-bold text-slate-800 truncate block">
                  {joinDate}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase block">
              Contact Information
            </span>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0 text-slate-700">
                  <Mail size={14} className="text-[#e8583a] shrink-0" />
                  <span className="truncate font-medium">{user.email}</span>
                </div>
                <button
                  type="button"
                  onClick={copyEmail}
                  className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                  title="Copy email"
                >
                  {copiedEmail ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                </button>
              </div>

              {user.contact_number && (
                <div className="flex items-center gap-2.5 text-slate-700 pt-2 border-t border-slate-100">
                  <Phone size={14} className="text-[#e8583a] shrink-0" />
                  <span className="font-medium">{user.contact_number}</span>
                </div>
              )}
            </div>
          </div>

          {/* Reports to Section */}
          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase block mb-1.5">
              Reports to
            </span>
            {manager ? (
              <div
                onClick={() => onSelectUser(manager)}
                className="p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-xs transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: managerDeptColor.text }}
                  >
                    {manager.username ? manager.username.slice(0, 2).toUpperCase() : 'MG'}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block truncate group-hover:text-[#e8583a] transition-colors">
                      {manager.username}
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {manager.designation || manager.role}
                    </span>
                  </div>
                </div>
                <ChevronRight
                  size={15}
                  className="text-slate-400 group-hover:text-[#e8583a] transition-transform group-hover:translate-x-0.5"
                />
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-center gap-2">
                <Crown size={15} className="text-amber-600 shrink-0" />
                <span className="font-semibold">Top of the organization</span>
              </div>
            )}
          </div>

          {/* Direct reports Section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase block">
                Direct reports ({directReports.length}) · team of {teamOfM}
              </span>
            </div>

            {directReports.length === 0 ? (
              <div className="p-3.5 rounded-xl bg-[#faf9f8] border border-slate-200/80 text-center text-xs text-slate-500">
                No direct reports assigned
              </div>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {directReports.map((report) => {
                  const repColor = getDepartmentColor(report.department);
                  return (
                    <div
                      key={report.id}
                      onClick={() => onSelectUser(report)}
                      className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-xs transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: repColor.text }}
                        >
                          {report.username ? report.username.slice(0, 2).toUpperCase() : 'DR'}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 block truncate group-hover:text-[#e8583a] transition-colors">
                            {report.username}
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate">
                            {report.designation || report.role}
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        size={14}
                        className="text-slate-400 group-hover:text-[#e8583a] transition-transform group-hover:translate-x-0.5"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Peers Section */}
          {peers.length > 0 && (
            <div>
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase block mb-1.5">
                Peers ({peers.length})
              </span>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {peers.map((peer) => {
                  const peerColor = getDepartmentColor(peer.department);
                  return (
                    <div
                      key={peer.id}
                      onClick={() => onSelectUser(peer)}
                      className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-xs transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: peerColor.text }}
                        >
                          {peer.username ? peer.username.slice(0, 2).toUpperCase() : 'PE'}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 block truncate group-hover:text-[#e8583a] transition-colors">
                            {peer.username}
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate">
                            {peer.designation || peer.role}
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        size={14}
                        className="text-slate-400 group-hover:text-[#e8583a] transition-transform group-hover:translate-x-0.5"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-[#faf9f8] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <button
              type="button"
              onClick={() => onAddDirectReport(user)}
              className="h-9 px-4 rounded-xl bg-[#e8583a] hover:bg-[#d04a2e] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <UserPlus size={14} />
              <span>Add direct report</span>
            </button>

            {canManage && onChangeManager && !isRoot && (
              <Tooltip title="Edit / Change Manager">
                <button
                  type="button"
                  onClick={() => onChangeManager(user)}
                  className="h-9 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Edit2 size={13} />
                  <span>Edit line</span>
                </button>
              </Tooltip>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canManage && onMatrixManager && (
              <Tooltip title="Manage Matrix / Dotted line">
                <button
                  type="button"
                  onClick={() => onMatrixManager(user)}
                  className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                >
                  <Layers size={14} />
                </button>
              </Tooltip>
            )}

            {!isRoot && (
              <Tooltip title="Remove employee from organization">
                <button
                  type="button"
                  onClick={() => onRemoveUser(user)}
                  className="w-9 h-9 rounded-xl bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 hover:border-red-200 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                >
                  <Trash2 size={14} />
                </button>
              </Tooltip>
            )}

            <button
              type="button"
              onClick={onClose}
              className="h-9 px-3.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
