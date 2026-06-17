import { PageHeader } from '@/components/ui/composed/PageHeader';
import { CalloutBanner } from '@/components/ui/composed/CalloutBanner';
import { EmptySlate } from '@/components/ui/composed/EmptySlate';
import { Dialog } from '@/components/ui/composed/Dialog';
import { CareerCard } from './components/CareerCard';
import { CareerTableToolbar } from './components/CareerTableToolbar';
import { CareerForm } from './components/CareerForm';
import { useCareerList } from './hooks/useCareerList';
import { Sparkles, Briefcase } from 'lucide-react';
import { ProgressSpinner } from '@/components/ui/composed/ProgressSpinner';

export function CareerList() {
  const {
    filteredCareers,
    isLoading,
    showForm,
    setShowForm,
    editingCareer,
    searchQuery,
    setSearchQuery,
    activeDepartment,
    setActiveDepartment,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSubmit
  } = useCareerList();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
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

      <div className="flex flex-col gap-8">
        <CareerTableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeDepartment={activeDepartment}
          onDepartmentChange={setActiveDepartment}
        />

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

          {filteredCareers.length === 0 && (
            <EmptySlate
              icon={Briefcase}
              title="No Matching Roles"
              message={
                <>We couldn't find any positions matching your criteria. Try adjusting your filters or <span className="text-primary cursor-pointer hover:underline mx-1">join our talent network</span> to stay updated on future openings.</>
              }
            />
          )}
        </div>
      </div>

      <CalloutBanner
        padding="lg"
        title={<>Beyond Just a Job. <br /><span className="text-primary">A Culture of Excellence.</span></>}
        description="We offer more than just competitive compensation. From visionary projects to a supportive ecosystem, we provide the environment for you to do the best work of your life."
        action={{ label: 'Meet the Team' }}
        className="mt-8"
      />

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
