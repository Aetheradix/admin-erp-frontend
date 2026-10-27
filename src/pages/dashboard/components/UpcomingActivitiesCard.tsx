import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Home,
  AlertCircle,
  ArrowUpRight,
  Plane,
} from 'lucide-react';
import type { DashboardCalendarAndLeave } from '@/types/dashboard';

interface UpcomingActivitiesCardProps {
  data: DashboardCalendarAndLeave | null;
  isLoading: boolean;
}

export const UpcomingActivitiesCard: React.FC<UpcomingActivitiesCardProps> = ({ data, isLoading }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'events' | 'leaves' | 'wfh'>('all');

  if (isLoading || !data) {
    return (
      <div className="bg-surface-elevated rounded-3xl p-7 border border-border-subtle shadow-soft animate-pulse h-full">
        <div className="w-28 h-4 rounded-md bg-surface-subtle mb-3" />
        <div className="w-48 h-7 rounded-xl bg-surface-subtle mb-6" />
        <div className="space-y-3">
          <div className="h-16 rounded-2xl bg-surface-subtle" />
          <div className="h-16 rounded-2xl bg-surface-subtle" />
          <div className="h-16 rounded-2xl bg-surface-subtle" />
        </div>
      </div>
    );
  }

  const { upcomingEvents = [], myUpcomingLeaves = [], pendingLeavesCount = 0, wfhStats } = data;

  // Filter items based on activeTab
  const showEvents = activeTab === 'all' || activeTab === 'events';
  const showLeaves = activeTab === 'all' || activeTab === 'leaves';
  const showWfh = activeTab === 'all' || activeTab === 'wfh';

  const wfhLeaves = myUpcomingLeaves.filter((l) => l.type === 'Work from home');
  const regularLeaves = myUpcomingLeaves.filter((l) => l.type !== 'Work from home');

  const totalActivitiesCount = upcomingEvents.length + myUpcomingLeaves.length;

  return (
    <div className="bg-surface-elevated rounded-3xl p-5 sm:p-6 border border-border-subtle shadow-soft hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">
              Schedules & Leaves
            </span>
            <h2 className="text-xl font-black text-foreground tracking-tight mt-0.5">
              Events & Schedules
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {pendingLeavesCount > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <AlertCircle size={11} />
                <span>{pendingLeavesCount} Pending</span>
              </span>
            )}
            <button
              onClick={() => navigate('/events')}
              className="px-3.5 py-1.5 rounded-2xl bg-surface-subtle hover:bg-surface-elevated border border-border-subtle text-[11px] font-black text-foreground uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs">
              <span>View All</span>
              <ArrowUpRight size={13} className="text-muted" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface-subtle border border-border-subtle mb-5 overflow-x-auto">
          {[
            { key: 'all', label: `All (${totalActivitiesCount})` },
            { key: 'events', label: `Events (${upcomingEvents.length})` },
            { key: 'leaves', label: `Leaves (${regularLeaves.length})` },
            { key: 'wfh', label: `WFH (${wfhLeaves.length || wfhStats.approvedWfhDaysThisMonth})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-muted hover:text-foreground hover:bg-surface-elevated'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Activity List */}
        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
          {/* Empty State */}
          {totalActivitiesCount === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-surface-subtle border border-border-subtle flex items-center justify-center text-muted mb-3">
                <Calendar size={22} />
              </div>
              <h4 className="text-sm font-bold text-foreground">No Upcoming Activities</h4>
              <p className="text-xs text-muted mt-1 max-w-xs">
                There are no scheduled company events, approved leaves, or WFH dates for your account.
              </p>
              <button
                onClick={() => navigate('/calendar')}
                className="mt-4 px-4 py-2 rounded-2xl bg-primary text-white text-[11px] font-black uppercase tracking-wider hover:bg-primary-hover transition-colors shadow-xs cursor-pointer">
                Apply for Leave or WFH
              </button>
            </div>
          )}

          {/* Company Events */}
          {showEvents &&
            upcomingEvents.map((event) => (
              <motion.div
                key={`event-${event.id}`}
                whileHover={{ x: 2 }}
                onClick={() => navigate('/events')}
                className="p-3.5 sm:p-4 rounded-2xl bg-surface-subtle/80 hover:bg-surface-subtle border border-border-subtle hover:border-primary/30 transition-all cursor-pointer flex items-center justify-between gap-4 group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex flex-col items-center justify-center shrink-0 border border-primary/20">
                    <span className="text-[9px] font-black uppercase leading-none">
                      {new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-sm font-black leading-none mt-0.5">
                      {new Date(event.eventDate).getDate()}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {event.category || 'Event'}
                      </span>
                      {event.time && (
                        <span className="text-[10px] text-muted font-medium flex items-center gap-1">
                          <Clock size={10} /> {event.time}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-black text-foreground truncate group-hover:text-primary transition-colors">
                      {event.title}
                    </h4>
                    {event.location && (
                      <p className="text-[10px] text-muted flex items-center gap-1 truncate mt-0.5">
                        <MapPin size={10} /> {event.location}
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1">
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {event.status || 'Upcoming'}
                  </span>
                  <ArrowUpRight size={14} className="text-muted group-hover:text-primary transition-colors" />
                </div>
              </motion.div>
            ))}

          {/* Leaves */}
          {showLeaves &&
            regularLeaves.map((leave) => (
              <motion.div
                key={`leave-${leave.id}`}
                whileHover={{ x: 2 }}
                onClick={() => navigate('/calendar')}
                className="p-3.5 sm:p-4 rounded-2xl bg-surface-subtle/80 hover:bg-surface-subtle border border-border-subtle hover:border-amber-300 transition-all cursor-pointer flex items-center justify-between gap-4 group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/20">
                    <Plane size={18} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        {leave.type}
                      </span>
                      <span className="text-[10px] text-muted font-medium">
                        {leave.startDate} to {leave.endDate}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-foreground truncate group-hover:text-amber-600 transition-colors">
                      {leave.reason || 'Leave requested'}
                    </h4>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1">
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      leave.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : leave.status === 'Rejected'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                    {leave.status}
                  </span>
                  <ArrowUpRight size={14} className="text-muted group-hover:text-amber-600 transition-colors" />
                </div>
              </motion.div>
            ))}

          {/* WFH Items */}
          {showWfh &&
            wfhLeaves.map((wfh) => (
              <motion.div
                key={`wfh-${wfh.id}`}
                whileHover={{ x: 2 }}
                onClick={() => navigate('/calendar')}
                className="p-3.5 sm:p-4 rounded-2xl bg-surface-subtle/80 hover:bg-surface-subtle border border-border-subtle hover:border-teal-300 transition-all cursor-pointer flex items-center justify-between gap-4 group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0 border border-teal-500/20">
                    <Home size={18} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                        Work From Home
                      </span>
                      <span className="text-[10px] text-muted font-medium">
                        {wfh.startDate} to {wfh.endDate}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-foreground truncate group-hover:text-teal-600 transition-colors">
                      {wfh.reason || 'Remote work arrangement'}
                    </h4>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1">
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      wfh.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                    {wfh.status}
                  </span>
                  <ArrowUpRight size={14} className="text-muted group-hover:text-teal-600 transition-colors" />
                </div>
              </motion.div>
            ))}
        </div>
      </div>

      {/* Card Footer Quick Links */}
      <div className="mt-5 pt-4 border-t border-border-subtle flex items-center justify-between">
        <button
          onClick={() => navigate('/calendar')}
          className="text-[11px] font-bold text-muted hover:text-foreground flex items-center gap-1.5 transition-colors cursor-pointer">
          <Calendar size={13} />
          <span>Apply Leave / WFH</span>
        </button>
        <button
          onClick={() => navigate('/events')}
          className="text-[11px] font-black text-primary hover:underline flex items-center gap-1 cursor-pointer">
          <span>Full Event Schedule →</span>
        </button>
      </div>
    </div>
  );
};
