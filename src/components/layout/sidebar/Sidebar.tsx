import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { navItems } from '@/config/navItems';
import { useGetMyPermissionsQuery } from '@/store/api/permissionSlice';
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
  const { data: permissions = {} } = useGetMyPermissionsQuery(undefined, {
    skip: !user
  });

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

  const TOGGLEABLE_FEATURES = ['Finance', 'Attendance', 'Blogs', 'Gallery', 'Events', 'Careers', 'Grievances', 'Guest Pass', 'Approvals'];


  const filteredNavItems = navItems.filter((item) => {
    // 1. Basic Role Check
    if (item.role && item.role !== user?.role) return false;

    // 2. Feature Toggle Check for non-admins
    if (user?.role !== 'admin' && TOGGLEABLE_FEATURES.includes(item.label)) {
      // If the feature is explicitly disabled, hide it
      if (permissions[item.label] === false) return false;
    }

    return true;
  });


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

      <nav className="flex-1 py-4 px-3 flex flex-col gap-2 overflow-y-auto no-scrollbar scroll-smooth">
        {NAV_CATEGORIES.map((category) => (
          <NavSection
            key={category}
            category={category}
            items={filteredNavItems.filter((item) => item.category === category)}
            isOpen={isOpen}
          />
        ))}
      </nav>

      <SidebarFooter isOpen={isOpen} onLogout={handleLogout} />
    </motion.aside>
  );
}
