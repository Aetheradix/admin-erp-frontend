import { useState } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Dialog } from 'primereact/dialog';
import { GuestPassCard } from './components/GuestPassCard';
import { GuestPassForm } from './components/GuestPassForm';
import { mockGuestPasses as initialMockData, type GuestPass } from './hooks/mockGuestPass';
import { Key, Sparkles, Filter, ShieldCheck, History, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/primitives/Button';
import { Tabs } from '@/components/ui/primitives/Tabs';

export function GuestPassPage() {
  const [passes, setPasses] = useState<GuestPass[]>(initialMockData);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('All');

  const TABS = ['All', 'Active', 'Pending', 'Expired'];

  const filteredPasses = passes.filter(p => 
    activeTab === 'All' || p.status === activeTab
  );

  const handlePassSubmit = (data: Partial<GuestPass>) => {
    const newPass: GuestPass = {
      ...data,
      id: 'GP' + (passes.length + 1),
    } as GuestPass;
    setPasses(prev => [newPass, ...prev]);
    setShowForm(false);
  };

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <PageHeader
        title="Visitor Management"
        description="Securely manage premises access by issuing temporary guest passes and tracking visitor logs."
        primaryAction={{
          label: 'Issue New Pass',
          onClick: () => setShowForm(true),
          icon: 'pi pi-key',
          className: 'px-8! py-4! rounded-2xl! font-black! tracking-widest! shadow-xl! shadow-primary/20!',
        }}
      />

      {/* Guest Pass Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Passes', value: passes.filter(p => p.status === 'Active').length, icon: ShieldCheck, color: 'text-success' },
          { label: 'Pending Arrival', value: passes.filter(p => p.status === 'Pending').length, icon: AlertCircle, color: 'text-warning' },
          { label: 'Total Visits', value: '142', icon: History, color: 'text-primary' },
          { label: 'Security Level', value: 'High', icon: Key, color: 'text-info' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-[32px] border border-border-subtle shadow-soft transition-all duration-300 hover:shadow-lg flex items-center gap-6 group">
            <div className={`w-14 h-14 rounded-2xl bg-surface-subtle flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
              <stat.icon size={28} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-foreground">{stat.value}</span>
              <span className="text-xs font-bold text-muted uppercase tracking-wider">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col gap-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[40px] border border-border-subtle shadow-soft transition-all duration-500 hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-foreground uppercase tracking-widest">Entry Log</h4>
              <p className="text-xs text-muted font-bold italic">Filtering {filteredPasses.length} visitor records</p>
            </div>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
            <Tabs 
              items={TABS}
              activeItem={activeTab}
              onItemChange={setActiveTab}
            />
          </div>

          <Button variant="secondary" className="h-12 px-6 rounded-2xl! gap-2 border-border-subtle!">
            <Filter size={16} />
            <span className="font-bold text-xs uppercase tracking-widest">Advanced Search</span>
          </Button>
        </div>

        {/* Passes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPasses.map((pass) => (
            <GuestPassCard key={pass.id} pass={pass} />
          ))}

          {/* Empty State */}
          {filteredPasses.length === 0 && (
            <div className="col-span-full py-32 flex flex-col items-center justify-center text-center gap-6 bg-white/50 backdrop-blur-sm rounded-[48px] border-2 border-dashed border-border-strong">
              <div className="w-24 h-24 rounded-full bg-surface-subtle flex items-center justify-center text-muted/30">
                <Key size={48} />
              </div>
              <div className="max-w-md px-6">
                <h3 className="text-2xl font-black text-foreground mb-2">No Passive Authorizations</h3>
                <p className="text-muted font-medium leading-relaxed">
                   Currently, there are no guest passes matching your selection. 
                   Ensure guests are registered prior to arrival.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Protocol Footer */}
      <div className="p-10 rounded-[48px] bg-foreground text-white relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl flex flex-col gap-4">
            <h2 className="text-3xl font-black leading-tight tracking-tight">
              Maintain <span className="text-primary">Perimeter Security</span>
            </h2>
            <p className="text-muted-foreground text-lg font-medium leading-relaxed">
              Always verify visitor identity matching the issued pass. For after-hours access 
              or high-security zones, please refer to the building management guidelines.
            </p>
          </div>
          <Button variant="primary" className="h-14 px-10 rounded-2xl! font-black tracking-widest shadow-xl shadow-primary/20">
            Building Rules
          </Button>
        </div>
      </div>

      {/* Issue Pass Modal */}
      <Dialog
        visible={showForm}
        onHide={() => setShowForm(false)}
        header="Generate Access Pass"
        modal
        className="w-full max-w-4xl mx-4"
        contentClassName="p-10"
        headerClassName="px-10 pt-10 pb-4 text-2xl font-black tracking-tight border-none"
        pt={{
          root: { className: 'rounded-[48px] overflow-hidden border-none shadow-2xl bg-white' },
          mask: { className: 'backdrop-blur-md bg-black/40' }
        }}
      >
        <GuestPassForm
          onSubmit={handlePassSubmit}
          onCancel={() => setShowForm(false)}
        />
      </Dialog>
    </div>
  );
}
