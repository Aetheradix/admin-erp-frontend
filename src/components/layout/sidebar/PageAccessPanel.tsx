import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Shield,
  Check,
  Search,
  ChevronDown,
  Lock,
  RotateCcw,
} from 'lucide-react';
import type { NavItem } from '@/config/navItems';
import {
  AVAILABLE_ROLES,
  getEffectivePageRoles,
  getStoredPagePermissions,
  saveStoredPagePermissions,
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
  const [openDropdownPath, setOpenDropdownPath] = useState<string | null>(null);

  // Initialize permissions state for all children in this module
  const [pageRoles, setPageRoles] = useState<Record<string, string[]>>(() => {
    const stored = getStoredPagePermissions();
    const initial: Record<string, string[]> = {};

    const children = moduleItem.children || [];
    children.forEach((child) => {
      const defaultRoles = child.roles ? child.roles.map(String) : moduleItem.roles?.map(String);
      initial[child.path] = stored[child.path] || getEffectivePageRoles(child.path, defaultRoles);
    });

    return initial;
  });

  // Calculate popover positioning near the trigger
  const [position, setPosition] = useState<{ top: number; left: number }>({
    top: 100,
    left: 280,
  });

  useEffect(() => {
    if (triggerRect) {
      const isMobile = window.innerWidth < 1024;
      if (isMobile) {
        // Center on mobile
        return;
      }
      const panelHeight = 520;
      const windowHeight = window.innerHeight;
      let top = triggerRect.top;

      // Ensure panel doesn't flow below screen
      if (top + panelHeight > windowHeight - 20) {
        top = Math.max(20, windowHeight - panelHeight - 20);
      }

      const left = Math.min(triggerRect.right + 12, window.innerWidth - 460);
      setPosition({ top, left });
    }
  }, [triggerRect]);

  // Close on outside click
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

  const toggleRoleForPage = (path: string, roleId: string) => {
    if (roleId === 'SuperAdmin') return; // SuperAdmin is permanent

    setPageRoles((prev) => {
      const current = prev[path] || ['SuperAdmin'];
      const exists = current.includes(roleId);
      const updated = exists
        ? current.filter((r) => r !== roleId)
        : [...current, roleId];

      // Always keep SuperAdmin
      if (!updated.includes('SuperAdmin')) {
        updated.unshift('SuperAdmin');
      }

      return {
        ...prev,
        [path]: updated,
      };
    });
  };

  const selectAllRolesForPage = (path: string) => {
    setPageRoles((prev) => ({
      ...prev,
      [path]: AVAILABLE_ROLES.map((r) => r.id),
    }));
  };

  const resetNonAdminForPage = (path: string) => {
    setPageRoles((prev) => ({
      ...prev,
      [path]: ['SuperAdmin'],
    }));
  };

  const resetAllToDefaults = () => {
    const initial: Record<string, string[]> = {};
    const children = moduleItem.children || [];
    children.forEach((child) => {
      const defaultRoles = child.roles ? child.roles.map(String) : moduleItem.roles?.map(String);
      initial[child.path] = defaultRoles || ['SuperAdmin', 'Admin'];
    });
    setPageRoles(initial);
    showToast({
      severity: 'info',
      summary: 'Reset to Defaults',
      detail: `Permissions for ${moduleItem.label} reset to original settings. Click Save to apply.`,
    });
  };

  const handleSave = () => {
    const stored = getStoredPagePermissions();
    const updated = {
      ...stored,
      ...pageRoles,
    };
    saveStoredPagePermissions(updated);

    showToast({
      severity: 'success',
      summary: 'Permissions Updated',
      detail: `Access rules for "${moduleItem.label}" updated successfully.`,
      life: 4000,
    });

    onClose();
  };

  const filteredChildren = (moduleItem.children || []).filter((child) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      child.label.toLowerCase().includes(query) ||
      child.path.toLowerCase().includes(query)
    );
  });

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  return (
    <div
      className={`fixed inset-0 z-50 ${
        isMobile ? 'flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm' : 'pointer-events-none'
      }`}
    >
      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ type: 'spring', duration: 0.25, bounce: 0.1 }}
        style={
          isMobile
            ? undefined
            : {
                top: position.top,
                left: position.left,
              }
        }
        className={`pointer-events-auto w-full max-w-[460px] bg-[#121215] border border-white/10 rounded-2xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden text-white backdrop-blur-xl ${
          isMobile ? 'max-h-[90vh]' : 'fixed max-h-[580px]'
        }`}
      >
        {/* Panel Header */}
        <div className="relative px-5 pt-5 pb-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary shadow-[0_0_12px_rgba(232,88,58,0.2)] shrink-0">
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
                  Page Access Management & Role Permissions
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

          {/* Search bar if multiple pages */}
          {(moduleItem.children?.length || 0) > 3 && (
            <div className="mt-3.5 relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                type="text"
                placeholder="Filter module pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          )}
        </div>

        {/* Pages List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 custom-scrollbar">
          <div className="flex items-center justify-between text-[11px] font-semibold text-white/40 uppercase tracking-wider px-1">
            <span>Pages ({filteredChildren.length})</span>
            <span>Role-Based Access</span>
          </div>

          {filteredChildren.length === 0 ? (
            <div className="text-center py-8 text-white/40 text-xs">
              No matching pages found for "{searchQuery}"
            </div>
          ) : (
            filteredChildren.map((child) => {
              const currentRoles = pageRoles[child.path] || ['SuperAdmin'];
              const isDropdownOpen = openDropdownPath === child.path;

              // Format summary text
              const nonSuperRoles = currentRoles.filter((r) => r !== 'SuperAdmin');
              let roleSummary = 'Super Admin Only';
              if (nonSuperRoles.length === AVAILABLE_ROLES.length - 1) {
                roleSummary = 'All Roles';
              } else if (nonSuperRoles.length > 0) {
                const labels = nonSuperRoles.map(
                  (rid) => AVAILABLE_ROLES.find((ar) => ar.id === rid)?.label || rid
                );
                if (labels.length <= 2) {
                  roleSummary = labels.join(', ');
                } else {
                  roleSummary = `${labels[0]}, +${labels.length - 1} more`;
                }
              }

              return (
                <div
                  key={child.path}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/80 shrink-0" />
                        <span className="text-sm font-semibold text-white truncate">
                          {child.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-white/40 font-mono pl-3.5 block truncate">
                        {child.path}
                      </span>
                    </div>

                    {/* Role Dropdown Selector */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenDropdownPath(isDropdownOpen ? null : child.path)
                        }
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                          isDropdownOpen
                            ? 'bg-primary/20 text-white border-primary/50'
                            : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <span className="max-w-[140px] truncate">{roleSummary}</span>
                        <ChevronDown
                          size={13}
                          className={`text-white/50 transition-transform duration-200 ${
                            isDropdownOpen ? 'rotate-180 text-primary' : ''
                          }`}
                        />
                      </button>

                      {/* Dropdown Popover */}
                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 5 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-1.5 z-30 w-64 bg-[#18181c] border border-white/15 rounded-xl p-2.5 shadow-2xl shadow-black"
                          >
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                                Who can access this page?
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => selectAllRolesForPage(child.path)}
                                  className="text-[10px] text-primary hover:underline font-semibold"
                                >
                                  All
                                </button>
                                <span className="text-white/20 text-[10px]">|</span>
                                <button
                                  type="button"
                                  onClick={() => resetNonAdminForPage(child.path)}
                                  className="text-[10px] text-white/50 hover:text-white font-semibold"
                                >
                                  Clear
                                </button>
                              </div>
                            </div>

                            <div className="space-y-1">
                              {AVAILABLE_ROLES.map((role) => {
                                const isChecked = currentRoles.includes(role.id);
                                const isLocked = role.isSuperAdmin;

                                return (
                                  <label
                                    key={role.id}
                                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors select-none ${
                                      isLocked
                                        ? 'opacity-85 cursor-not-allowed bg-white/[0.02]'
                                        : 'cursor-pointer hover:bg-white/5 text-white/90'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        disabled={isLocked}
                                        onChange={() =>
                                          toggleRoleForPage(child.path, role.id)
                                        }
                                        className="rounded border-white/20 text-primary focus:ring-0 focus:ring-offset-0 bg-white/10 cursor-pointer accent-primary"
                                      />
                                      <span
                                        className={
                                          isLocked
                                            ? 'font-bold text-white'
                                            : 'font-medium text-white/80'
                                        }
                                      >
                                        {role.label}
                                      </span>
                                    </div>

                                    {isLocked && (
                                      <span
                                        className="flex items-center gap-1 text-[9px] text-amber-400 font-bold uppercase px-1.5 py-0.5 rounded bg-amber-400/10"
                                        title="Super Admin has access by default"
                                      >
                                        <Lock size={9} />
                                        Default
                                      </span>
                                    )}
                                  </label>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Panel Footer */}
        <div className="px-5 py-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={resetAllToDefaults}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-primary hover:bg-primary-hover shadow-[0_0_15px_rgba(232,88,58,0.3)] transition-all duration-200 active:scale-95"
            >
              <Check size={14} />
              <span>Save Permissions</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
