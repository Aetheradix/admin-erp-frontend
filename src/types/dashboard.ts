export interface DashboardUser {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
}

export interface AttendanceMonthlyStats {
  month: number;
  year: number;
  totalCheckedInDays: number;
  totalCheckedOutDays: number;
  attendancePercentage: number;
  lateArrivals: number;
  missedCheckouts: number;
  workingDaysSoFar: number;
}

export interface WeeklyTrendItem {
  date: string;
  dayName: string;
  dayNumber: number;
  isPresent: boolean;
  isWeekend: boolean;
  status: 'Present' | 'Active' | 'Weekend' | 'Absent';
  workDurationMinutes: number;
  workMode: 'office' | 'wfh' | 'field';
}

export interface TodayRecord {
  id: number;
  checkInTime: string | null;
  checkOutTime: string | null;
  workMode: 'office' | 'wfh' | 'field';
  isWfh: boolean;
  workDurationMinutes: number;
  location: string | null;
  remark: string | null;
}

export interface DashboardAttendance {
  todayStatus: 'checked-in' | 'checked-out' | 'not-checked-in';
  todayRecord: TodayRecord | null;
  currentStreak: number;
  longestStreak: number;
  streakType: string;
  monthlyStats: AttendanceMonthlyStats;
  weeklyTrend: WeeklyTrendItem[];
}

export interface NextSalarySchedule {
  expectedDate: string;
  dayName: string;
  daysRemaining: number;
  wasAdjustedForSunday: boolean;
  ruleDescription: string;
  status: 'Upcoming' | 'Processing' | 'Paid';
  targetMonth?: number;
  targetYear?: number;
}

export interface CurrentMonthPayslip {
  available: boolean;
  statusText: string;
  slipId: number | null;
  paySlipNo: string | null;
  netSalary: number | null;
}

export interface LastPayroll {
  id: number;
  paySlipNo: string | null;
  netSalary: number;
  paymentStatus: 'paid' | 'pending' | 'failed';
  paymentDate: string | null;
  payPeriodMonth: number;
  payPeriodYear: number;
}

export interface DashboardPayroll {
  canViewSalary: boolean;
  currentMonthlySalary: number | null;
  lastPayroll: LastPayroll | null;
  nextSalarySchedule: NextSalarySchedule;
  currentMonthPayslip: CurrentMonthPayslip;
  ytdEarnings: number;
  paidCyclesCount: number;
}

export interface UpcomingEventItem {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  time: string;
  category: string;
  status: string;
}

export interface MyUpcomingLeaveItem {
  id: number;
  type: string;
  startDate: string;
  endDate: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  reason: string;
}

export interface WfhStats {
  approvedWfhDaysThisMonth: number;
  isTodayWfh: boolean;
}

export interface DashboardCalendarAndLeave {
  upcomingEvents: UpcomingEventItem[];
  myUpcomingLeaves: MyUpcomingLeaveItem[];
  pendingLeavesCount: number;
  wfhStats: WfhStats;
}

export interface AssignedAssetItem {
  id: number;
  name: string;
  assetId: string;
  category: string;
  serialNumber: string;
  conditionStatus: string;
  assignedDate: string;
  imageUrl: string | null;
}

export interface InventoryActivityLogItem {
  id: number;
  itemId: number;
  itemName: string;
  assetId: string;
  action: string;
  userName: string;
  details: string;
  createdAt: string;
}

export interface RecentScanItem {
  id: number;
  itemId: number;
  itemName: string;
  assetId: string;
  action: string;
  userName: string;
  timestamp: string;
  details: string;
}

export interface DashboardInventory {
  totalItems: number;
  availableItems: number;
  assignedItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  maintenanceItems: number;
  myAssignedAssets: AssignedAssetItem[];
  myAssignedCount: number;
  recentActivities: InventoryActivityLogItem[];
  recentScan: RecentScanItem | null;
}

export interface DashboardProjectsSummary {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  taskCompletionRate: number;
}

export interface DashboardSummaryData {
  user: DashboardUser;
  attendance: DashboardAttendance;
  payroll: DashboardPayroll;
  calendarAndLeave: DashboardCalendarAndLeave;
  inventory: DashboardInventory;
  projects: DashboardProjectsSummary;
}

export interface HeatmapCell {
  date: string;
  day: number;
  month: number;
  year: number;
  dayOfWeek: number;
  status: 'present' | 'late' | 'wfh' | 'leave' | 'holiday' | 'weekend' | 'absent' | 'incomplete' | 'future';
  workingHours: number;
  checkInTime: string | null;
  checkOutTime: string | null;
  tooltip: string;
  workMode: 'office' | 'wfh' | 'field';
}

export interface AttendanceHeatmapData {
  range: {
    startDate: string;
    endDate: string;
    monthsBack: number;
  };
  streaks: {
    currentStreak: number;
    longestStreak: number;
    streakType: string;
  };
  summary: {
    totalPresent: number;
    totalLate: number;
    totalLeave: number;
    totalWfh: number;
    totalAbsent: number;
  };
  cells: HeatmapCell[];
}

export interface ScanAssetPayload {
  itemId: number;
  location?: string;
}

export interface ScanAssetResponse {
  success: boolean;
  message: string;
  data: {
    success: boolean;
    item: {
      id: number;
      name: string;
      assetId: string;
      category: string;
      status: string;
      location: string;
    };
    message: string;
  };
}
