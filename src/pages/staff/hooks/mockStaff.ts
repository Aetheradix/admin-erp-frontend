export interface StaffMember {
  id: string | number;
  name?: string; // Original field, kept for compatibility
  username?: string; // Backend field
  role?: string; // Original field
  designation?: string; // Backend field
  department: string;
  email: string;
  phone?: string; // Original field
  contact_no?: string; // Backend field
  status: 'Active' | 'On Leave' | 'Inactive';
  joinDate?: string; // Original field
  join_date?: string; // Backend field
  image?: string; // Original field
  image_url?: string; // Backend field
  skills: string[];
  employee_id?: string;
}

export const mockStaff: StaffMember[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Senior Frontend Engineer',
    department: 'Engineering',
    email: 'sarah.chen@aetheradix.com',
    phone: '+1 (555) 123-4567',
    status: 'Active',
    joinDate: '2024-05-15',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    skills: ['React', 'TypeScript', 'Tailwind', 'Next.js']
  },
  {
    id: '2',
    name: 'Marcus Bell',
    role: 'Product Designer',
    department: 'Design',
    email: 'marcus.bell@aetheradix.com',
    phone: '+1 (555) 234-5678',
    status: 'Active',
    joinDate: '2024-08-20',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    skills: ['Figma', 'UI/UX', 'Prototyping', 'Design Systems']
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    role: 'Product Manager',
    department: 'Product',
    email: 'elena.r@aetheradix.com',
    phone: '+1 (555) 345-6789',
    status: 'On Leave',
    joinDate: '2023-11-10',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
    skills: ['Agile', 'Roadmapping', 'User Research', 'Data Analysis']
  },
  {
    id: '4',
    name: 'James Wilson',
    role: 'DevOps Engineer',
    department: 'Engineering',
    email: 'james.w@aetheradix.com',
    phone: '+1 (555) 456-7890',
    status: 'Active',
    joinDate: '2025-01-05',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD']
  }
];
