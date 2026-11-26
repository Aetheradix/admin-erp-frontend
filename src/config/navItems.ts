import {
  Building2,
  CalendarCheck,
  CalendarDays,
  Clock,
  CreditCard,
  Gift,
  LayoutDashboard,
  Package,
  Settings,
  Share2,
  UserCheck,
  FileText,
  FolderKanban,
  CheckSquare,
  type LucideIcon,
} from 'lucide-react';

export type UserRole =
  'SuperAdmin' | 'Admin' | 'HrAdmin' | 'FinanceAdmin' | 'Employee' | 'Inventory operator';

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
    roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'Inventory operator', 'Employee'],
  },
  {
    label: 'Check-In',
    path: '/checkin',
    icon: Clock,
    category: 'OVERVIEW',
    description: 'Attendance Center',
    roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'Employee', 'FinanceAdmin'],
  },
  {
    label: 'Complete Profile',
    path: '/profile-completion',
    icon: FileText,
    category: 'OVERVIEW',
    description: 'Personal, bank & identity verification',
    roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'Employee'],
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
    roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'FinanceAdmin', 'Employee'],
    children: [
      {
        label: 'Company Profile',
        path: '/org',
        roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'FinanceAdmin', 'Employee'],
      },
      {
        label: 'User Management',
        path: '/org/approvals',
        roles: ['SuperAdmin', 'Admin', 'HrAdmin'],
      },
      // {
      //   label: 'Branches',
      //   path: '/org/branches',
      //   roles: ['SuperAdmin', 'Admin', 'HrAdmin'],
      // },
      {
        label: 'Teams',
        path: '/teams',
        roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'FinanceAdmin', 'Employee'],
      },
      {
        label: 'Employee Directory',
        path: '/staff',
        roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'FinanceAdmin', 'Employee'],
      },
      {
        label: 'Dept. Dashboards',
        path: '/departments',
        roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'FinanceAdmin', 'Employee'],
      },
    ],
  },
  {
    label: 'Hiring & Onboarding',
    path: '/hiring-team',
    icon: UserCheck,
    category: 'MANAGEMENT',
    description: 'Profile approvals & dynamic form builder',
    roles: ['SuperAdmin', 'Admin', 'HrAdmin'],
    children: [
      {
        label: 'Profile Submissions',
        path: '/hiring-team',
        roles: ['SuperAdmin', 'Admin', 'HrAdmin'],
      },
      {
        label: 'Form Builder',
        path: '/hiring-team/form-builder',
        roles: ['SuperAdmin', 'Admin', 'HrAdmin'],
      },
    ],
  },
  {
    label: 'Events & Calendar',
    path: '/events',
    icon: CalendarDays,
    category: 'MANAGEMENT',
    description: 'Event planner & dynamic filters',
    roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'FinanceAdmin', 'Employee'],
    children: [
      {
        label: 'Events Planner',
        path: '/events',
        roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'FinanceAdmin', 'Employee'],
      },
      {
        label: 'Attendance Calendar',
        path: '/calendar',
        roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'FinanceAdmin', 'Employee'],
      },
    ],
  },
  {
    label: 'Projects',
    path: '/projects',
    icon: FolderKanban,
    category: 'MANAGEMENT',
    description: 'Projects, Gantt Timelines & Sprints',
    roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'FinanceAdmin', 'Employee'],
    children: [
      {
        label: 'All Projects',
        path: '/projects',
        roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'FinanceAdmin', 'Employee'],
      },
      {
        label: 'Monitoring & My Work',
        path: '/projects/monitoring',
        roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'FinanceAdmin', 'Employee'],
      },
      {
        label: 'My Time',
        path: '/projects/my-time',
        roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'FinanceAdmin', 'Employee'],
      },
      {
        label: 'Approvals',
        path: '/projects/approvals',
        roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'FinanceAdmin'],
      },
      {
        label: 'Doc Templates',
        path: '/projects/doc-templates',
        roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'FinanceAdmin', 'Employee'],
      },
    ],
  },
  {
    label: 'Tasks',
    path: '/tasks',
    icon: CheckSquare,
    category: 'MANAGEMENT',
    description: 'Task assignments, Kanbans & pipelines',
    roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'FinanceAdmin', 'Employee'],
    children: [
      {
        label: 'All Tasks & Board',
        path: '/tasks',
        roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'FinanceAdmin', 'Employee'],
      },
      {
        label: 'My Work & Monitoring',
        path: '/projects/monitoring',
        roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'FinanceAdmin', 'Employee'],
      },
      {
        label: 'Dept. Dashboards',
        path: '/departments',
        roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'FinanceAdmin', 'Employee'],
      },
      {
        label: 'Assignment Rules',
        path: '/settings/assignment-permissions',
        roles: ['SuperAdmin', 'Admin', 'HrAdmin'],
      },
    ],
  },
  {
    label: 'Resource Booking',
    path: '/resource-booking',
    icon: CalendarCheck,
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
    label: 'Benefits & Perks',
    path: '/benefits-perks',
    icon: Gift,
    category: 'MANAGEMENT',
    description: 'Manage employee benefits and perks',
    roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'Employee'],
    children: [
      {
        label: 'My Perks',
        path: '/benefits-perks/my-perks',
        roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'Employee'],
      },
      {
        label: 'Recreation Benefits',
        path: '/benefits-perks/recreation-benefits',
        roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'Employee'],
      },
      {
        label: 'Perk Types',
        path: '/benefits-perks/perk-types',
        roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'FinanceAdmin'],
      },
      {
        label: 'Benefits Opt In',
        path: '/benefits-perks/opt-in-benefits',
        roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'FinanceAdmin'],
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
      {
        label: 'My PaySlip',
        path: '/finance/my-payslip',
        roles: ['SuperAdmin', 'FinanceAdmin', 'Employee', 'Admin', 'HrAdmin'],
      },
      {
        label: 'Audit Book',
        path: '/finance/audit',
        roles: ['SuperAdmin', 'FinanceAdmin', 'Admin'],
      },
      {
        label: 'Reimbursements',
        path: '/finance/reimbursements',
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
        roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'Inventory operator', 'Employee'],
      },
      {
        label: 'Stock Levels',
        path: '/inventory/stock-levels',
        roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'Inventory operator'],
      },
      {
        label: 'Movements',
        path: '/inventory/movements',
        roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'Inventory operator'],
      },
    ],
  },
  {
    label: 'Social',
    path: '/social',
    icon: Share2,
    category: 'MANAGEMENT',
    description: 'Content and media management',
    roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'FinanceAdmin', 'Employee'],
    children: [
      {
        label: 'Blogs',
        path: '/social/blogs',
        roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'FinanceAdmin'],
      },
      {
        label: 'Gallery',
        path: '/social/gallery',
        roles: ['SuperAdmin', 'Admin', 'HrAdmin', 'Employee'],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // SYSTEM
  // ─────────────────────────────────────────────
  // {
  //   label: 'Analytics',
  //   path: '/analytics',
  //   icon: BarChart3,
  //   category: 'SYSTEM',
  //   description: 'Business insights',
  //   roles: ['SuperAdmin', 'Admin'],
  //   children: [
  //     {
  //       label: 'Overview',
  //       path: '/analytics',
  //       roles: ['SuperAdmin', 'Admin'],
  //     },
  //     {
  //       label: 'Reports',
  //       path: '/analytics/reports',
  //       roles: ['SuperAdmin'],
  //     },
  //   ],
  // },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    category: 'SYSTEM',
    description: 'System preferences',
    roles: ['SuperAdmin', 'Admin', 'HrAdmin'],
    children: [
      {
        label: 'General',
        path: '/settings',
        roles: ['SuperAdmin', 'Admin', 'HrAdmin'],
      },
      {
        label: 'Roles & Permissions',
        path: '/settings/roles',
        roles: ['SuperAdmin'],
      },
      {
        label: 'Assignment Rules',
        path: '/settings/assignment-permissions',
        roles: ['SuperAdmin', 'Admin', 'HrAdmin'],
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
