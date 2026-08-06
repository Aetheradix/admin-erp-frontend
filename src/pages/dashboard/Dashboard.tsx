import { useProfile } from '../profile/hooks/useProfile';
import CalendarCard from './components/CalendarCard';
import ProfitChartCard from './components/ProfitChartCard';
import { ProjectList } from './components/ProjectList';
import { StatsSummary } from './components/StatsSummary';
import { useDashboardData } from './hooks/useDashboardData';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { projects, stats } = useDashboardData();
  const { user } = useProfile();
  return (
    <div className="min-h-screen pb-12">
      <h1 className="sr-only">AetherERP Dashboard</h1>

      {/* Top Welcome Section (Optional but adds premium feel) */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
          Operational Overview
        </span>
        <h2 className="text-4xl font-extrabold text-foreground tracking-tight mt-1">
          Hello, {user.name}{' '}
        </h2>
      </motion.div>

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
