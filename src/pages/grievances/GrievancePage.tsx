import { useState } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Dialog } from 'primereact/dialog';
import { GrievanceCard } from './components/GrievanceCard';
import { GrievanceForm } from './components/GrievanceForm';
import { mockGrievances as initialMockData, type Grievance } from './hooks/mockGrievances';
import { Scale, Sparkles, Filter, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/primitives/Button';
import { Tabs } from '@/components/ui/primitives/Tabs';

export function GrievancePage() {
  const [grievances, setGrievances] = useState<Grievance[]>(initialMockData);
  const [showForm, setShowForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const CATEGORIES = ['All', ...new Set(initialMockData.map(g => g.category))];

  const filteredGrievances = grievances.filter(g => 
    activeCategory === 'All' || g.category === activeCategory
  );

  const handleGrievanceSubmit = (data: Partial<Grievance>) => {
    const newGrievance: Grievance = {
      ...data,
      id: 'G' + (grievances.length + 1),
      date: new Date().toISOString().split('T')[0],
    } as Grievance;
    setGrievances(prev => [newGrievance, ...prev]);
    setShowForm(false);
  };

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <PageHeader
        title="Grievance Management"
        description="Share your concerns in a safe, confidential environment. We are committed to your well-being and psychological safety."
        primaryAction={{
          label: 'File a Concern',
          onClick: () => setShowForm(true),
          icon: 'pi pi-megaphone',
          className: 'px-8! py-4! rounded-2xl! font-black! tracking-widest! shadow-xl! shadow-primary/20!',
        }}
      />

      {/* Trust Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-8 rounded-[40px] bg-white border border-border-subtle shadow-soft flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            <Scale size={32} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-black text-foreground">Zero Retaliation Policy</h3>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
              Our grievance process is built on trust and accessibility. We guarantee that no employee 
              will face adverse consequences for raising valid concerns or issues.
            </p>
          </div>
        </div>
        <div className="p-8 rounded-[40px] bg-foreground text-white flex flex-col justify-center gap-2">
          <span className="text-3xl font-black text-primary">{grievances.length}</span>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Active Concerns</span>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col gap-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[40px] border border-border-subtle shadow-soft transition-all duration-500 hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-foreground uppercase tracking-widest">Support Portal</h4>
              <p className="text-xs text-muted font-bold italic">Browsing {filteredGrievances.length} status updates</p>
            </div>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
            <Tabs 
              items={CATEGORIES}
              activeItem={activeCategory}
              onItemChange={setActiveCategory}
            />
          </div>

          <Button variant="secondary" className="h-12 px-6 rounded-2xl! gap-2 border-border-subtle!">
            <Filter size={16} />
            <span className="font-bold text-xs uppercase tracking-widest">Filter Status</span>
          </Button>
        </div>

        {/* Grievances Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGrievances.map((grievance) => (
            <GrievanceCard key={grievance.id} grievance={grievance} />
          ))}

          {/* Empty State */}
          {filteredGrievances.length === 0 && (
            <div className="col-span-full py-32 flex flex-col items-center justify-center text-center gap-6 bg-white/50 backdrop-blur-sm rounded-[48px] border-2 border-dashed border-border-strong">
              <div className="w-24 h-24 rounded-full bg-surface-subtle flex items-center justify-center text-muted/30">
                <AlertTriangle size={48} />
              </div>
              <div className="max-w-md px-6">
                <h3 className="text-2xl font-black text-foreground mb-2">Clear Records</h3>
                <p className="text-muted font-medium leading-relaxed">
                   No concerns match the current filter. Our environment seems to be functioning optimally!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Governance Footer */}
      <div className="p-10 rounded-[48px] bg-primary text-white relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl flex flex-col gap-4">
            <h2 className="text-3xl font-black leading-tight tracking-tight">
              A Healthier Future <span className="text-foreground">Together</span>
            </h2>
            <p className="text-white/80 text-lg font-medium leading-relaxed">
              Your feedback is essential for our growth as an organization. By sharing your concerns, you 
              directly contribute to a better, more inclusive workspace for everyone.
            </p>
          </div>
          <Button variant="secondary" className="h-14 px-10 rounded-2xl! font-black tracking-widest bg-white text-primary border-none">
            Our Rulebook
          </Button>
        </div>
      </div>

      {/* Grievance Modal */}
      <Dialog
        visible={showForm}
        onHide={() => setShowForm(false)}
        header="Submit Confidential Concern"
        modal
        className="w-full max-w-4xl mx-4"
        contentClassName="p-10"
        headerClassName="px-10 pt-10 pb-4 text-2xl font-black tracking-tight border-none"
        pt={{
          root: { className: 'rounded-[48px] overflow-hidden border-none shadow-2xl bg-white' },
          mask: { className: 'backdrop-blur-md bg-black/40' }
        }}
      >
        <GrievanceForm
          onSubmit={handleGrievanceSubmit}
          onCancel={() => setShowForm(false)}
        />
      </Dialog>
    </div>
  );
}
