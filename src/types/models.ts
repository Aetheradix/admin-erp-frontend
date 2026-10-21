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
  user_id?: number | string;
  username?: string;
  email?: string;
  employee_code?: string;
  department?: string;
  designation?: string;
  image_url?: string;
  type: string;
  status: 'Pending' | 'Approved' | 'Rejected' | string;
  reason: string;
  start_date: string;
  end_date: string;
  applied_date?: string;
  admin_comment?: string;
  approved_by?: number | string;
  approver_name?: string;
  approver_email?: string;
  created_at?: string;
  updated_at?: string;
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

export interface EventAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'file';
  size?: string;
  uploaded_by?: string;
  uploaded_at?: string;
}

export interface EventParticipant {
  id: string;
  name: string;
  email: string;
  department?: string;
  avatar?: string;
  role?: string;
  joinedAt?: string;
  passCode?: string;
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
  image_url?: string;
  organizer: string;
  attendees: number;
  date?: string;
  tags?: string[];
  user_id?: string | number;
  author_name?: string;
  author_email?: string;
  author_department?: string;
  employee_status?: string;
  button_type?: 'Register Now' | 'Mandatory' | 'View Details' | string;
  event_link?: string;
  broadcast?: boolean;
  start_time?: string;
  end_time?: string;
  status?: string;
  max_participants?: number;
  participants?: EventParticipant[];
  media_attachments?: EventAttachment[];
  is_registered?: boolean;
  registered_users?: string[];
  photos?: string[];
}

export interface EventFilters {
  category?: string;
  categories?: string[];
  tags?: string[];
  employee_status?: string;
  employee_statuses?: string[];
  department?: string;
  departments?: string[];
  start_date?: string;
  end_date?: string;
  search?: string;
  user_id?: string | number;
}

export interface FilterOptions {
  categories: string[];
  tags: string[];
  employeeStatuses: string[];
  departments: string[];
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
  user_id: number;
  employee_name: string; // ← ADD THIS
  title: string;
  expense_date: string;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
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
  employee_code?: string;
  bank_account_number?: string;
  account_number?: string;
  accountNumber?: string;
  bank_account?: string;
  bankAccount?: string;
  base_salary?: number | string;
  basic_salary?: number | string;
  baseSalary?: number | string;
  basicSalary?: number | string;
  salary?: number | string;
  total_compensation?: number | string;
  totalCompensation?: number | string;
  annual_ctc?: number | string;
  annualCtc?: number | string;
  tax_regime?: 'New Regime' | 'Old Regime';
  taxRegime?: 'New Regime' | 'Old Regime';
  is_mid_year_joiner?: boolean;
  isMidYearJoiner?: boolean;
  previous_employer_ytd?: {
    grossPay?: number;
    tdsDeducted?: number;
    pfDeducted?: number;
    ptDeducted?: number;
  };
  previousEmployerYtd?: {
    grossPay?: number;
    tdsDeducted?: number;
    pfDeducted?: number;
    ptDeducted?: number;
  };
  pan_number?: string;
  panNumber?: string;
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
