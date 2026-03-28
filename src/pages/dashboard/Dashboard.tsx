import CalendarCard from './components/CalendarCard';
import ProfitChartCard from './components/ProfitChartCard';
import { ProjectList } from './components/ProjectList';
import { StatsSummary } from './components/StatsSummary';
import { useDashboardData } from './hooks/useDashboardData';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { projects, stats } = useDashboardData();

  return (
    <div className="min-h-screen">
      <h1 className="sr-only">AetherERP Dashboard</h1>
      <div className="grid grid-cols-12 gap-6 lg:gap-8">

        {/* Left Column - 4 cols */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1"
          >
            <CalendarCard />
          </motion.div>
        </div>

        {/* Right Column - 8 cols */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">

          {/* Projects Section */}
          <ProjectList projects={projects} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Stats Summary */}
            <StatsSummary stats={stats} />

            {/* Profit Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <ProfitChartCard />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
