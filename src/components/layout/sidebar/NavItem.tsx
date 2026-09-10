import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { type NavItem as NavItemType } from '@/config/navItems';
import { labelVariants } from './variants';
import { useAuth } from '../../../hooks/useAuth';
import { isSuperAdmin } from '@/utils/pagePermissions';

const getTranslatedLabel = (label: string, t: (key: string) => string) => {
  const map: Record<string, string> = {
    Dashboard: 'nav.dashboard',
    Projects: 'nav.projects',
    Tasks: 'nav.tasks',
    'Finance & Invoices': 'nav.finance',
    Expenses: 'nav.expenses',
    Payroll: 'nav.payroll',
    Inventory: 'nav.inventory',
    Items: 'nav.items',
    'Stock Levels': 'nav.stockLevels',
    Movements: 'nav.movements',
    Blogs: 'nav.blogs',
    Gallery: 'nav.gallery',
    System: 'nav.system',
    Analytics: 'nav.analytics',
    Overview: 'nav.overview',
    Reports: 'nav.reports',
    Settings: 'nav.settings',
    General: 'nav.general',
    'Roles & Permissions': 'nav.rolesPermissions',
    Integrations: 'nav.integrations',
    'Audit Log': 'nav.auditLog',
    'Check-In': 'nav.checkIn',
  };
  return map[label] ? t(map[label]) : label;
};

interface NavItemProps {
  item: NavItemType;
  isOpen: boolean;
  onOpenAccessControl?: (item: NavItemType, rect: DOMRect) => void;
}

