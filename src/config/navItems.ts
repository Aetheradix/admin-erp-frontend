// import {
//   BarChart3,
//   Building2,
//   CheckSquare,
//   CreditCard,
//   LayoutDashboard,
//   Package,
//   Settings,
//   Users2,
//   Clock,
//   FileText,
//   Image,
//   type LucideIcon
// } from 'lucide-react';

// export interface NavChild {
//   label: string;
//   path: string;
// }

// export interface NavItem {
//   label: string;
//   path: string;
//   icon: LucideIcon;
//   role?: 'admin' | 'employee' | string;
//   category?: 'OVERVIEW' | 'MANAGEMENT' | 'SYSTEM';
//   description?: string;
//   children?: NavChild[];
// }

// export const navItems: NavItem[] = [
//   // ── OVERVIEW ──────────────────────────────────────
//   {
//     label: 'Dashboard',
//     path: '/',
//     icon: LayoutDashboard,
//     category: 'OVERVIEW',
//     description: 'Overview of operations'
//   },
//   {
//     label: 'Check-In',
//     path: '/checkin',
//     icon: Clock,
//     category: 'OVERVIEW',
//     description: 'Attendance Center'
//   },

//   // ── MANAGEMENT ────────────────────────────────────
//   {
//     label: 'Organization',
//     path: '/org',
//     icon: Building2,
//     category: 'MANAGEMENT',
//     description: 'Company profile'
//   },
//   {
//     label: 'Teams',
//     path: '/teams',
//     icon: Users2,
//     category: 'MANAGEMENT',
//     description: 'Team management'
//   },
//   {
//     label: 'Team',
//     path: '/staff',
//     icon: Users2,
//     category: 'MANAGEMENT',
//     description: 'Internal team directory'
//   },
//   {
//     label: 'Tasks',
//     path: '/tasks',
//     icon: CheckSquare,
//     category: 'MANAGEMENT',
//     description: 'Task management'
//   },
//   {
//     label: 'Finance',
//     path: '/finance',
//     icon: CreditCard,
//     category: 'MANAGEMENT',
//     description: 'Financial management',
//     children: [
//       { label: 'Overview', path: '/finance' },
//       { label: 'Invoices', path: '/finance/invoices' },
//       { label: 'Expenses', path: '/finance/expenses' },
//       { label: 'Payroll', path: '/finance/payroll' },
//     ]
//   },
//   {
//     label: 'Inventory',
//     path: '/inventory',
//     icon: Package,
//     category: 'MANAGEMENT',
//     description: 'Stock management',
//     children: [
//       { label: 'Items', path: '/inventory' },
//       { label: 'Stock Levels', path: '/inventory/stock-levels' },
//       { label: 'Movements', path: '/inventory/movements' },
//     ]
//   },
//   {
//     label: 'Blogs',
//     path: '/blogs',
//     icon: FileText,
//     category: 'MANAGEMENT',
//     description: 'Content management'
//   },
//   {
//     label: 'Gallery',
//     path: '/gallery',
//     icon: Image,
//     category: 'MANAGEMENT',
//     description: 'Asset library'
//   },

//   // ── SYSTEM ────────────────────────────────────────
//   {
//     label: 'Analytics',
//     path: '/analytics',
//     icon: BarChart3,
//     role: 'admin',
//     category: 'SYSTEM',
//     description: 'Business insights',
//     children: [
//       { label: 'Overview', path: '/analytics' },
//       { label: 'Reports', path: '/analytics/reports' },
//     ]
//   },
//   {
//     label: 'Settings',
//     path: '/settings',
//     icon: Settings,
//     category: 'SYSTEM',
//     description: 'System preferences',
//     children: [
//       { label: 'General', path: '/settings' },
//       { label: 'Roles & Permissions', path: '/settings/roles' },
//       { label: 'Integrations', path: '/settings/integrations' },
//       { label: 'Audit Log', path: '/settings/audit-log' },
//     ]
//   },
// ];

import {
  BarChart3,
  Building2,
  CalendarDays,
  CheckSquare,
  CreditCard,
  LayoutDashboard,
  Package,
  Settings,
  Clock,
  FileText,
  Image,
  type LucideIcon,
} from 'lucide-react';


export type UserRole = 'SuperAdmin' | 'Admin' | 'HrAdmin' | 'FinanceAdmin' | 'Employee';

export interface NavChild {
  label: string;
  path: string;
  roles?: UserRole[];
  badge?: number;
}

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  roles?: UserRole[];
  category?: 'OVERVIEW' | 'MANAGEMENT' | 'SYSTEM';
  description?: string;
  badge?: number;
  children?: NavChild[];
}

