import { type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { canAccessPage, isSuperAdmin, AVAILABLE_ROLES, normalizeRole } from '@/utils/pagePermissions';
import { navItems } from '@/config/navItems';

interface PageAccessGuardProps {
  children: ReactNode;
}

/**
 * Wraps page routes to enforce page-level RBAC.
 * Super Admin always has full access.
 * Other roles are checked against saved page permissions or navItem defaults.
 */
export function PageAccessGuard({ children }: PageAccessGuardProps) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Super Admin bypasses all checks
  if (isSuperAdmin(user)) {
    return <>{children}</>;
  }

  // Find the current pathname's default roles from navItems for context
  const currentPath = location.pathname;

  // Get default roles from the matching navItem child or parent
  let defaultRoles: string[] | undefined;
  for (const item of navItems) {
    if (item.path === currentPath) {
      defaultRoles = item.roles?.map(String);
      break;
    }
    if (item.children) {
      const child = item.children.find(
        (c) => c.path === currentPath || currentPath.startsWith(c.path + '/')
      );
      if (child) {
        defaultRoles = child.roles?.map(String);
        break;
      }
    }
  }

  // Check access
  const hasAccess = canAccessPage(currentPath, user, defaultRoles);

  if (!hasAccess) {
    const userRoleLabel = AVAILABLE_ROLES.find(
      (r) => normalizeRole(r.id) === normalizeRole(user?.role || '')
    )?.label || user?.role || 'your role';

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, type: 'spring', bounce: 0.4 }}
          className="w-24 h-24 rounded-3xl bg-error/10 border border-error/20 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(225,29,72,0.12)]"
        >
          <ShieldAlert size={40} className="text-error" />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h1 className="text-3xl font-black text-foreground mb-2 tracking-tight">
            Access Restricted
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-md mx-auto">
            The page{' '}
            <code className="font-mono text-sm px-2 py-0.5 rounded-md bg-surface-subtle border border-border-subtle text-foreground">
              {currentPath}
            </code>{' '}
            is not accessible for <strong>{userRoleLabel}</strong>.
          </p>
          <p className="text-muted text-sm mt-2">
            Contact your Super Admin to request access to this page.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="flex items-center gap-3 mt-10"
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border-subtle bg-surface-subtle text-foreground text-sm font-semibold hover:bg-surface-elevated transition-colors"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-hover shadow-[0_0_15px_rgba(232,88,58,0.25)] transition-all duration-200"
          >
            <LayoutDashboard size={16} />
            Go to Dashboard
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return <>{children}</>;
}
