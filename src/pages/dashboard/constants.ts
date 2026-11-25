export const PRESET_COLORS = [
  '#e8583a',
  '#3B82F6',
  '#6366F1',
  '#9747ff',
  '#34d399',
  '#fb7185',
  '#06B6D4',
];

export const DASHBOARD_CARD_CLASS =
  'bg-white rounded-[12px] p-4 border border-border-subtle shadow-2xs hover:border-border transition-all duration-200';

export const DASHBOARD_CARD_SKELETON_CLASS =
  'bg-white rounded-[12px] p-4 border border-border-subtle shadow-2xs animate-pulse';

export const KPI_GRID_CLASS = 'grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5';
export const KPI_COUNT = 7;

export const HEATMAP_STATUS_COLORS: Record<string, string> = {
  present: 'bg-emerald-500 hover:bg-emerald-600',
  late: 'bg-amber-400 hover:bg-amber-500',
  wfh: 'bg-indigo-500 hover:bg-indigo-600',
  leave: 'bg-purple-500 hover:bg-purple-600',
  holiday: 'bg-cyan-500 hover:bg-cyan-600',
  incomplete: 'bg-rose-400 hover:bg-rose-500',
  weekend: 'bg-zinc-200/90 hover:bg-zinc-300',
  absent: 'bg-red-200 hover:bg-red-300',
  future: 'bg-zinc-100/70 border border-dashed border-zinc-200',
};

export const HEATMAP_LEGEND = [
  { label: 'Present', className: 'bg-emerald-500' },
  { label: 'WFH', className: 'bg-indigo-500' },
  { label: 'Late', className: 'bg-amber-400' },
  { label: 'Holiday', className: 'bg-cyan-500' },
  { label: 'Leave', className: 'bg-purple-500' },
];

export const HEATMAP_WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const HEATMAP_COLUMN_WIDTH_PX = 13;
export const HEATMAP_MONTHS_BACK_DEFAULT = 4;
export const HEATMAP_MONTHS_BACK_MIN = 2;
export const HEATMAP_MONTHS_BACK_MAX = 6;

export const HOLIDAY_MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
export const HOLIDAY_WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
export const HOLIDAY_UPCOMING_LIMIT = 3;

export const WORK_DELIVERY_LIST_CLASS =
  'flex flex-col gap-2 overflow-y-auto no-scrollbar max-h-[300px] flex-1';
export const WORK_DELIVERY_ROW_CLASS =
  'p-2.5 rounded-xl bg-surface-subtle/50 hover:bg-surface-elevated border border-border-subtle/60 transition-all flex items-center justify-between gap-3';
export const WORK_DELIVERY_EMPTY_CLASS =
  'flex-1 flex flex-col items-center justify-center py-8 text-center bg-surface-subtle/30 rounded-xl border border-dashed border-border-subtle/80';
export const WORK_DELIVERY_TAB_LABEL_CLASS = 'flex items-center gap-1.5 text-xs font-bold';
export const PROJECT_SEARCH_THRESHOLD = 3;
export const ACTIVITY_LEAVE_LIMIT = 2;
export const ACTIVITY_INVENTORY_LIMIT = 3;
export const COMPLETED_TASK_STATUS = 'Completed';
