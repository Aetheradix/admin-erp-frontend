import type {
  AttendanceRecord,
  Blog,
  Career,
  ERPEvent,
  GalleryItem,
  Grievance,
  GuestPass,
  Project,
  Reimbursement,
  StaffMember,
} from '@/types/models';

const parseJsonArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== 'string' || !value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

const formatTime = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const formatDisplayDate = (value?: string | null): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const normalizeStatus = (status?: string): StaffMember['status'] => {
  switch ((status || '').toLowerCase()) {
    case 'active':
      return 'Active';
    case 'on leave':
    case 'on_leave':
      return 'On Leave';
    case 'inactive':
      return 'Inactive';
    default:
      return 'Active';
  }
};

export const mapBlog = (blog: Record<string, unknown>): Blog => {
  const author = blog.author;
  return {
    id: blog.id as string | number,
    title: String(blog.title ?? ''),
    excerpt: blog.excerpt ? String(blog.excerpt) : undefined,
    content: String(blog.content ?? ''),
    author:
      typeof author === 'string' || (author && typeof author === 'object')
        ? (author as Blog['author'])
        : blog.author_name
          ? String(blog.author_name)
          : undefined,
    category: blog.category != null ? String(blog.category) : null,
    image_url: String(blog.image_url ?? blog.featuredImage ?? ''),
    featuredImage: blog.featuredImage ? String(blog.featuredImage) : undefined,
    status: String(blog.status ?? 'Draft') as Blog['status'],
    created_at: blog.created_at ? String(blog.created_at) : undefined,
    updated_at: blog.updated_at ? String(blog.updated_at) : undefined,
    tags: Array.isArray(blog.tags) ? blog.tags.map(String) : undefined,
    publishDate: blog.publishDate ? String(blog.publishDate) : undefined,
    views: typeof blog.views === 'number' ? blog.views : undefined,
    readTime: blog.readTime ? String(blog.readTime) : undefined,
  };
};

export const mapAttendanceRecord = (record: Record<string, unknown>): AttendanceRecord => {
  const rawDate = record.date ?? record.record_date ?? record.check_in_time ?? record.created_at;
  const dateValue = rawDate ? new Date(String(rawDate)) : new Date();
  const date = Number.isNaN(dateValue.getTime())
    ? String(rawDate ?? '')
    : dateValue.toISOString().split('T')[0];

  return {
    id: record.id as string | number,
    date,
    type: String(record.type ?? record.status ?? 'Work from Office'),
    checkIn: formatTime(String(record.checkIn ?? record.check_in_time ?? '')),
    checkOut: formatTime(String(record.checkOut ?? record.check_out_time ?? '')),
    status: record.status ? String(record.status) : undefined,
  };
};

export const mapCareer = (career: Record<string, unknown>): Career => ({
  id: career.id as string | number,
  title: String(career.title ?? ''),
  department: String(career.department ?? ''),
  location: String(career.location ?? ''),
  type: String(career.type ?? 'Full-time'),
  experience: career.experience ? String(career.experience) : undefined,
  salary: String(career.salary ?? ''),
  description: String(career.description ?? ''),
  requirements: parseJsonArray(career.requirements),
  benefits: parseJsonArray(career.benefits),
  postedDate: String(career.postedDate ?? career.posted_date ?? ''),
  posted_date: career.posted_date ? String(career.posted_date) : undefined,
  status: String(career.status ?? 'Open'),
});

export const mapEvent = (event: Record<string, unknown>): ERPEvent => {
  const eventDate = String(event.event_date ?? event.date ?? '');
  return {
    id: String(event.id ?? ''),
    title: String(event.title ?? ''),
    description: String(event.description ?? ''),
    event_date: eventDate,
    time: String(event.time ?? ''),
    location: String(event.location ?? ''),
    category: String(event.category ?? 'Meeting'),
    image: String(event.image_url ?? event.image ?? ''),
    organizer: String(event.organizer ?? ''),
    attendees: Number(event.attendees ?? 0),
    date: event.date ? String(event.date) : formatDisplayDate(eventDate),
  };
};

