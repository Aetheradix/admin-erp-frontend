import { useState } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Dialog } from 'primereact/dialog';
import { CareerCard } from './components/CareerCard';
import { CareerTableToolbar } from './components/CareerTableToolbar';
import { CareerForm } from './components/CareerForm';
import { mockCareers as initialMockData, type Career } from './hooks/mockCareers';
import { useCareerFilters } from './hooks/useCareerFilters';
import { Briefcase, Sparkles } from 'lucide-react';

export function CareerList() {
  const [careers, setCareers] = useState<Career[]>(initialMockData);
  const [showForm, setShowForm] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  
  const { searchQuery, setSearchQuery, activeDepartment, setActiveDepartment } = useCareerFilters();

  const filteredCareers = careers.filter((career) => {
    const matchesDepartment = activeDepartment === 'All' || career.department === activeDepartment;
    const matchesSearch = 
      career.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      career.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDepartment && matchesSearch;
  });

  const handleCreate = () => {
    setEditingCareer(null);
    setShowForm(true);
  };

  const handleEdit = (id: string) => {
    const career = careers.find(c => c.id === id);
    if (career) {
      setEditingCareer(career);
      setShowForm(true);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this position?')) {
      setCareers(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleSubmit = (data: Partial<Career>) => {
    if (editingCareer) {
      setCareers(prev => prev.map(c => c.id === editingCareer.id ? { ...c, ...data } as Career : c));
    } else {
      const newCareer: Career = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        postedDate: new Date().toISOString().split('T')[0],
        status: 'Open'
      } as Career;
      setCareers(prev => [newCareer, ...prev]);
    }
    setShowForm(false);
  };

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <PageHeader
        title="Impact Careers"
        description="Join a team of visionaries and builders shaping the future of enterprise intelligence."
        primaryAction={{
          label: 'Post New Role',
          onClick: handleCreate,
          icon: 'pi pi-plus',
          className: 'px-8! py-4! rounded-3xl! font-black! tracking-widest! shadow-xl! shadow-primary/20!',
        }}
      />

      {/* Main Content Area */}
      <div className="flex flex-col gap-8">
        {/* Filtering & Search Toolbar */}
        <CareerTableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeDepartment={activeDepartment}
          onDepartmentChange={setActiveDepartment}
        />

        {/* Results Info */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles size={18} />
            </div>
            <div>
              <h4 className="text-sm font-black text-foreground uppercase tracking-widest">
                {filteredCareers.length} Opportunities Found
              </h4>
              <p className="text-xs text-muted font-bold">Showing roles in {activeDepartment}</p>
            </div>
          </div>
        </div>

        {/* Career Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredCareers.map((career) => (
            <CareerCard
              key={career.id}
              career={career}
              onViewDetails={(id) => console.log('view', id)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}

          {/* Empty State */}
          {filteredCareers.length === 0 && (
            <div className="col-span-full py-32 rounded-4xl border-2 border-dashed border-border-strong bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center text-center gap-6">
              <div className="w-24 h-24 rounded-full bg-surface-subtle flex items-center justify-center text-muted/30">
                <Briefcase size={48} />
              </div>
              <div className="max-w-md px-6">
                <h3 className="text-2xl font-black text-foreground mb-2">No Matching Roles</h3>
                <p className="text-muted font-medium leading-relaxed">
                  We couldn't find any positions matching your criteria. Try adjusting your filters or 
                  <span className="text-primary cursor-pointer hover:underline mx-1">join our talent network</span>
                  to stay updated on future openings.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Values / Perks Banner */}
      <div className="mt-8 p-12 rounded-4xl bg-foreground text-white relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-linear-to-l from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-xl flex flex-col gap-4">
            <h2 className="text-4xl font-black leading-tight tracking-tight">
              Beyond Just a Job. <br />
              <span className="text-primary">A Culture of Excellence.</span>
            </h2>
            <p className="text-muted-foreground text-lg font-medium leading-relaxed">
              We offer more than just competitive compensation. From visionary projects to a supportive ecosystem, 
              we provide the environment for you to do the best work of your life.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 w-full lg:w-auto">
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-black text-primary">100%</span>
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Remote-First</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-black text-primary">Equity</span>
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ownership Stake</span>
            </div>
          </div>
        </div>
      </div>

      {/* Career Form Modal */}
      <Dialog
        visible={showForm}
        onHide={() => setShowForm(false)}
        header={editingCareer ? "Modify Opportunity" : "Launch New Position"}
        modal
        className="w-full max-w-4xl mx-4"
        contentClassName="p-10"
        headerClassName="px-10 pt-10 pb-4 text-2xl font-black tracking-tight border-none"
        pt={{
          root: { className: 'rounded-4xl overflow-hidden border-none shadow-2xl bg-white' },
          mask: { className: 'backdrop-blur-md bg-black/40' }
        }}
      >
        <CareerForm
          initialData={editingCareer}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      </Dialog>
    </div>
  );
}
