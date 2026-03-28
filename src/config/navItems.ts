import {
  BarChart3,
  Briefcase,
  Calendar,
  CreditCard,
  FileText,
  Image as ImageIcon,
  Key,
  LayoutDashboard,
  Scale,
  Settings,
  Ticket,
  UserCircle,
  Users,
  CheckCircle,
  History,
  Settings2,
  type LucideIcon
} from 'lucide-react';



export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  role?: 'admin' | 'employee' | string;
  category?: 'OVERVIEW' | 'MANAGEMENT' | 'SYSTEM';
  description?: string;
}

export const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    category: 'OVERVIEW',
    description: 'Overview of operations'
  },
  {
    label: 'Blogs',
    path: '/blogs',
    icon: FileText,
    category: 'OVERVIEW',
    description: 'Manage content'
  },
  {
    label: 'Gallery',
    path: '/gallery',
    icon: ImageIcon,
    category: 'OVERVIEW',
    description: 'Media management'
  },
  {
    label: 'Events',
    path: '/events',
    icon: Ticket,
    category: 'OVERVIEW',
    description: 'Schedule events'
  },
  {
    label: 'Careers',
    path: '/careers',
    icon: Briefcase,
    category: 'OVERVIEW',
    description: 'Talent acquisition'
  },
  {
    label: 'Staff',
    path: '/staff',
    icon: Users,
    role: 'admin',
    category: 'MANAGEMENT',
    description: 'Manage employees'
  },
  {
    label: 'Approvals',
    path: '/staff/approvals',
    icon: CheckCircle,
    role: 'admin',
    category: 'MANAGEMENT',
    description: 'Approve requests'
  },
  {
    label: 'Approval History',
    path: '/staff/history',
    icon: History,
    role: 'admin',
    category: 'MANAGEMENT',
    description: 'Past request logs'
  },
  {
    label: 'Feature Management',
    path: '/staff/feature-control',
    icon: Settings2,
    role: 'admin',
    category: 'MANAGEMENT',
    description: 'Dynamic feature controls'
  },


  {
    label: 'Attendance',
    path: '/calendar',
    icon: Calendar,
    category: 'MANAGEMENT',
    description: 'Personal schedule'
  },
  {
    label: 'Finance',
    path: '/finance',
    icon: CreditCard,
    category: 'MANAGEMENT',
    description: 'Reimbursements'
  },
  {
    label: 'Grievances',
    path: '/grievances',
    icon: Scale,
    category: 'MANAGEMENT',
    description: 'Support & Help'
  },
  {
    label: 'Guest Pass',
    path: '/guest-pass',
    icon: Key,
    category: 'MANAGEMENT',
    description: 'Visitor management'
  },
  {
    label: 'Analytics',
    path: '/stats',
    icon: BarChart3,
    role: 'admin',
    category: 'SYSTEM',
    description: 'Business insights'
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    category: 'SYSTEM',
    description: 'System preferences'
  },
  {
    label: 'Profile',
    path: '/profile',
    icon: UserCircle,
    category: 'SYSTEM',
    description: 'Personal account'
  },
  {
    label: 'Rulebook',
    path: '/rulebook',
    icon: FileText,
    category: 'SYSTEM',
    description: 'Company Policies'
  }
];