export const mapReimbursement = (item: Record<string, unknown>): Reimbursement => ({
  id: item.id as string | number,
  item: String(item.item ?? item.title ?? ''),
  category: String(item.category ?? ''),
  amount: Number(item.amount ?? 0),
  date: item.created_at
    ? new Date(String(item.created_at)).toISOString().split('T')[0]
    : String(item.date ?? ''),
  status: String(item.status ?? 'Pending'),
  receiptUrl: item.receipt_url
    ? String(item.receipt_url)
    : item.receiptUrl
      ? String(item.receiptUrl)
      : undefined,
  description: String(item.description ?? ''),
});

export const mapGalleryItem = (item: Record<string, unknown>): GalleryItem => ({
  id: item.id as string | number,
  title: String(item.title ?? ''),
  image_url: String(item.image_url ?? item.url ?? ''),
  category: String(item.category ?? 'Events'),
  date: item.date ? String(item.date) : formatDisplayDate(String(item.created_at ?? '')),
  dimensions: item.dimensions as GalleryItem['dimensions'],
});

export const mapGrievance = (item: Record<string, unknown>): Grievance => ({
  id: item.id as string | number,
  title: String(item.subject ?? item.title ?? ''),
  category: String(item.category ?? ''),
  description: String(item.description ?? ''),
  date: item.created_at
    ? new Date(String(item.created_at)).toISOString().split('T')[0]
    : String(item.date ?? ''),
  isAnonymous: Boolean(item.is_anonymous ?? item.isAnonymous),
  status: String(item.status ?? 'Received'),
  response: item.response ? String(item.response) : undefined,
});

export const mapGuestPass = (pass: Record<string, unknown>): GuestPass => ({
  id: pass.id as string | number,
  guestName: String(pass.guestName ?? pass.guest_name ?? ''),
  hostName: String(pass.hostName ?? pass.username ?? 'Employee'),
  purpose: String(pass.purpose ?? pass.visit_purpose ?? ''),
  visitDate: String(pass.visitDate ?? pass.visit_date ?? ''),
  expiryDate: pass.expiryDate
    ? String(pass.expiryDate)
    : pass.expiry_date
      ? String(pass.expiry_date)
      : pass.expires_at
        ? String(pass.expires_at)
        : undefined,
  status: String(pass.status ?? 'Pending'),
  accessCode: String(pass.accessCode ?? pass.pass_code ?? ''),
});

export const mapStaffMember = (member: Record<string, unknown>): StaffMember => ({
  id: member.id as string | number,
  name: member.name ? String(member.name) : undefined,
  username: member.username ? String(member.username) : undefined,
  role: member.role ? String(member.role) : undefined,
  designation: member.designation ? String(member.designation) : undefined,
  department: String(member.department ?? ''),
  email: String(member.email ?? ''),
  phone: member.phone ? String(member.phone) : undefined,
  contact_no: member.contact_no ? String(member.contact_no) : undefined,
  status: normalizeStatus(String(member.status ?? 'Active')),
  joinDate: member.joinDate ? String(member.joinDate) : undefined,
  join_date: member.join_date ? String(member.join_date) : undefined,
  image: member.image ? String(member.image) : undefined,
  image_url: member.image_url ? String(member.image_url) : undefined,
  skills: parseJsonArray(member.skills),
  employee_id: member.employee_id ? String(member.employee_id) : undefined,
});

// export const mapProject = (project: Record<string, unknown>): Project => ({
//   id: project.id as string | number,
//   title: String(project.title ?? project.name ?? ''),
//   name: String(project.name ?? ''),
//   client: String(project.client ?? 'Internal'),
//   progress: Number(project.progress ?? 0),
//   status: String(project.status ?? 'Ongoing'),
//   category: String(project.category ?? 'Enterprise'),
//   leadId: String(project.leadId ?? project.lead_id ?? 'N/A'),
//   startDate: project.startDate
//     ? String(project.startDate)
//     : project.created_at
//       ? new Date(String(project.created_at)).toISOString().split('T')[0]
//       : '2024-01-01',
//   endDate: project.endDate ? String(project.endDate) : project.end_date ? String(project.end_date) : undefined,
// });

export const mapProject = (project: Record<string, unknown>): Project => ({
  id: project.project_id as string | number,

  title: String(project.project_name ?? ''),

  name: String(project.project_name ?? ''),

  client: 'Internal',

  progress: 0,

  status: String(project.project_status ?? 'Planning'),

  category: 'Enterprise',

  leadId: String(project.project_manager ?? 'N/A'),

  startDate: project.start_date ? String(project.start_date) : '',

  endDate: project.end_date ? String(project.end_date) : undefined,
});
