import { useState } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { PageShell } from '@/shared';
import { StaffCard } from './components/StaffCard';
import { StaffTableToolbar } from './components/StaffTableToolbar';
import { StaffDirectoryHeader } from './components/StaffDirectoryHeader';
import { StaffMemberFormModal } from './components/StaffMemberFormModal';
import { StaffEmptyState } from './components/StaffEmptyState';
import { StaffStatsSection } from './components/StaffStatsSection';
import { useStaff } from './hooks/useStaff';
import { useAuth } from '@/hooks/useAuth';
import { EmployeeModelViewModal } from '@/pages/organization/components/EmployeeModelViewModal';
import type { StaffMember } from '@/types/models';

export function StaffList() {
  const [selectedEmployeeForModel, setSelectedEmployeeForModel] = useState<StaffMember | null>(null);
  const {
    handleSubmit,
    onAddMember,
    isLoading,
    isError,
    searchQuery,
    setSearchQuery,
    activeDepartment,
    setActiveDepartment,
    staff,
    handleEdit,
    handleDelete,
    handlePromote,
    showForm,
    setShowForm,
    editingMember,
  } = useStaff();

  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  return (
    <PageShell
      isLoading={isLoading}
      isError={isError}
      errorMessage="Error loading staff directory. Please ensure the backend is running."
      className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Team Directory"
        description="Empower your workforce by managing profiles, roles, and expertise in a premium unified workspace."
        primaryAction={
          isAdmin
            ? {
                label: 'Onboard Member',
                onClick: onAddMember,
                icon: 'pi pi-user-plus',
                className:
                  'px-8! py-4! rounded-lg! font-black! tracking-widest! shadow-xl! shadow-primary/20!',
              }
            : undefined
        }
      />

      <div className="flex flex-col gap-8">
        <StaffTableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeDepartment={activeDepartment}
          onDepartmentChange={setActiveDepartment}
        />

        <StaffDirectoryHeader count={staff.length} department={activeDepartment} />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {staff.map((member) => (
            <StaffCard
              key={member.id}
              member={member}
              onEdit={isAdmin ? handleEdit : undefined}
              onDelete={isAdmin ? handleDelete : undefined}
              onPromote={isAdmin ? handlePromote : undefined}
              onClick={(m) => setSelectedEmployeeForModel(m)}
            />
          ))}

          {staff.length === 0 && <StaffEmptyState />}
        </div>
      </div>

      <StaffStatsSection />

      <EmployeeModelViewModal
        isOpen={!!selectedEmployeeForModel}
        onClose={() => setSelectedEmployeeForModel(null)}
        employee={selectedEmployeeForModel}
      />

      <StaffMemberFormModal
        visible={showForm}
        onHide={() => setShowForm(false)}
        member={editingMember}
        onSubmit={handleSubmit}
      />
    </PageShell>
  );
}
