import { useCallback, useMemo, useState } from 'react';
import type {
  CreateRecreationalBenefitRequest,
  RecreationalBenefit,
  UpdateRecreationalBenefitRequest,
  AssignRecreationalBenefitRequest,
  RecordRecreationalBenefitUsageRequest,
} from '../types/index';

import {
  useGetRecreationalBenefitsQuery,
  useGetRecreationalBenefitByIdQuery,
  useGetRecreationalBenefitStatsQuery,
  useCreateRecreationalBenefitMutation,
  useUpdateRecreationalBenefitMutation,
  useDeleteRecreationalBenefitMutation,
  useAssignRecreationalBenefitMutation,
  useRevokeRecreationalBenefitAssignmentMutation,
  useGetRecreationalBenefitAssignmentsQuery,
  useRecordRecreationalBenefitUsageMutation,
  useGetRecreationalBenefitUsageQuery,
  useApproveRecreationalBenefitUsageMutation,
  useRejectRecreationalBenefitUsageMutation,
  useGetMyRecreationalBenefitsQuery,
} from '@/store/api/recreationalbenefitsSlice';

interface UseRecreationalBenefitsOptions {
  benefitId?: number;
  employeeId?: number;
  skip?: boolean;
}

type BenefitStatus = 'All' | 'Active' | 'Inactive';

