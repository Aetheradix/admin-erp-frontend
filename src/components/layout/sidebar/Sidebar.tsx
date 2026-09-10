import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { navItems, type NavItem as NavItemType } from '@/config/navItems';
import { Button } from '@/components/ui/primitives/Button';
import { usePendingUsers } from '@/pages/settings/hooks/usePendingUsers';
import { SidebarLogo } from './SidebarLogo';
import { NavSection } from './NavSection';
import { SidebarFooter } from './SidebarFooter';
import { sidebarVariants } from './variants';
import { PageAccessPanel } from './PageAccessPanel';
import { canAccessPage, isSuperAdmin } from '@/utils/pagePermissions';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_CATEGORIES = ['OVERVIEW', 'MANAGEMENT', 'SYSTEM'] as const;

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pendingUsers } = usePendingUsers();
  const pendingUsersCount = pendingUsers.length;

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const [configVersion, setConfigVersion] = useState(0);

  // PageAccessPanel state – tracked separately so it re-reads perms on every open
  const [accessPanelItem, setAccessPanelItem] = useState<NavItemType | null>(null);
  const [accessPanelTriggerRect, setAccessPanelTriggerRect] = useState<DOMRect | null>(null);

  const handleOpenAccessPanel = (item: NavItemType, rect: DOMRect) => {
    setAccessPanelItem(item);
    setAccessPanelTriggerRect(rect);
  };

  const handleCloseAccessPanel = () => {
    setAccessPanelItem(null);
    setAccessPanelTriggerRect(null);
    // Bump configVersion so nav re-renders with fresh permissions
    setConfigVersion((v) => v + 1);
  };

  useEffect(() => {
    const handleConfigChange = () => {
      setConfigVersion((v) => v + 1);
    };

    window.addEventListener('erp_config_changed', handleConfigChange);
    window.addEventListener('storage', handleConfigChange);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('erp_permissions_channel');
      channel.onmessage = () => {
        handleConfigChange();
      };
    } catch {
      // BroadcastChannel fallback
    }

    return () => {
      window.removeEventListener('erp_config_changed', handleConfigChange);
      window.removeEventListener('storage', handleConfigChange);
      if (channel) {
        channel.close();
      }
    };
  }, []);

  const sectionConfig = (() => {
    const saved = localStorage.getItem('erp_sections_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fall through
      }
    }
    return {
      maxSections: 12,
      visibleSections: {} as Record<string, boolean>,
    };
  })();

  const erpRoles = (() => {
    const saved = localStorage.getItem('erp_roles');
    if (saved) {
      try {
        return JSON.parse(saved) as any[];
      } catch {
        // fall through
      }
    }
    return [];
  })();

  const currentUserRoleName = (() => {
    if (!user) return 'Viewer';

    switch (user.role) {
      case 'SuperAdmin':
        return 'Super Admin';

      case 'Admin':
        return 'Admin';

      case 'HrAdmin':
        return 'HR Admin';

      case 'FinanceAdmin':
        return 'Finance Admin';

      case 'Employee':
        return 'Employee';

      default:
        return 'Viewer';
    }
  })();

  const labelToPermissionKey = (label: string): string | null => {
    const lower = label.toLowerCase();
    if (lower === 'organization' || lower === 'teams' || lower === 'team') return 'users';
    if (lower === 'tasks') return 'projects';
    if (lower === 'finance') return 'finance';
    if (lower === 'inventory') return 'inventory';
    if (lower === 'settings') return 'settings';
    if (lower === 'analytics') return 'reports';
    if (lower.includes('resource')) return 'resource_booking';
    if (lower.includes('event')) return 'events';
    if (lower === 'blogs') return 'blogs';
    if (lower === 'gallery') return 'gallery';
    return null;
  };

  const isSuperAdminUser = isSuperAdmin(user);

  // 1. Initial filter by base roles, global sections, and dynamic role permissions
  const filteredNavItems = navItems.filter((item) => {
    if (isSuperAdminUser) return true;

    // 1. Check static user role access
    if (item.roles && user?.role && !item.roles.includes(user.role)) {
      return false;
    }

    // 2. Global Section Toggle from Settings
    if (sectionConfig.visibleSections && sectionConfig.visibleSections[item.label] === false) {
      return false;
    }

    // 3. Dynamic role permissions
    const permKey = labelToPermissionKey(item.label);
    if (permKey) {
      const roleObj = erpRoles.find((r) => r.name === currentUserRoleName);
      if (roleObj && roleObj.permissions && roleObj.permissions[permKey] === false) {
        return false;
      }
    }

    return true;
  });

  const slicedNavItems = filteredNavItems.slice(0, sectionConfig.maxSections || 12);

  // 2. Filter children and parent modules based on Page Access Permissions
  const navItemsWithBadge = slicedNavItems
    .map((item) => {
      if (isSuperAdminUser) {
        return {
          ...item,
          children: item.children?.map((child) => ({
            ...child,
            badge: child.path === '/org/approvals' ? pendingUsersCount : undefined,
          })),
        };
      }

      // If module has sub-pages, filter each child by canAccessPage
      if (item.children && item.children.length > 0) {
        const allowedChildren = item.children
          .filter((child) => canAccessPage(child.path, user, child.roles?.map(String)))
          .map((child) => ({
            ...child,
            badge: child.path === '/org/approvals' ? pendingUsersCount : undefined,
          }));

        return {
          ...item,
          children: allowedChildren,
        };
      }

      return {
        ...item,
      };
    })
    .filter((item) => {
      // Super Admin always sees all modules
      if (isSuperAdminUser) return true;

      const originalItem = navItems.find((n) => n.path === item.path && n.label === item.label);

      // If this module originally had sub-pages:
      if (originalItem?.children && originalItem.children.length > 0) {
        // If there are still accessible sub-pages, keep it!
        if (item.children && item.children.length > 0) {
          return true;
        }
        // If all sub-pages were restricted, check if the parent path itself is explicitly accessible
        return canAccessPage(item.path, user, item.roles?.map(String));
      }

      // Single-page module (no sub-pages, e.g. Tasks, Blogs, Gallery):
      return canAccessPage(item.path, user, item.roles?.map(String));
    });

  return (
    <motion.aside
      custom={isMobile}
      variants={sidebarVariants}
      animate={isOpen ? 'open' : 'closed'}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed lg:static inset-y-0 left-0 z-40 h-full bg-[#0d0d0d] flex flex-col border-r border-white/5 overflow-hidden"
    >
      {/* Mobile close */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="close-btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 right-4 lg:hidden z-50"
          >
            <Button
              variant="ghost"
              onClick={onClose}
              className="p-2 text-white/50 hover:text-white transition-colors"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <SidebarLogo isOpen={isOpen} />

      <nav
        key={`nav-config-${configVersion}`}
        className="flex-1 py-4 px-3 flex flex-col gap-2 overflow-y-auto no-scrollbar scroll-smooth"
      >
        {NAV_CATEGORIES.map((category) => (
          <NavSection
            key={category}
            category={category}
            items={navItemsWithBadge.filter((item) => item.category === category)}
            isOpen={isOpen}
            onOpenAccessControl={isSuperAdminUser ? handleOpenAccessPanel : undefined}
          />
        ))}
      </nav>

      <SidebarFooter isOpen={isOpen} onLogout={handleLogout} />

      <AnimatePresence>
        {accessPanelItem && (
          <PageAccessPanel
            key={accessPanelItem.path}
            moduleItem={
              navItems.find((n) => n.path === accessPanelItem.path) || accessPanelItem
            }
            triggerRect={accessPanelTriggerRect}
            onClose={handleCloseAccessPanel}
          />
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
