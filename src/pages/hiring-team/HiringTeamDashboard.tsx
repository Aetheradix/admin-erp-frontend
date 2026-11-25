import { useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  getFormConfiguration,
  type ProfileCompletionData,
} from '@/services/employeeProfileService';
import { canAssignEmployeeId } from './hiring/utils';
import type { HiringActor, HiringView } from './hiring/types';
import { useHiringProfiles } from './hiring/hooks/useHiringProfiles';
import { useHiringSelection } from './hiring/hooks/useHiringSelection';
import { useHiringFilters } from './hiring/hooks/useHiringFilters';
import { useHiringReview } from './hiring/hooks/useHiringReview';
import { useHiringActions } from './hiring/hooks/useHiringActions';
import { useRequestChanges } from './hiring/hooks/useRequestChanges';
import { useAssignId } from './hiring/hooks/useAssignId';
import { HiringHeader } from './hiring/components/HiringHeader';
import { HiringMetrics } from './hiring/components/HiringMetrics';
import { OnboardingPanel } from './hiring/components/OnboardingPanel';
import { HiringToolbar } from './hiring/components/HiringToolbar';
import { HiringTable } from './hiring/components/HiringTable';
import { ReviewDialog } from './hiring/components/ReviewDialog';
import { RequestChangesDialog } from './hiring/components/RequestChangesDialog';
import { AssignIdDialog } from './hiring/components/AssignIdDialog';

export default function HiringTeamDashboard() {
  const { user, isSuperadmin } = useAuth();
  const data = useHiringProfiles();
  const selection = useHiringSelection(data.combinedProfiles);
  const filters = useHiringFilters(data.combinedProfiles);
  const review = useHiringReview({ setSelectedProfile: selection.setSelectedProfile });
  const [mainView, setMainView] = useState<HiringView>('table');

  const formConfig = useMemo(() => getFormConfiguration(), []);

  const actor = useMemo<HiringActor>(() => {
    const legacyName = (user as { name?: string } | null)?.name;
    return {
      name: user?.username || legacyName || 'HR Admin',
      email: user?.email || '',
      role: user?.role || (isSuperadmin ? 'SuperAdmin' : 'Employee'),
    };
  }, [user, isSuperadmin]);

  const canAssignId = canAssignEmployeeId(isSuperadmin, actor.role);

  const actions = useHiringActions({
    actor,
    refreshList: data.refreshList,
    setSelectedProfile: selection.setSelectedProfile,
  });
  const changes = useRequestChanges({ actor, refreshList: data.refreshList });
  const assign = useAssignId({
    actor,
    dbUsers: data.dbUsers,
    refetchDbUsers: data.refetchDbUsers,
    refreshList: data.refreshList,
    selectedProfile: selection.selectedProfile,
    setSelectedProfile: selection.setSelectedProfile,
  });

  const handleApprove = (profile: ProfileCompletionData) =>
    actions.handleApprove(profile.userId, profile.userEmail, profile.personal?.fullName);

  const handleApproveSelected = () => {
    if (selection.selectedProfile) handleApprove(selection.selectedProfile);
  };

  const handleOpenAssignId = (profile: ProfileCompletionData) => assign.openAssignId(profile);

  const handleRequestRevisions = () => {
    if (selection.selectedProfile) changes.openChangesModal(selection.selectedProfile.userId);
  };

  return (
    <div className="space-y-6">
      <HiringHeader onRefresh={data.refreshList} />

      <HiringMetrics
        metrics={data.metrics}
        mainView={mainView}
        onToggleOnboarding={() => setMainView(mainView === 'onboarding' ? 'table' : 'onboarding')}
      />

      {mainView === 'onboarding' && (
        <OnboardingPanel
          profiles={data.combinedProfiles}
          formConfig={formConfig}
          onboardingCount={data.metrics.onboarding + data.metrics.pending + data.metrics.changes}
        />
      )}

      <HiringToolbar
        activeTab={filters.activeTab}
        onTabChange={filters.setActiveTab}
        searchQuery={filters.searchQuery}
        onSearchChange={filters.setSearchQuery}
      />

      <HiringTable
        profiles={filters.filteredProfiles}
        formConfig={formConfig}
        canAssignId={canAssignId}
        isLoading={data.isUsersLoading}
        onReview={review.openReview}
        onApprove={handleApprove}
        onOpenAssignId={handleOpenAssignId}
      />

      <ReviewDialog
        visible={review.isReviewOpen}
        profile={selection.selectedProfile}
        formConfig={formConfig}
        activeTab={review.reviewTab}
        canAssignId={canAssignId}
        onTabChange={review.setReviewTab}
        onClose={review.closeReview}
        onRequestRevisions={handleRequestRevisions}
        onApprove={handleApproveSelected}
        onOpenAssignId={() => {
          if (selection.selectedProfile) assign.openAssignId(selection.selectedProfile);
        }}
      />

      <RequestChangesDialog
        visible={changes.isChangesModalOpen}
        notes={changes.changesNotes}
        onNotesChange={changes.setChangesNotes}
        onClose={changes.closeChangesModal}
        onSubmit={changes.submitChanges}
      />

      <AssignIdDialog
        visible={assign.isAssignIdModalOpen}
        profile={selection.selectedProfile}
        userRole={actor.role}
        empIdInput={assign.empIdInput}
        onEmpIdChange={(value) => {
          assign.setEmpIdInput(value);
          assign.setAssignError('');
        }}
        roleInput={assign.roleInput}
        onRoleChange={assign.setRoleInput}
        departmentInput={assign.departmentInput}
        onDepartmentChange={assign.setDepartmentInput}
        designationInput={assign.designationInput}
        onDesignationChange={assign.setDesignationInput}
        assignError={assign.assignError}
        isAssigning={assign.isAssigning}
        onClose={assign.closeAssignId}
        onConfirm={assign.confirmAssignId}
      />
    </div>
  );
}
