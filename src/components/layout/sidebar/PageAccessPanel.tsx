import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Shield,
  Check,
  Search,
  Lock,
  RotateCcw,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import type { NavItem } from '@/config/navItems';
import {
  AVAILABLE_ROLES,
  getEffectivePageRoles,
  getStoredPagePermissions,
  saveStoredPagePermissions,
  normalizeRole,
} from '@/utils/pagePermissions';
import { showToast } from '@/components/ui/composed/Toast.utils';

interface PageAccessPanelProps {
  moduleItem: NavItem;
  triggerRect: DOMRect | null;
  onClose: () => void;
}

export function PageAccessPanel({
  moduleItem,
  triggerRect,
  onClose,
}: PageAccessPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Target role tab – default to 'Employee' as that is what admins configure most
  const [selectedRole, setSelectedRole] = useState<string>('Employee');

  // Determine the target pages to configure:
  // If module has children, configure each child page.
  // If module has no children, configure the module page itself!
  const targetPages = useMemo(() => {
    if (moduleItem.children && moduleItem.children.length > 0) {
      return moduleItem.children;
    }
    return [
      {
        label: moduleItem.label,
        path: moduleItem.path,
        roles: moduleItem.roles,
      },
    ];
  }, [moduleItem]);

  // Permissions state: { [pagePath]: string[] (allowed role ids) }
  const [pageRoles, setPageRoles] = useState<Record<string, string[]>>(() => {
    const stored = getStoredPagePermissions();
    const initial: Record<string, string[]> = {};

    targetPages.forEach((page) => {
      const defaultRoles = page.roles
        ? page.roles.map(String)
        : moduleItem.roles?.map(String);
      initial[page.path] =
        stored[page.path] || getEffectivePageRoles(page.path, defaultRoles);
    });

    return initial;
  });

  // Calculate popover positioning near the trigger
  const [position, setPosition] = useState<{ top: number; left: number }>({
    top: 80,
    left: 280,
  });

  useEffect(() => {
    if (triggerRect) {
      const isMobile = window.innerWidth < 1024;
      if (isMobile) return;

      const panelHeight = 560;
      const windowHeight = window.innerHeight;
      let top = triggerRect.top - 20;

      if (top + panelHeight > windowHeight - 20) {
        top = Math.max(20, windowHeight - panelHeight - 20);
      }

      const left = Math.min(triggerRect.right + 14, window.innerWidth - 500);
      setPosition({ top, left });
    }
  }, [triggerRect]);

  // Close on outside click or Escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Helper to persist updated permissions instantly
  const persistAndSync = (updated: Record<string, string[]>) => {
    const stored = getStoredPagePermissions();
    const merged = {
      ...stored,
      ...updated,
    };
    saveStoredPagePermissions(merged);
  };

  /**
   * Toggle a single page's access for a specific role
   */
  const togglePageForRole = (path: string, roleId: string) => {
    if (roleId === 'SuperAdmin') return; // SuperAdmin cannot be disabled

    setPageRoles((prev) => {
      const current = prev[path] || ['SuperAdmin'];
      const targetNorm = normalizeRole(roleId);
      const isCurrentlyAllowed = current.some(
        (r) => normalizeRole(r) === targetNorm
      );

      let updatedRoles: string[];
      if (isCurrentlyAllowed) {
        updatedRoles = current.filter((r) => normalizeRole(r) !== targetNorm);
      } else {
        updatedRoles = [...current, roleId];
      }

      // Ensure SuperAdmin is always present
      if (!updatedRoles.includes('SuperAdmin')) {
        updatedRoles.unshift('SuperAdmin');
      }

      const next = {
        ...prev,
        [path]: updatedRoles,
      };

      // Auto-persist so toggle takes effect immediately in live sidebar!
      persistAndSync(next);
      return next;
    });
  };

  /**
   * Toggle ALL pages in this module ON / OFF for the selected role
   */
  const toggleAllForSelectedRole = (enable: boolean) => {
    if (selectedRole === 'SuperAdmin') return;

    setPageRoles((prev) => {
      const next: Record<string, string[]> = { ...prev };
      const targetNorm = normalizeRole(selectedRole);

      targetPages.forEach((page) => {
        const current = next[page.path] || ['SuperAdmin'];
        if (enable) {
          if (!current.some((r) => normalizeRole(r) === targetNorm)) {
            next[page.path] = [...current, selectedRole];
          }
        } else {
          next[page.path] = current.filter((r) => normalizeRole(r) !== targetNorm);
        }

        if (!next[page.path].includes('SuperAdmin')) {
          next[page.path].unshift('SuperAdmin');
        }
      });

      persistAndSync(next);
      return next;
    });

    showToast({
      severity: enable ? 'success' : 'warn',
      summary: enable ? 'Module Enabled' : 'Module Hidden',
      detail: `All pages in "${moduleItem.label}" are now ${
        enable ? 'visible to' : 'hidden from'
      } ${selectedRole}.`,
      life: 3000,
    });
  };

  const resetAllToDefaults = () => {
    const initial: Record<string, string[]> = {};
    targetPages.forEach((page) => {
      const defaultRoles = page.roles
        ? page.roles.map(String)
        : moduleItem.roles?.map(String);
      initial[page.path] = defaultRoles || [
        'SuperAdmin',
        'Admin',
        'HrAdmin',
        'FinanceAdmin',
        'Employee',
      ];
    });

    setPageRoles(initial);
    persistAndSync(initial);

    showToast({
      severity: 'info',
      summary: 'Reset to Defaults',
      detail: `Permissions for "${moduleItem.label}" reset to default configuration.`,
    });
  };

  const handleSaveAndClose = () => {
    persistAndSync(pageRoles);
    showToast({
      severity: 'success',
      summary: 'Permissions Saved',
      detail: `Access rules for "${moduleItem.label}" updated successfully.`,
      life: 3500,
    });
    onClose();
  };

  // Filter pages by search query
  const filteredPages = targetPages.filter((page) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      page.label.toLowerCase().includes(q) || page.path.toLowerCase().includes(q)
    );
  });

  // Calculate master toggle state for current selected role
  const isMasterRoleAllEnabled = useMemo(() => {
    if (selectedRole === 'SuperAdmin') return true;
    const targetNorm = normalizeRole(selectedRole);
    return targetPages.every((page) => {
      const roles = pageRoles[page.path] || [];
      return roles.some((r) => normalizeRole(r) === targetNorm);
    });
  }, [targetPages, pageRoles, selectedRole]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  return (
    <div
      className={`fixed inset-0 z-50 ${
        isMobile
          ? 'flex items-center justify-center p-4 bg-black/70 backdrop-blur-md'
          : 'pointer-events-none'
      }`}
    >
      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, scale: 0.94, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: -8 }}
        transition={{ type: 'spring', duration: 0.22, bounce: 0.08 }}
        style={
          isMobile
            ? undefined
            : {
                top: position.top,
                left: position.left,
              }
        }
        className={`pointer-events-auto w-full max-w-[490px] bg-[#121216] border border-white/12 rounded-2xl shadow-2xl shadow-black/90 flex flex-col overflow-hidden text-white backdrop-blur-2xl ${
          isMobile ? 'max-h-[92vh]' : 'fixed max-h-[620px]'
        }`}
      >
        {/* Panel Header */}
        <div className="relative px-5 pt-4 pb-3 border-b border-white/10 bg-gradient-to-r from-primary/10 via-white/[0.02] to-transparent">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(232,88,58,0.25)] shrink-0">
                <moduleItem.icon size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {moduleItem.label}
                  </h3>
                  <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 tracking-wider">
                    <Shield size={10} />
                    Super Admin
                  </span>
                </div>
                <p className="text-xs text-white/50 mt-0.5">
                  Live Page Visibility & Access Control
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close panel"
            >
              <X size={18} />
            </button>
          </div>

          {/* Role Filter Tabs */}
          <div className="mt-3.5 flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
              Configure Access For Role:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {AVAILABLE_ROLES.map((role) => {
                const isActive = selectedRole === role.id;
                const isSuper = role.isSuperAdmin;

                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 border ${
                      isActive
                        ? 'bg-primary text-white border-primary shadow-[0_0_12px_rgba(232,88,58,0.35)]'
                        : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {isSuper && <Lock size={10} className="text-amber-400" />}
                    <span>{role.label}</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setSelectedRole('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 border ${
                  selectedRole === 'ALL'
                    ? 'bg-primary text-white border-primary shadow-[0_0_12px_rgba(232,88,58,0.35)]'
                    : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                All Roles Matrix
              </button>
            </div>
          </div>
        </div>

        {/* Master Toggle Card (for specific role view) */}
        {selectedRole !== 'ALL' && selectedRole !== 'SuperAdmin' && (
          <div className="px-5 pt-3 pb-2 border-b border-white/5 bg-white/[0.015]">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isMasterRoleAllEnabled
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/15 text-red-400 border border-red-500/30'
                  }`}
                >
                  {isMasterRoleAllEnabled ? <Eye size={16} /> : <EyeOff size={16} />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {isMasterRoleAllEnabled ? 'Module Visible' : 'Module Hidden'} for{' '}
                    <span className="text-primary">{selectedRole}</span>
                  </h4>
                  <p className="text-[11px] text-white/50">
                    {isMasterRoleAllEnabled
                      ? 'Pages appear in sidebar for this role'
                      : 'Entire module hidden from sidebar for this role'}
                  </p>
                </div>
              </div>

              {/* Master Toggle Switch */}
              <button
                type="button"
                onClick={() => toggleAllForSelectedRole(!isMasterRoleAllEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isMasterRoleAllEnabled ? 'bg-primary' : 'bg-white/20'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isMasterRoleAllEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Search bar if multiple pages */}
        {targetPages.length > 3 && (
          <div className="px-5 pt-2 pb-1">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                type="text"
                placeholder="Filter pages in this module..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Pages Toggle List */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2.5 custom-scrollbar">
          <div className="flex items-center justify-between text-[11px] font-semibold text-white/40 uppercase tracking-wider px-1">
            <span>Pages ({filteredPages.length})</span>
            <span>
              {selectedRole === 'ALL'
                ? 'Role Badges'
                : `Toggle Visibility (${selectedRole})`}
            </span>
          </div>

          {filteredPages.length === 0 ? (
            <div className="text-center py-8 text-white/40 text-xs">
              No matching pages found for "{searchQuery}"
            </div>
          ) : (
            filteredPages.map((page) => {
              const currentRoles = pageRoles[page.path] || ['SuperAdmin'];
              const isAllowedForSelectedRole =
                selectedRole === 'SuperAdmin' ||
                currentRoles.some(
                  (r) => normalizeRole(r) === normalizeRole(selectedRole)
                );

              return (
                <div
                  key={page.path}
                  className={`p-3 rounded-xl border transition-all duration-200 ${
                    selectedRole !== 'ALL' && isAllowedForSelectedRole
                      ? 'bg-white/[0.04] border-white/12 shadow-sm'
                      : 'bg-white/[0.015] border-white/5 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            selectedRole === 'ALL' || isAllowedForSelectedRole
                              ? 'bg-primary shadow-[0_0_8px_rgba(232,88,58,0.5)]'
                              : 'bg-white/20'
                          }`}
                        />
                        <span className="text-sm font-semibold text-white truncate">
                          {page.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-white/40 font-mono pl-4 block truncate">
                        {page.path}
                      </span>
                    </div>

                    {/* Right side: Either Toggle Switch (single role) or Role Pills (ALL roles) */}
                    {selectedRole !== 'ALL' ? (
                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`text-xs font-semibold ${
                            isAllowedForSelectedRole
                              ? 'text-emerald-400'
                              : 'text-white/40'
                          }`}
                        >
                          {isAllowedForSelectedRole ? 'Visible' : 'Hidden'}
                        </span>

                        {selectedRole === 'SuperAdmin' ? (
                          <span
                            className="flex items-center gap-1 text-[10px] text-amber-400 font-bold uppercase px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20"
                            title="Super Admin always has full access"
                          >
                            <Lock size={10} />
                            Locked
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => togglePageForRole(page.path, selectedRole)}
                            aria-label={`Toggle ${page.label} for ${selectedRole}`}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isAllowedForSelectedRole
                                ? 'bg-primary'
                                : 'bg-white/20 hover:bg-white/30'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                isAllowedForSelectedRole
                                  ? 'translate-x-5'
                                  : 'translate-x-0'
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    ) : (
                      /* Matrix View of all roles */
                      <div className="flex items-center gap-1 flex-wrap justify-end max-w-[220px]">
                        {AVAILABLE_ROLES.map((role) => {
                          const isRoleChecked =
                            role.isSuperAdmin ||
                            currentRoles.some(
                              (r) => normalizeRole(r) === normalizeRole(role.id)
                            );
                          const isLocked = role.isSuperAdmin;

                          return (
                            <button
                              key={role.id}
                              type="button"
                              disabled={isLocked}
                              onClick={() => togglePageForRole(page.path, role.id)}
                              className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                                isLocked
                                  ? 'bg-amber-400/15 text-amber-300 cursor-not-allowed border border-amber-400/20'
                                  : isRoleChecked
                                  ? 'bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30'
                                  : 'bg-white/5 text-white/30 border border-white/5 hover:border-white/20'
                              }`}
                              title={
                                isLocked
                                  ? 'Super Admin (Default Access)'
                                  : `Click to ${
                                      isRoleChecked ? 'remove' : 'grant'
                                    } access for ${role.label}`
                              }
                            >
                              {role.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Panel Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={resetAllToDefaults}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
          >
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/40 hidden sm:inline flex items-center gap-1">
              <Sparkles size={11} className="text-primary" /> Auto-saved live
            </span>
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-primary hover:bg-primary-hover shadow-[0_0_15px_rgba(232,88,58,0.35)] transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Check size={14} />
              <span>Done</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
