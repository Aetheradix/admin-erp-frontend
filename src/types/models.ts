export interface Blog {
  id: string | number;
  title: string;
  excerpt?: string;
  content: string;
  author?: string | { name: string; image?: string };
  category: string | null;
  image_url?: string;
  featuredImage?: string;
  status: 'Published' | 'Draft' | 'Scheduled' | string;
  created_at?: string;
  updated_at?: string;
  tags?: string[];
  publishDate?: string;
  views?: number;
  readTime?: string;
}

export interface AttendanceRecord {
  id: string | number;
  date: string;
  type: string;
  checkIn?: string;
  checkOut?: string;
  status?: string;
}

export interface AttendanceStatus {
  status: 'checked-in' | 'checked-out' | null;
  onBreak: boolean;
  activeBreak?: BreakRecord | null;
  lastAction?: string | null;
  dbStatus?: string | null;
}

export interface AttendanceRequest {
  id: string | number;
  type: string;
  status: 'Pending' | 'Approved' | 'Rejected' | string;
  reason: string;
  start_date: string;
  end_date: string;
  applied_date?: string;
  admin_comment?: string;
}

export interface AttendanceStatsData {
  daysPresent?: number | string;
  wfhCount?: number | string;
  leaveCount?: number | string;
  avgCheckIn?: string;
}

export interface BreakRecord {
  id: number;
  attendance_id: number;
  user_id: number;
  break_start: string | null;
  break_end: string | null;
  duration: number | null; // minutes
  remark: string | null;
}

export interface Career {
  id: string | number;
  title: string;
  department: string;
  location: string;
  type: string;
  experience?: string;
  salary: string;
  description: string;
  requirements: string[] | string;
  benefits: string[] | string;
  postedDate?: string;
  posted_date?: string;
  status: string;
}

export interface ERPEvent {
  id: string | number;
  title: string;
  description: string;
  event_date: string;
  time: string;
  location: string;
  category: string;
  image: string;
  organizer: string;
  attendees: number;
  date?: string;
}

export interface Reimbursement {
  id: string | number;
  item: string;
  category: string;
  amount: number;
  date: string;
  status: string;
  receiptUrl?: string;
  description: string;
}

export interface GalleryItem {
  id: string | number;
  title: string;
  image_url: string;
  category: string;
  date: string;
  dimensions?: { width: number; height: number };
}

export interface Grievance {
  id: string | number;
  title: string;
  category: string;
  description: string;
  date: string;
  isAnonymous: boolean;
  status: string;
  response?: string;
}

export interface GuestPass {
  id: string | number;
  guestName: string;
  hostName: string;
  purpose: string;
  visitDate: string;
  expiryDate?: string;
  status: string;
  accessCode: string;
}

export interface StaffMember {
  id: string | number;
  name?: string;
  username?: string;
  role?: string;
  designation?: string;
  department: string;
  email: string;
  phone?: string;
  contact_no?: string;
  status?: 'Active' | 'On Leave' | 'Inactive' | string;
  joinDate?: string;
  join_date?: string;
  image?: string;
  image_url?: string;
  skills: string[];
  employee_id?: string;
  password?: string;
}

export interface Project {
  id: string | number;
  title: string;
  name?: string;
  client?: string;
  tasks?: number;
  value?: string;
  color?: string;
  category: string;
  participants?: number;
  progress?: number;
  status?: string;
  leadId?: string;
  startDate?: string;
  endDate?: string;
}

export interface MoodEntry {
  id: string | number;
  mood_score: number;
  stress_level: number;
  comments: string;
  created_at?: string;
}

export interface ProjectStatsData {
  projects?: { active?: number };
  employees?: { total?: number };
}

export interface Task {
  task_title: string;
  task_description: string;
  allocated_to: number;
  allocated_by: number;
  task_status: 'Completed' | 'Pending' | 'On-Going';
  remark?: string | null;
  allotment_date?: Date | null;
  duration?: string | null;
  project_id?: number | null;
}

export interface TaskStatsData {
  total?: number;
  completed?: number;
  pending?: number;
  inProgress?: number;
}
