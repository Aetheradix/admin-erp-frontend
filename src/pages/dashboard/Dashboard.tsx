import AttendanceCard from './components/AttendanceCard';
import CalendarCard from './components/CalendarCard';
import ProjectCard from './components/ProjectCard';
import ProfitChartCard from './components/ProfitChartCard';
import { motion } from 'framer-motion';

const projects = [
  { title: 'Decem App', tasks: 908, value: '$ 391,991', color: '#E8583A', category: 'FINANCE', participants: 14 },
  { title: 'SkyLux', tasks: 12, value: '$ 51,792', color: '#fbbd34', category: 'EDUCATION', participants: 4 },
  { title: 'DushMash', tasks: 32, value: '$ 31,955', color: '#9747ff', category: 'FINANCE', participants: 3 },
  { title: 'Biofarm', tasks: 19, value: '$ 11,538', color: '#34d399', category: 'HEALTHCARE', participants: 6 },
  { title: 'PAD move', tasks: 35, value: '$ 21,688', color: '#fb7185', category: 'TRAVEL', participants: 5 }
];

const Dashboard = () => {
  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-12 gap-6 lg:gap-8">

        {/* Left Column - 4 cols */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AttendanceCard />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex-1"
          >
            <CalendarCard />
          </motion.div>
        </div>

        {/* Right Column - 8 cols */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">

          {/* Projects Section */}
          <div className="bg-white rounded-4xl p-8 border border-border-subtle shadow-soft">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-black text-foreground">Projects</h1>
                <div className="bg-surface-subtle px-3 py-1 rounded-full border border-border-subtle">
                  <span className="text-[10px] font-black text-muted tracking-widest uppercase">88 TOTAL</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-subtle flex items-center justify-center border border-border-subtle cursor-pointer hover:bg-surface-elevated transition-colors">
                  <i className="pi pi-ellipsis-h text-muted"></i>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20 cursor-pointer hover:bg-primary-hover transition-colors">
                  <i className="pi pi-plus text-white text-xs"></i>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* New Project Placeholder */}
              <motion.div
                whileHover={{ scale: 0.98 }}
                className="border-2 border-dashed border-border-subtle rounded-3xl flex flex-col items-center justify-center min-h-40 cursor-pointer group hover:border-primary/50 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-surface-subtle flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                  <i className="pi pi-plus text-muted group-hover:text-primary transition-colors"></i>
                </div>
                <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">New Project</span>
              </motion.div>

              {projects.map((project, idx) => (
                <motion.div
                  key={project.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + idx * 0.05 }}
                >
                  <ProjectCard {...project} />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Stats Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white rounded-4xl p-8 border border-border-subtle shadow-soft"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-black text-foreground uppercase tracking-wider">Projects Output</h2>
                <div className="w-8 h-8 rounded-full bg-surface-subtle flex items-center justify-center border border-border-subtle cursor-pointer">
                  <i className="pi pi-arrow-up-right text-muted text-xs"></i>
                </div>
              </div>

              <div className="flex flex-col gap-8">
                <div>
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Average Tasks Value</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-foreground">$ 568,338</span>
                    <span className="text-[10px] font-bold text-error">- 321.339 VS LY</span>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Average Tasks / Project</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-foreground">89.3</span>
                    <span className="text-[10px] font-bold text-success">+ 41.4 VS LY</span>
                  </div>
                </div>
              </div>
            </motion.div>

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
