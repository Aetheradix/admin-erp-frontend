import {
  BarChart3,
  Briefcase,
  Building2,
  CheckSquare,
  CreditCard,
  LayoutDashboard,
  Package,
  Settings,
  Users,
  Users2,
  Clock,
  FileText,
  Image,
  type LucideIcon
} from 'lucide-react';



export interface NavChild {
  label: string;
  path: string;
}

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  role?: 'admin' | 'employee' | string;
  category?: 'OVERVIEW' | 'MANAGEMENT' | 'SYSTEM';
  description?: string;
  children?: NavChild[];
}

export const navItems: NavItem[] = [
  // ── OVERVIEW ──────────────────────────────────────
  {
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    category: 'OVERVIEW',
    description: 'Overview of operations'
  },
  {
    label: 'Check-In',
    path: '/checkin',
    icon: Clock,
    category: 'OVERVIEW',
    description: 'Attendance Center'
  },

  // ── MANAGEMENT ────────────────────────────────────
  {
    label: 'Organization',
    path: '/org',
    icon: Building2,
    category: 'MANAGEMENT',
    description: 'Company profile'
  },
  {
    label: 'Teams',
    path: '/teams',
    icon: Users2,
    category: 'MANAGEMENT',
    description: 'Team management'
  },
  {
    label: 'Users',
    path: '/users',
    icon: Users,
    category: 'MANAGEMENT',
    description: 'User directory'
  },
  {
    label: 'Projects',
    path: '/staff',
    icon: Briefcase,
    role: 'admin',
    category: 'MANAGEMENT',
    description: 'Manage projects'
  },
  {
    label: 'Tasks',
    path: '/tasks',
    icon: CheckSquare,
    category: 'MANAGEMENT',
    description: 'Task management'
  },
  {
    label: 'Finance',
    path: '/finance',
    icon: CreditCard,
    category: 'MANAGEMENT',
    description: 'Financial management',
    children: [
      { label: 'Overview', path: '/finance' },
      { label: 'Invoices', path: '/finance/invoices' },
      { label: 'Expenses', path: '/finance/expenses' },
      { label: 'Payroll', path: '/finance/payroll' },
    ]
  },
  {
    label: 'Inventory',
    path: '/inventory',
    icon: Package,
    category: 'MANAGEMENT',
    description: 'Stock management',
    children: [
      { label: 'Items', path: '/inventory' },
      { label: 'Stock Levels', path: '/inventory/stock-levels' },
      { label: 'Movements', path: '/inventory/movements' },
    ]
  },
  {
    label: 'Blogs',
    path: '/blogs',
    icon: FileText,
    category: 'MANAGEMENT',
    description: 'Content management'
  },
  {
    label: 'Gallery',
    path: '/gallery',
    icon: Image,
    category: 'MANAGEMENT',
    description: 'Asset library'
  },

  // ── SYSTEM ────────────────────────────────────────
  {
    label: 'Analytics',
    path: '/analytics',
    icon: BarChart3,
    role: 'admin',
    category: 'SYSTEM',
    description: 'Business insights',
    children: [
      { label: 'Overview', path: '/analytics' },
      { label: 'Reports', path: '/analytics/reports' },
    ]
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    category: 'SYSTEM',
    description: 'System preferences',
    children: [
      { label: 'General', path: '/settings' },
      { label: 'Roles & Permissions', path: '/settings/roles' },
      { label: 'Integrations', path: '/settings/integrations' },
      { label: 'Audit Log', path: '/settings/audit-log' },
    ]
  },
];
