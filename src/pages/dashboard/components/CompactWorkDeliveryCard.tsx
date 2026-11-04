import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, Progress, Tag } from 'antd';
import {
  FolderKanban,
  ListTodo,
  Calendar,
  Package,
  Plus,
  ArrowUpRight,
  Home,
  Activity,
  CheckCircle2,
  Clock,
  Search,
  UserCheck,
} from 'lucide-react';
import type { Project, Task } from '@/types/models';
import type {
  DashboardCalendarAndLeave,
  DashboardInventory,
  DashboardAttendance,
} from '@/types/dashboard';

interface CompactWorkDeliveryCardProps {
  projects: Project[];
  totalTasks: number;
  completedTasks: number;
  taskCompletionRate: number;
  calendarAndLeave: DashboardCalendarAndLeave | null;
  inventory: DashboardInventory | null;
  attendance?: DashboardAttendance | null;
  tasks?: Task[];
}

export const CompactWorkDeliveryCard: React.FC<CompactWorkDeliveryCardProps> = ({
  projects,
  totalTasks,
  completedTasks,
  taskCompletionRate,
  calendarAndLeave,
  inventory,
  attendance,
  tasks = [],
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('projects');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter((p) =>
    (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.status || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const upcomingLeaves = calendarAndLeave?.myUpcomingLeaves || [];
  const assignedAssets = inventory?.myAssignedAssets || [];
  const recentActivities = inventory?.recentActivities || [];

  // Compose dynamic activity events from real attendance & inventory
  const activityTimeline = [
    ...(attendance?.todayRecord?.checkInTime
      ? [
          {
            id: 'punch-in-today',
            title: `Shift Check-in (${attendance.todayRecord.workMode === 'wfh' ? 'Remote WFH' : 'Office'})`,
            time: new Date(attendance.todayRecord.checkInTime).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }),
            type: 'attendance',
            icon: UserCheck,
            color: 'text-emerald-500 bg-emerald-500/10',
          },
        ]
      : []),
    ...upcomingLeaves.slice(0, 2).map((l) => ({
      id: `leave-${l.id}`,
      title: `${l.type} Application: ${l.status}`,
      time: `${l.startDate}${l.endDate && l.endDate !== l.startDate ? ` - ${l.endDate}` : ''}`,
      type: 'leave',
      icon: Calendar,
      color: l.status === 'Approved' ? 'text-blue-500 bg-blue-500/10' : 'text-amber-500 bg-amber-500/10',
    })),
    ...recentActivities.slice(0, 3).map((act) => ({
      id: `inv-${act.id}`,
      title: `${act.action}: ${act.itemName}`,
      time: act.createdAt ? new Date(act.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently',
      type: 'inventory',
      icon: Package,
      color: 'text-zinc-600 bg-zinc-500/10',
    })),
  ];

  return (
    <div className="bg-white rounded-[12px] p-4 border border-border-subtle shadow-2xs hover:border-border transition-all duration-200 h-full flex flex-col justify-between">
      {/* Velocity / Progress Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle/70 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-1">
              <FolderKanban size={11} /> Workspaces & Pulse
            </span>
            <span className="text-muted text-xs">•</span>
            <span className="text-[10px] font-bold text-muted">
              {completedTasks} of {totalTasks} tasks complete
            </span>
          </div>
          <h3 className="text-sm font-black text-foreground">
            Project Delivery & Work Operations
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-28 sm:w-36">
            <div className="flex items-center justify-between text-[10px] font-bold mb-1">
              <span className="text-muted">Completion</span>
              <span className="text-foreground">{taskCompletionRate}%</span>
            </div>
            <Progress
              percent={taskCompletionRate}
              showInfo={false}
              size="small"
              strokeColor="#E8583A"
              trailColor="#F3F4F6"
            />
          </div>

          <button
            type="button"
            onClick={() => navigate('/tasks')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-elevated text-xs font-bold text-foreground border border-border-subtle transition-colors cursor-pointer shrink-0"
            title="Create Task">
            <Plus size={12} className="text-primary" />
            <span>Task</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 flex flex-col pt-1">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="compact-dashboard-tabs flex-1 flex flex-col"
          items={[
            {
              key: 'projects',
              label: (
                <span className="flex items-center gap-1.5 text-xs font-bold">
                  <FolderKanban size={12} />
                  <span>Active Projects ({projects.length})</span>
                </span>
              ),
              children: (
                <div className="flex-1 flex flex-col pt-1">
                  {projects.length > 3 && (
                    <div className="mb-2 relative">
                      <Search size={12} className="absolute left-2.5 top-2.5 text-muted" />
                      <input
                        type="text"
                        placeholder="Search projects by name, category, or status..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary/40 transition-colors"
                      />
                    </div>
                  )}

                  {filteredProjects.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-8 text-center bg-surface-subtle/30 rounded-xl border border-dashed border-border-subtle/80">
                      <FolderKanban size={28} className="text-muted/50 mb-2" />
                      <p className="text-xs font-bold text-foreground">
                        {searchQuery ? 'No matching projects found' : 'No active projects found'}
                      </p>
                      <p className="text-[11px] text-muted mt-0.5 max-w-xs">
                        {searchQuery
                          ? 'Try adjusting your search keywords'
                          : 'Projects created or assigned to your team will appear here in real-time.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate('/tasks')}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors shadow-xs cursor-pointer">
                        <Plus size={12} />
                        <span>Manage Workspaces</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 overflow-y-auto no-scrollbar pr-0.5 max-h-[300px] flex-1">
                      {filteredProjects.map((project) => (
                        <div
                          key={project.id}
                          onClick={() => navigate('/tasks')}
                          className="p-2.5 rounded-xl bg-surface-subtle/50 hover:bg-surface-elevated border border-border-subtle/60 transition-all cursor-pointer flex items-center justify-between gap-3 group">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              style={{ backgroundColor: project.color || '#E8583A' }}
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                {project.title}
                              </h4>
                              <p className="text-[10px] text-muted flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className="font-semibold text-muted/90">{project.category || 'ENTERPRISE'}</span>
                                <span>•</span>
                                <span>{project.tasks || 0} tasks</span>
                                {(project.participants ?? 0) > 0 && (
                                  <>
                                    <span>•</span>
                                    <span>{project.participants} team members</span>
                                  </>
                                )}
                                {project.endDate && (
                                  <>
                                    <span>•</span>
                                    <span className="text-amber-600/90 font-medium">Due {project.endDate}</span>
                                  </>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Tag
                              color={
                                project.value === 'Active' || project.status === 'Active'
                                  ? 'green'
                                  : project.value === 'Planning'
                                    ? 'blue'
                                    : project.value === 'Completed'
                                      ? 'purple'
                                      : 'orange'
                              }
                              className="text-[9px] font-bold border-none m-0 rounded-md">
                              {project.value || project.status || 'Active'}
                            </Tag>
                            <ArrowUpRight
                              size={12}
                              className="text-muted group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'tasks',
              label: (
                <span className="flex items-center gap-1.5 text-xs font-bold">
                  <ListTodo size={12} />
                  <span>Tasks ({tasks.length})</span>
                </span>
              ),
              children: (
                <div className="flex-1 flex flex-col pt-1">
                  {tasks.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-8 text-center bg-surface-subtle/30 rounded-xl border border-dashed border-border-subtle/80">
                      <ListTodo size={24} className="text-muted/50 mb-1.5" />
                      <p className="text-xs font-bold text-foreground">No tasks assigned yet</p>
                      <p className="text-[11px] text-muted mt-0.5">Assigned tasks and sprint tickets will display here.</p>
                      <button
                        type="button"
                        onClick={() => navigate('/tasks')}
                        className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-subtle hover:bg-surface-elevated text-xs font-bold text-foreground border border-border-subtle transition-colors cursor-pointer">
                        <Plus size={11} className="text-primary" />
                        <span>Create First Task</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 overflow-y-auto no-scrollbar pr-0.5 max-h-[300px] flex-1">
                      {tasks.map((task, idx) => (
                        <div
                          key={idx}
                          onClick={() => navigate('/tasks')}
                          className="p-2.5 rounded-xl bg-surface-subtle/50 hover:bg-surface-elevated border border-border-subtle/60 transition-all cursor-pointer flex items-center justify-between gap-3 group">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {task.task_status === 'Completed' ? (
                              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                            ) : (
                              <Clock size={14} className="text-amber-500 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                {task.task_title}
                              </h4>
                              {task.task_description && (
                                <p className="text-[10px] text-muted truncate mt-0.5">
                                  {task.task_description}
                                </p>
                              )}
                            </div>
                          </div>
                          <Tag
                            color={task.task_status === 'Completed' ? 'green' : 'gold'}
                            className="text-[9px] font-bold border-none m-0 rounded-md shrink-0">
                            {task.task_status}
                          </Tag>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'activity',
              label: (
                <span className="flex items-center gap-1.5 text-xs font-bold">
                  <Activity size={12} />
                  <span>Recent Activity ({activityTimeline.length})</span>
                </span>
              ),
              children: (
                <div className="flex-1 flex flex-col pt-1">
                  {activityTimeline.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-8 text-center bg-surface-subtle/30 rounded-xl border border-dashed border-border-subtle/80">
                      <Activity size={24} className="text-muted/50 mb-1.5" />
                      <p className="text-xs font-bold text-foreground">No recent activity logs</p>
                      <p className="text-[11px] text-muted mt-0.5">Your daily punch, leave, and system events will show here.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 overflow-y-auto no-scrollbar pr-0.5 max-h-[300px] flex-1">
                      {activityTimeline.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.id}
                            className="p-2.5 rounded-xl bg-surface-subtle/40 hover:bg-surface-elevated border border-border-subtle/50 transition-all flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                                <Icon size={13} />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-foreground truncate">{item.title}</h4>
                                <p className="text-[10px] text-muted mt-0.5">{item.time}</p>
                              </div>
                            </div>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-surface-subtle text-muted shrink-0 uppercase tracking-wider">
                              {item.type}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'leaves',
              label: (
                <span className="flex items-center gap-1.5 text-xs font-bold">
                  <Calendar size={12} />
                  <span>My Schedules ({upcomingLeaves.length})</span>
                </span>
              ),
              children: (
                <div className="flex-1 flex flex-col pt-1">
                  {upcomingLeaves.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-8 text-center bg-surface-subtle/30 rounded-xl border border-dashed border-border-subtle/80">
                      <Calendar size={24} className="text-muted/50 mb-1.5" />
                      <p className="text-xs font-bold text-foreground">No pending or upcoming leave applications</p>
                      <button
                        type="button"
                        onClick={() => navigate('/calendar')}
                        className="mt-2 text-xs font-bold text-primary hover:underline cursor-pointer">
                        Apply for Leave
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 overflow-y-auto no-scrollbar max-h-[300px] flex-1">
                      {upcomingLeaves.map((l) => (
                        <div
                          key={l.id}
                          onClick={() => navigate('/calendar')}
                          className="p-2.5 rounded-xl bg-surface-subtle/50 hover:bg-surface-elevated border border-border-subtle/60 transition-all flex items-center justify-between gap-3 cursor-pointer">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              {l.type === 'Work from home' ? <Home size={13} /> : <Calendar size={13} />}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-foreground truncate">{l.type}</h4>
                              <p className="text-[10px] text-muted truncate mt-0.5">
                                {l.startDate} {l.endDate && l.endDate !== l.startDate ? `to ${l.endDate}` : ''}
                                {l.reason ? ` · "${l.reason}"` : ''}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-md shrink-0 uppercase tracking-wider ${
                              l.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700'
                                : l.status === 'Rejected'
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-amber-50 text-amber-700'
                            }`}>
                            {l.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'assets',
              label: (
                <span className="flex items-center gap-1.5 text-xs font-bold">
                  <Package size={12} />
                  <span>Assigned Assets ({assignedAssets.length})</span>
                </span>
              ),
              children: (
                <div className="flex-1 flex flex-col pt-1">
                  {assignedAssets.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-8 text-center bg-surface-subtle/30 rounded-xl border border-dashed border-border-subtle/80">
                      <Package size={24} className="text-muted/50 mb-1.5" />
                      <p className="text-xs font-bold text-foreground">No hardware or inventory assets assigned yet</p>
                      <button
                        type="button"
                        onClick={() => navigate('/inventory')}
                        className="mt-2 text-xs font-bold text-primary hover:underline cursor-pointer">
                        View Inventory Catalog
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 overflow-y-auto no-scrollbar max-h-[300px] flex-1">
                      {assignedAssets.map((asset) => (
                        <div
                          key={asset.id}
                          onClick={() => navigate('/inventory')}
                          className="p-2.5 rounded-xl bg-surface-subtle/50 hover:bg-surface-elevated border border-border-subtle/60 transition-all flex items-center justify-between gap-3 cursor-pointer">
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-foreground truncate">{asset.name}</h4>
                            <p className="text-[10px] text-muted mt-0.5">
                              ID: <span className="font-mono text-foreground font-bold">{asset.assetId}</span> • {asset.category}
                            </p>
                          </div>
                          <Tag color="blue" className="text-[9px] font-bold border-none m-0 rounded-md">
                            {asset.conditionStatus || 'Assigned'}
                          </Tag>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};