export function NavItem({ item, isOpen, onOpenAccessControl }: NavItemProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const hasChildren = item.children && item.children.length > 0;
  const [isHovered, setIsHovered] = useState(false);
  const superAdmin = isSuperAdmin(user);
  const showEye = superAdmin && isOpen;

  // Check if a child matches current location
  const isChildActive = (childPath: string) => {
    if (childPath === item.path) {
      return location.pathname === childPath;
    }
    return (
      location.pathname === childPath ||
      (childPath !== '/' && location.pathname.startsWith(childPath + '/'))
    );
  };

  const isAnyChildActive = hasChildren
    ? item.children!.some((child) => isChildActive(child.path))
    : false;
  const isParentExactActive = location.pathname === item.path;

  // Initialize expanded state: active on route load/refresh
  const [expanded, setExpanded] = useState(isAnyChildActive || isParentExactActive);

  // Auto-expand on route change or page refresh if active
  useEffect(() => {
    if (isAnyChildActive || isParentExactActive) {
      setExpanded(true);
    }
  }, [location.pathname, isAnyChildActive, isParentExactActive]);

  const handleEyeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    onOpenAccessControl?.(item, rect);
  };

  // When clicking parent with children: navigate to first child AND keep dropdown open
  const handleParentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const firstChild = item.children && item.children.length > 0 ? item.children[0] : null;

    // Keep dropdown open
    setExpanded(true);

    if (firstChild) {
      navigate(firstChild.path);
    } else {
      navigate(item.path);
    }
  };

  // Direct chevron click allows optional collapsing
  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setExpanded((prev) => !prev);
  };

  // For items with children, clicking row navigates to default child AND stays open
  if (hasChildren) {
    return (
      <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <div className="relative flex items-center">
          <button
            onClick={handleParentClick}
            className={`relative w-full flex items-center ${isOpen ? 'justify-start gap-4 px-4' : 'justify-center'} py-3.5 rounded-lg transition-colors duration-200 group overflow-hidden cursor-pointer ${
              isAnyChildActive || isParentExactActive ? 'text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            {/* Torch glow */}
            <AnimatePresence>
              {(isAnyChildActive || isParentExactActive) && (
                <motion.div
                  key="glow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-linear-to-r from-primary/20 via-primary/5 to-transparent pointer-events-none"
                />
              )}
            </AnimatePresence>

            {/* Active indicator */}
            {(isAnyChildActive || isParentExactActive) && (
              <motion.div
                className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-r-full shadow-[0_0_12px_var(--primary-glow)] z-20"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}

            <item.icon
              size={20}
              className={`shrink-0 relative z-10 transition-colors duration-200 ${
                isAnyChildActive || isParentExactActive
                  ? 'text-primary'
                  : 'text-white/40 group-hover:text-white'
              }`}
            />

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.span
                  key={`label-${item.path}`}
                  variants={labelVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  className={`relative z-10 text-sm font-medium whitespace-nowrap overflow-hidden flex-1 text-left ${
                    isAnyChildActive || isParentExactActive
                      ? 'text-white'
                      : 'text-white/60 group-hover:text-white'
                  }`}
                >
                  {getTranslatedLabel(item.label, t)}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Chevron */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="chevron"
                  variants={labelVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  onClick={handleChevronClick}
                  className="p-1 -mr-1 hover:bg-white/10 rounded transition-colors"
                  title={expanded ? 'Collapse menu' : 'Expand menu'}
                >
                  <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronRight size={14} className="text-white/30 hover:text-white/70" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Eye icon – Super Admin only */}
          <AnimatePresence>
            {showEye && (isHovered || isAnyChildActive || isParentExactActive) && (
              <motion.button
                key="eye-btn"
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={handleEyeClick}
                title="Manage page access for this module"
                aria-label={`Manage access for ${item.label}`}
                className="absolute right-9 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md flex items-center justify-center text-primary/70 hover:text-primary hover:bg-primary/15 transition-all duration-200 z-20 border border-primary/0 hover:border-primary/25 cursor-pointer"
              >
                <Eye size={14} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Children sub-menu */}
        <AnimatePresence initial={false}>
          {expanded && isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="ml-9 pl-3 border-l border-white/10 flex flex-col gap-0.5 py-1">
                {item.children!.map((child) => {
                  const active = isChildActive(child.path);
                  return (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      end={child.path === item.path}
                      className={
                        `block px-4 py-2 rounded-md text-[13px] font-medium transition-all duration-200 animated-underline ${
                          active
                            ? 'text-white bg-primary/20 font-semibold'
                            : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                        }`
                      }
                    >
                      <span>{getTranslatedLabel(child.label, t)}</span>

                      {child.badge !== undefined && child.badge > 0 && (
                        <span className="ml-5 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                          {child.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Standard nav item (no children)
  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <NavLink
        to={item.path}
        end={item.path === '/'}
        aria-label={`Navigate to ${item.label}`}
        className={({ isActive }) =>
          `relative flex items-center ${isOpen ? 'justify-start gap-4 px-4' : 'justify-center'} py-3.5 rounded-lg transition-colors duration-200 group overflow-hidden ${
            isActive ? 'text-white' : 'text-white/40 hover:text-white'
          }`
        }
      >
        {({ isActive }) => (
          <>
            {/* Torch glow */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  key="glow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-linear-to-r from-primary/20 via-primary/5 to-transparent pointer-events-none"
                />
              )}
            </AnimatePresence>

            {/* Active indicator */}
            {isActive && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-r-full shadow-[0_0_12px_var(--primary-glow)] z-20"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}

            <item.icon
              size={20}
              className={`shrink-0 relative z-10 transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-white/40 group-hover:text-white'
              }`}
            />

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.span
                  key={`label-${item.path}`}
                  variants={labelVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  className={`relative z-10 text-sm font-medium whitespace-nowrap overflow-hidden ${
                    isActive ? 'text-white' : 'text-white/60 group-hover:text-white'
                  }`}
                >
                  {getTranslatedLabel(item.label, t)}
                </motion.span>
              )}
            </AnimatePresence>
          </>
        )}
      </NavLink>

      {/* Eye icon for single-page items – Super Admin only */}
      <AnimatePresence>
        {showEye && (isHovered || isParentExactActive) && (
          <motion.button
            key="eye-btn-single"
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            onClick={handleEyeClick}
            title={`Manage access for ${item.label}`}
            aria-label={`Manage access for ${item.label}`}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md flex items-center justify-center text-primary/70 hover:text-primary hover:bg-primary/15 transition-all duration-200 z-20 border border-primary/0 hover:border-primary/25"
          >
            <Eye size={14} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
