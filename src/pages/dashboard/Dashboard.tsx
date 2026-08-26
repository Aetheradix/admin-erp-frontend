import { useProfile } from '../profile/hooks/useProfile';
import CalendarCard from './components/CalendarCard';
import ProfitChartCard from './components/ProfitChartCard';
import { ProjectList } from './components/ProjectList';
import { StatsSummary } from './components/StatsSummary';
import { ModuleQuickHub } from './components/ModuleQuickHub';
import { useDashboardData } from './hooks/useDashboardData';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { projects, stats, liveCounts } = useDashboardData();
  const { user } = useProfile();
  const navigate = useNavigate();

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
            className="px-4 py-2 rounded-2xl bg-primary text-white text-[11px] font-black uppercase tracking-wider hover:bg-primary-hover transition-colors shadow-sm cursor-pointer"
          >
            Settings
          </button>
        </div>
      </motion.div>

      {/* Dynamic Module Quick Action Grid */}
      <ModuleQuickHub liveCounts={liveCounts} stats={stats} />

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
