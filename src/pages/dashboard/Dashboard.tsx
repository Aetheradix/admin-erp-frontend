import { useProfile } from '../profile/hooks/useProfile';
import CalendarCard from './components/CalendarCard';
import ProfitChartCard from './components/ProfitChartCard';
import { ProjectList } from './components/ProjectList';
import { StatsSummary } from './components/StatsSummary';
import { useDashboardData } from './hooks/useDashboardData';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckSquare,
  CreditCard,
  Users,
  Package,
  BarChart3,
  Settings,
  ArrowUpRight,
} from 'lucide-react';

const Dashboard = () => {
  const { projects, stats, liveCounts } = useDashboardData();
  const { user } = useProfile();
  const navigate = useNavigate();

  const moduleCards = [
    {
      title: 'Check-In Status',
      value: liveCounts.isCheckedIn ? 'Checked In' : 'Checked Out',
      subtitle: 'Attendance Velocity',
      icon: Clock,
      route: '/checkin',
      color: liveCounts.isCheckedIn
        ? 'text-emerald-500 bg-emerald-500/10'
        : 'text-amber-500 bg-amber-500/10',
      badge: liveCounts.isCheckedIn ? 'ACTIVE' : 'OFFLINE',
    },
    {
      title: 'Active Tasks',
      value: `${liveCounts.tasks} Tasks`,
      subtitle: `${stats.completedTasks} Completed`,
      icon: CheckSquare,
      route: '/tasks',
      color: 'text-primary bg-primary/10',
      badge: `${stats.tasksVsLy}`,
    },
    {
      title: 'Finance & Claims',
      value: `$ ${Number(liveCounts.reimbursements * 12500 + 45000).toLocaleString()}`,
      subtitle: `${liveCounts.reimbursements} Active Claims`,
      icon: CreditCard,
      route: '/finance',
      color: 'text-purple-500 bg-purple-500/10',
      badge: 'FISCAL',
    },
    {
      title: 'Organization Staff',
      value: `${liveCounts.users} Members`,
      subtitle: 'Active Workforce',
      icon: Users,
      route: '/staff',
      color: 'text-blue-500 bg-blue-500/10',
      badge: 'TEAM',
    },
    {
      title: 'Inventory Stock',
      value: '142 Items',
      subtitle: 'Stock Movements',
      icon: Package,
      route: '/inventory',
      color: 'text-teal-500 bg-teal-500/10',
      badge: 'STOCK',
    },
    {
      title: 'System Analytics',
      value: '98.4% Health',
      subtitle: 'Performance Index',
      icon: BarChart3,
      route: '/analytics',
      color: 'text-indigo-500 bg-indigo-500/10',
      badge: 'LIVE',
    },
    {
      title: 'System Settings',
      value: 'Configured',
      subtitle: 'Themes & Security',
      icon: Settings,
      route: '/settings',
      color: 'text-slate-500 bg-slate-500/10',
      badge: 'PREFS',
    },
  ];

  return (
    <div className="min-h-screen pb-12">
      <h1 className="sr-only">AetherERP Dashboard</h1>

      {/* Top Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
            Operational Overview & Sidebar Sync
          </span>
          <h2 className="text-4xl font-extrabold text-foreground tracking-tight mt-1">
            Welcome back, {user.name}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-extrabold text-foreground tracking-wide">
              {liveCounts.projects} Active Projects
            </span>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="px-4 py-2 rounded-2xl bg-primary text-white text-[11px] font-black uppercase tracking-wider hover:bg-primary-hover transition-colors shadow-sm"
          >
            Settings
          </button>
        </div>
      </motion.div>

      {/* Dynamic Module Quick Action Grid */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-10"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black text-muted uppercase tracking-[0.2em]">
            Sidebar Module Live Hub
          </h3>
          <span className="text-[10px] font-bold text-muted/60">Real-time RTK Data Sync</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {moduleCards.map((card, _) => (
            <motion.div
              key={card.title}
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => navigate(card.route)}
              className="bg-surface-elevated p-4 rounded-3xl border border-border-subtle shadow-soft cursor-pointer hover:border-primary/40 transition-all flex flex-col justify-between min-h-[120px] group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2.5 rounded-2xl ${card.color}`}>
                  <card.icon size={16} />
                </div>
                <span className="text-[9px] font-black tracking-wider text-muted group-hover:text-primary transition-colors flex items-center gap-0.5">
                  {card.badge} <ArrowUpRight size={10} />
                </span>
              </div>

              <div>
                <h4 className="text-sm font-black text-foreground tracking-tight leading-tight group-hover:text-primary transition-colors">
                  {card.value}
                </h4>
                <p className="text-[10px] font-bold text-muted mt-0.5 tracking-tight truncate">
                  {card.title}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Main Column - 8 cols */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ProjectList projects={projects} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <ProfitChartCard />
          </motion.div>
        </div>

        {/* Sidebar Column - 4 cols */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <StatsSummary stats={stats} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <CalendarCard />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