export const useRecreationalBenefits = ({
  benefitId,
  skip = false,
}: UseRecreationalBenefitsOptions = {}) => {
  // ==========================================
  // Filters
  // ==========================================

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<BenefitStatus>('All');
  const [benefitType, setBenefitType] = useState('All');

  // ==========================================
  // Get All Benefits
  // ==========================================

  const {
    data: benefitsData = [],
    isLoading: isBenefitsLoading,
    isFetching: isBenefitsFetching,
    error: benefitsError,
    refetch: refetchBenefits,
  } = useGetRecreationalBenefitsQuery(undefined, {
    skip,
  });

  // ==========================================
  // Get Single Benefit
  // ==========================================

  const {
    data: benefit,
    isLoading: isBenefitLoading,
    isFetching: isBenefitFetching,
    error: benefitError,
    refetch: refetchBenefit,
  } = useGetRecreationalBenefitByIdQuery(benefitId!, {
    skip: skip || !benefitId,
  });

  // ==========================================
  // Get Statistics
  // ==========================================

  const {
    data: stats,
    isLoading: isStatsLoading,
    isFetching: isStatsFetching,
    error: statsError,
    refetch: refetchStats,
  } = useGetRecreationalBenefitStatsQuery(undefined, {
    skip,
  });

  // ==========================================
  // Get Assignments
  // ==========================================

  const {
    data: assignments = [],
    isLoading: isAssignmentsLoading,
    isFetching: isAssignmentsFetching,
    error: assignmentsError,
    refetch: refetchAssignments,
  } = useGetRecreationalBenefitAssignmentsQuery(benefitId!, {
    skip: skip || !benefitId,
  });

  // ==========================================
  // Get Usage
  // ==========================================

  const {
    data: usage = [],
    isLoading: isUsageLoading,
    isFetching: isUsageFetching,
    error: usageError,
    refetch: refetchUsage,
  } = useGetRecreationalBenefitUsageQuery(benefitId!, {
    skip: skip || !benefitId,
  });

  // ==========================================
  // Get My Benefits
  // ==========================================

  const {
    data: myBenefits = [],
    isLoading: isMyBenefitsLoading,
    isFetching: isMyBenefitsFetching,
    error: myBenefitsError,
    refetch: refetchMyBenefits,
  } = useGetMyRecreationalBenefitsQuery(undefined, {
    skip,
  });

  // ==========================================
  // Mutations
  // ==========================================

  const [createBenefitMutation, { isLoading: isCreating, error: createError }] =
    useCreateRecreationalBenefitMutation();

  const [updateBenefitMutation, { isLoading: isUpdating, error: updateError }] =
    useUpdateRecreationalBenefitMutation();

  const [deleteBenefitMutation, { isLoading: isDeleting, error: deleteError }] =
    useDeleteRecreationalBenefitMutation();

  const [assignBenefitMutation, { isLoading: isAssigning, error: assignError }] =
    useAssignRecreationalBenefitMutation();

  const [revokeAssignmentMutation, { isLoading: isRevoking, error: revokeError }] =
    useRevokeRecreationalBenefitAssignmentMutation();

  const [recordUsageMutation, { isLoading: isRecordingUsage, error: recordUsageError }] =
    useRecordRecreationalBenefitUsageMutation();

  const [approveUsageMutation, { isLoading: isApprovingUsage, error: approveUsageError }] =
    useApproveRecreationalBenefitUsageMutation();

  const [rejectUsageMutation, { isLoading: isRejectingUsage, error: rejectUsageError }] =
    useRejectRecreationalBenefitUsageMutation();

  // ==========================================
  // Filter Benefits
  // ==========================================

  const benefits = useMemo(() => {
    return benefitsData.filter((benefit: RecreationalBenefit) => {
      const searchValue = search.trim().toLowerCase();

      const matchesSearch =
        !searchValue ||
        benefit.benefit_name.toLowerCase().includes(searchValue) ||
        benefit.benefit_type.toLowerCase().includes(searchValue) ||
        benefit.benefit_description?.toLowerCase().includes(searchValue);

      const matchesStatus = status === 'All' || benefit.status === status;

      const matchesType = benefitType === 'All' || benefit.benefit_type === benefitType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [benefitsData, search, status, benefitType]);

  // ==========================================
  // Clear Filters
  // ==========================================

  const clearFilters = () => {
    setSearch('');
    setStatus('All');
    setBenefitType('All');
  };

  // ==========================================
  // Create Benefit
  // ==========================================

  const createBenefit = async (data: CreateRecreationalBenefitRequest) => {
    return await createBenefitMutation(data).unwrap();
  };

  // ==========================================
  // Update Benefit
  // ==========================================

  const updateBenefit = async (id: number, data: UpdateRecreationalBenefitRequest) => {
    return await updateBenefitMutation({
      id,
      data,
    }).unwrap();
  };

  // ==========================================
  // Delete Benefit
  // ==========================================

  const deleteBenefit = async (id: number) => {
    return await deleteBenefitMutation(id).unwrap();
  };

  // ==========================================
  // Toggle Benefit Status
  // ==========================================

  const toggleBenefitStatus = async (id: number, currentStatus: 'Active' | 'Inactive') => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';

    return await updateBenefitMutation({
      id,
      data: {
        status: nextStatus,
      },
    }).unwrap();
  };

  // ==========================================
  // Assign Benefit
  // ==========================================

  const assignBenefit = async (id: number, data: AssignRecreationalBenefitRequest) => {
    return await assignBenefitMutation({
      id,
      data,
    }).unwrap();
  };

  // ==========================================
  // Revoke Assignment
  // ==========================================

  const revokeAssignment = async (assignmentId: number) => {
    return await revokeAssignmentMutation(assignmentId).unwrap();
  };

  // ==========================================
  // Record Usage
  // ==========================================

  const recordUsage = async (assignmentId: number, data: RecordRecreationalBenefitUsageRequest) => {
    return await recordUsageMutation({
      assignmentId,
      data,
    }).unwrap();
  };

  // ==========================================
  // Approve Usage
  // ==========================================

  const approveUsage = async (usageId: number) => {
    return await approveUsageMutation(usageId).unwrap();
  };

  // ==========================================
  // Reject Usage
  // ==========================================

  const rejectUsage = async (usageId: number, reason?: string) => {
    return await rejectUsageMutation({
      usageId,
      rejection_reason: reason,
    }).unwrap();
  };

  // ==========================================
  // Refresh
  // ==========================================

  const refresh = async () => {
    await Promise.all([
      refetchBenefits(),
      refetchStats(),
      benefitId ? refetchBenefit() : Promise.resolve(),
      benefitId ? refetchAssignments() : Promise.resolve(),
      benefitId ? refetchUsage() : Promise.resolve(),
      refetchMyBenefits(),
    ]);
  };

  // ==========================================
  // Loading
  // ==========================================

  const isLoading =
    isBenefitsLoading ||
    isBenefitLoading ||
    isStatsLoading ||
    isAssignmentsLoading ||
    isUsageLoading ||
    isMyBenefitsLoading;

  const isFetching =
    isBenefitsFetching ||
    isBenefitFetching ||
    isStatsFetching ||
    isAssignmentsFetching ||
    isUsageFetching ||
    isMyBenefitsFetching;

  const isMutating =
    isCreating ||
    isUpdating ||
    isDeleting ||
    isAssigning ||
    isRevoking ||
    isRecordingUsage ||
    isApprovingUsage ||
    isRejectingUsage;

  // ==========================================
  // Return
  // ==========================================

  return {
    // Data
    benefits,
    benefit,
    stats,
    assignments,
    usage,
    myBenefits,

    // Filters
    search,
    status,
    benefitType,

    setSearch,
    setStatus,
    setBenefitType,

    clearFilters,

    // Loading
    isLoading,
    isFetching,
    isMutating,

    isBenefitsLoading,
    isBenefitLoading,
    isStatsLoading,
    isAssignmentsLoading,
    isUsageLoading,
    isMyBenefitsLoading,

    statsLoading: isStatsLoading,

    isCreating,
    isUpdating,
    isDeleting,
    isAssigning,
    isRevoking,
    isRecordingUsage,
    isApprovingUsage,
    isRejectingUsage,

    // Errors
    benefitsError,
    benefitError,
    statsError,
    assignmentsError,
    usageError,
    myBenefitsError,

    createError,
    updateError,
    deleteError,
    assignError,
    revokeError,
    recordUsageError,
    approveUsageError,
    rejectUsageError,

    // Actions
    createBenefit,
    updateBenefit,
    deleteBenefit,

    toggleBenefitStatus,

    assignBenefit,
    revokeAssignment,

    recordUsage,
    approveUsage,
    rejectUsage,

    // Refetch
    refetchBenefits,
    refetchBenefit,
    refetchStats,
    refetchAssignments,
    refetchUsage,
    refetchMyBenefits,

    refresh,
  };
};

// ==========================================
// Form Hook (Moved to Top Level)
// ==========================================

export const useRecreationalBenefitForm = () => {
  const [createRecreationalBenefit, { isLoading: isCreating }] =
    useCreateRecreationalBenefitMutation();

  const createBenefit = useCallback(
    async (data: CreateRecreationalBenefitRequest) => {
      return await createRecreationalBenefit(data).unwrap();
    },
    [createRecreationalBenefit]
  );

  return {
    createBenefit,
    isCreating,
  };
};
