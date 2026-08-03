import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { navItems } from '@/config/navItems';
import { Button } from '@/components/ui/primitives/Button';

import { SidebarLogo } from './SidebarLogo';
import { NavSection } from './NavSection';
import { SidebarFooter } from './SidebarFooter';
import { sidebarVariants } from './variants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_CATEGORIES = ['OVERVIEW', 'MANAGEMENT', 'SYSTEM'] as const;

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  useEffect(() => {
    const handleConfigChange = () => {
      setConfigVersion((v) => v + 1);
    };
    window.addEventListener('erp_config_changed', handleConfigChange);
    return () => {
      window.removeEventListener('erp_config_changed', handleConfigChange);
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
      visibleSections: {} as Record<string, boolean>
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

  // const currentUserRoleName = (() => {
  //   if (!user) return 'Viewer';
  //   const desc = user.designation?.toLowerCase() || '';
  //   if (desc.includes('super admin')) return 'Super Admin';
  //   if (desc.includes('admin')) return 'Admin';
  //   if (desc.includes('manager')) return 'Manager';
  //   if (desc.includes('developer') || desc.includes('engineer')) return 'Developer';

  //   if (user.role === 'admin') return 'Admin';
  //   return 'Viewer';
  // })();

  const currentUserRoleName = (() => {
    if (!user) return 'Viewer';

    switch(user.role) {
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
    return null;
  };

  // const filteredNavItems = navItems.filter((item) => {
  //   // 1. Basic Role Check
  //   if (item.roles && item.roles !== user?.role) return false;

  //   // 2. Global Section Toggle check
  //   if (sectionConfig.visibleSections && sectionConfig.visibleSections[item.label] === false) return false;

  //   // 3. Role-based check
  //   const permKey = labelToPermissionKey(item.label);
  //   if (permKey) {
  //     const roleObj = erpRoles.find((r) => r.name === currentUserRoleName);
  //     if (roleObj && roleObj.permissions[permKey] === false) {
  //       return false;
  //     }
  //   }

  //   return true;
  // });


  const filteredNavItems = navItems.filter((item) => {
    // 1. Check user role access
    if ( item.roles && user?.role && !item.roles.includes(user.role)) {
        return false;
    }

    // 2. Global Section Toggle
    if (sectionConfig.visibleSections && sectionConfig.visibleSections[item.label] === false) {
        return false;
    }

    // 3. Dynamic role permissions
    const permKey = labelToPermissionKey(item.label);

    if (permKey) {
        const roleObj = erpRoles.find((r) => r.name === currentUserRoleName);
        if (roleObj && roleObj.permissions[permKey] === false) {
            return false;
        }
    }
    return true;
});

console.log("Logged user:", user);
console.log("Current role:", user?.role);
console.log("Role name:", currentUserRoleName);
console.log("Sidebar items:", filteredNavItems);

  const slicedNavItems = filteredNavItems.slice(0, sectionConfig.maxSections || 12);
  return (
    <motion.aside
      custom={isMobile}
      variants={sidebarVariants}
      animate={isOpen ? 'open' : 'closed'}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed lg:static inset-y-0 left-0 z-40 h-full bg-primary-foreground  flex flex-col border-r border-white/5 overflow-hidden"
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

      <nav key={`nav-config-${configVersion}`} className="flex-1 py-4 px-3 flex flex-col gap-2 overflow-y-auto no-scrollbar scroll-smooth">
        {NAV_CATEGORIES.map((category) => (
          <NavSection
            key={category}
            category={category}
            items={slicedNavItems.filter((item) => item.category === category)}
            isOpen={isOpen}
          />
        ))}
      </nav>

      <SidebarFooter isOpen={isOpen} onLogout={handleLogout} />
    </motion.aside>
  );
}