export const navItems: NavItem[] = [
  // ─────────────────────────────────────────────
  // OVERVIEW
  // ─────────────────────────────────────────────
  {
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    category: 'OVERVIEW',
    description: 'Overview of operations',
    roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'FinanceAdmin', 'Employee'],
  },
  {
    label: 'Check-In',
    path: '/checkin',
    icon: Clock,
    category: 'OVERVIEW',
    description: 'Attendance Center',
    roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'Employee', 'FinanceAdmin'],
  },

  // ─────────────────────────────────────────────
  // MANAGEMENT
  // ─────────────────────────────────────────────
  {
    label: 'Organization',
    path: '/org',
    icon: Building2,
    category: 'MANAGEMENT',
    description: 'Company profile',
    roles: ['SuperAdmin', 'Admin', 'HrAdmin'],
    children: [
      {
        label: 'New Accounts',
        path: '/org/approvals',
        roles: ['SuperAdmin', 'Admin', 'HrAdmin'],
      },
      {
        label: 'Teams',
        path: '/teams',
        roles: ['SuperAdmin', 'Admin', 'HrAdmin'],
      },
      {
        label: 'Team',
        path: '/staff',
        roles: ['SuperAdmin', 'Admin', 'HrAdmin'],
      },
    ],
  },
  {
    label: 'Tasks',
    path: '/tasks',
    icon: CheckSquare,
    category: 'MANAGEMENT',
    description: 'Task management',
    roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'Employee'],
  },
  {
  label: 'Resource Booking',
  path: '/resource-booking',
  icon: CalendarDays,
  category: 'MANAGEMENT',
  description: 'Book and manage company resources',
  roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'Employee'],
  children: [
    {
      label: 'Book Resource',
      path: '/resource-booking',
      roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'Employee'],
    },
    {
      label: 'My Bookings',
      path: '/resource-booking/my-bookings',
      roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'Employee'],
    },
    {
      label: 'Calendar',
      path: '/resource-booking/calendar',
      roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'Employee'],
    },
    {
      label: 'All Bookings',
      path: '/resource-booking/all',
      roles: ['SuperAdmin', 'Admin', 'HrAdmin'],
    },
  ],
},

  {
    label: 'Finance',
    path: '/finance',
    icon: CreditCard,
    category: 'MANAGEMENT',
    description: 'Financial management',
    roles: ['SuperAdmin', 'Admin', 'FinanceAdmin', 'HrAdmin', 'Employee'],
    children: [
      {
        label: 'Overview',
        path: '/finance',
        roles: ['SuperAdmin', 'Admin', 'FinanceAdmin'],
      },
      {
        label: 'Invoices',
        path: '/finance/invoices',
        roles: ['SuperAdmin', 'FinanceAdmin', 'Admin'],
      },
      {
        label: 'Expenses',
        path: '/finance/expenses',
        roles: ['SuperAdmin', 'FinanceAdmin', 'Admin'],
      },
      {
        label: 'Payroll',
        path: '/finance/payroll',
        roles: ['SuperAdmin', 'FinanceAdmin', 'Employee', 'Admin', 'HrAdmin'],
      },
    ],
  },
  {
    label: 'Inventory',
    path: '/inventory',
    icon: Package,
    category: 'MANAGEMENT',
    description: 'Stock management',
    roles: ['SuperAdmin', 'Admin'],
    children: [
      {
        label: 'Items',
        path: '/inventory',
        roles: ['SuperAdmin', 'Admin'],
      },
      {
        label: 'Stock Levels',
        path: '/inventory/stock-levels',
        roles: ['SuperAdmin', 'Admin'],
      },
      {
        label: 'Movements',
        path: '/inventory/movements',
        roles: ['SuperAdmin', 'Admin'],
      },
    ],
  },
  {
    label: 'Blogs',
    path: '/blogs',
    icon: FileText,
    category: 'MANAGEMENT',
    description: 'Content management',
    roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'FinanceAdmin'],
  },
  {
    label: 'Gallery',
    path: '/gallery',
    icon: Image,
    category: 'MANAGEMENT',
    description: 'Asset library',
    roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'Employee'],
  },

  // ─────────────────────────────────────────────
  // SYSTEM
  // ─────────────────────────────────────────────
  {
    label: 'Analytics',
    path: '/analytics',
    icon: BarChart3,
    category: 'SYSTEM',
    description: 'Business insights',
    roles: ['SuperAdmin', 'Admin'],
    children: [
      {
        label: 'Overview',
        path: '/analytics',
        roles: ['SuperAdmin', 'Admin'],
      },
      {
        label: 'Reports',
        path: '/analytics/reports',
        roles: ['SuperAdmin'],
      },
    ],
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    category: 'SYSTEM',
    description: 'System preferences',
    roles: ['SuperAdmin', 'Admin'],
    children: [
      {
        label: 'General',
        path: '/settings',
        roles: ['SuperAdmin', 'Admin'],
      },
      {
        label: 'Roles & Permissions',
        path: '/settings/roles',
        roles: ['SuperAdmin'],
      },
      {
        label: 'Integrations',
        path: '/settings/integrations',
        roles: ['SuperAdmin', 'Admin'],
      },
      {
        label: 'Audit Log',
        path: '/settings/audit-log',
        roles: ['SuperAdmin', 'FinanceAdmin'],
      },
    ],
  },
];

/**
 * Helper function to determine whether the user
 * can access a menu item or child page.
 */
export const hasAccess = (roles: UserRole[] | undefined, userRole: UserRole): boolean => {
  if (!roles || roles.length === 0) return true;
  return roles.includes(userRole);
};
