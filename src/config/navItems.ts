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
  Users,
  Heart,
  UserCircle,
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
    path: '/users',
    icon: Users,
    role: 'admin',
    category: 'MANAGEMENT',
    description: 'Manage employees'
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
    label: 'Wellness',
    path: '/wellness',
    icon: Heart,
    category: 'OVERVIEW',
    description: 'Emotional well-being'
  },
  {
    label: 'Profile',
    path: '/profile',
    icon: UserCircle,
    category: 'SYSTEM',
    description: 'Personal account'
  }
];
