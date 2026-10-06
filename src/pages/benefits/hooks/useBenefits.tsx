import { useMemo, useState } from 'react';

import {
  useGetPerksQuery,
  useGetPerkTypesQuery,
  useGetUserPerksQuery,
  useGetPerkExpensesQuery,
  useCreatePerkMutation,
  useUpdatePerkMutation,
  useDeletePerkMutation,
  useCreatePerkTypeMutation,
  useUpdatePerkTypeMutation,
  useDeletePerkTypeMutation,
  useAssignPerkMutation,
  useRecordPerkUsageMutation,
  useUpdateUserPerkMutation,
  useLinkPerkToExpenseMutation,
  type Perk,
  type PerkType,
  type UserPerk,
  type CreatePerkRequest,
  type UpdatePerkRequest,
  type CreatePerkTypeRequest,
  type UpdatePerkTypeRequest,
  type AssignPerkRequest,
  type UpdateUserPerkRequest,
  type RecordPerkUsageRequest,
  type GetPerkExpensesParams,
  type LinkPerkToExpenseRequest,
} from '@/store/api/benefitsSlice';

import { showToast } from '@/components/ui/composed/Toast.utils';

export const useBenefitsPage = (userId?: number, expenseParams?: GetPerkExpensesParams) => {
  const [search, setSearch] = useState('');

  const [activePerkType, setActivePerkType] = useState('All');

  const [activeStatus, setActiveStatus] = useState('All');

  const [selectedPerk, setSelectedPerk] = useState<Perk | null>(null);

  const [selectedPerkType, setSelectedPerkType] = useState<PerkType | null>(null);

  const [selectedUserPerk, setSelectedUserPerk] = useState<UserPerk | null>(null);

  const [showPerkForm, setShowPerkForm] = useState(false);

  const [showPerkTypeForm, setShowPerkTypeForm] = useState(false);

  const PERK_TYPES = ['All'];

  const STATUSES = ['All', 'Active', 'Inactive'];

  const {
    data: perks = [],
    isLoading: perksLoading,
    isFetching: perksFetching,
    isError: perksError,
    refetch: refetchPerks,
  } = useGetPerksQuery();

  const {
    data: perkTypes = [],
    isLoading: perkTypesLoading,
    isFetching: perkTypesFetching,
    isError: perkTypesError,
    refetch: refetchPerkTypes,
  } = useGetPerkTypesQuery();

  const {
    data: userPerks = [],
    isLoading: userPerksLoading,
    isFetching: userPerksFetching,
    isError: userPerksError,
    refetch: refetchUserPerks,
  } = useGetUserPerksQuery(userId);

  const {
    data: perkExpenses = [],
    isLoading: perkExpensesLoading,
    isFetching: perkExpensesFetching,
    isError: perkExpensesError,
    refetch: refetchPerkExpenses,
  } = useGetPerkExpensesQuery(expenseParams);

  const [createPerk, { isLoading: isCreatingPerk }] = useCreatePerkMutation();

  const [updatePerk, { isLoading: isUpdatingPerk }] = useUpdatePerkMutation();

  const [deletePerk, { isLoading: isDeletingPerk }] = useDeletePerkMutation();

  const [createPerkType, { isLoading: isCreatingPerkType }] = useCreatePerkTypeMutation();

  const [updatePerkType, { isLoading: isUpdatingPerkType }] = useUpdatePerkTypeMutation();

  const [deletePerkType, { isLoading: isDeletingPerkType }] = useDeletePerkTypeMutation();
  const [assignPerk, { isLoading: isAssigningPerk }] = useAssignPerkMutation();

  const [recordPerkUsage, { isLoading: isRecordingUsage }] = useRecordPerkUsageMutation();

  const [updateUserPerk, { isLoading: isUpdatingUserPerk }] = useUpdateUserPerkMutation();

  const [linkPerkToExpense, { isLoading: isLinkingExpense }] = useLinkPerkToExpenseMutation();

  const filteredPerks = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return perks.filter((perk) => {
      const matchesSearch =
        !searchValue ||
        perk.name?.toLowerCase().includes(searchValue) ||
        perk.description?.toLowerCase().includes(searchValue);

      const matchesStatus =
        activeStatus === 'All' ||
        (activeStatus === 'Active' && perk.is_active === true) ||
        (activeStatus === 'Inactive' && perk.is_active === false);

      return matchesSearch && matchesStatus;
    });
  }, [perks, search, activeStatus]);

  const filteredUserPerks = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return userPerks.filter((userPerk) => {
      const perkName = typeof userPerk.name === 'string' ? userPerk.name : '';

      const description = typeof userPerk.description === 'string' ? userPerk.description : '';

      const matchesSearch =
        !searchValue ||
        perkName.toLowerCase().includes(searchValue) ||
        description.toLowerCase().includes(searchValue);

      return matchesSearch;
    });
  }, [userPerks, search]);

  const filteredPerkTypes = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return perkTypes.filter((type) => {
      const matchesSearch =
        !searchValue ||
        type.name?.toLowerCase().includes(searchValue) ||
        type.description?.toLowerCase().includes(searchValue);

      const matchesStatus =
        activeStatus === 'All' ||
        (activeStatus === 'Active' && type.is_active === true) ||
        (activeStatus === 'Inactive' && type.is_active === false);

      return matchesSearch && matchesStatus;
    });
  }, [perkTypes, search, activeStatus]);

  const openPerkForm = (perk: Perk | null = null) => {
    setSelectedPerk(perk);
    setShowPerkForm(true);
  };

  const closePerkForm = () => {
    setShowPerkForm(false);
    setSelectedPerk(null);
  };

  const openPerkTypeForm = (perkType: PerkType | null = null) => {
    setSelectedPerkType(perkType);
    setShowPerkTypeForm(true);
  };

  const closePerkTypeForm = () => {
    setShowPerkTypeForm(false);
    setSelectedPerkType(null);
  };

  const handleCreatePerk = async (data: CreatePerkRequest) => {
    try {
      const result = await createPerk(data).unwrap();

      closePerkForm();

      showToast({
        severity: 'success',
        summary: 'Success',
        detail: result.message || 'Perk created successfully.',
        life: 3000,
      });

      return result;
    } catch (err: unknown) {
      const error = err as {
        data?: {
          message?: string;
        };
      };

      console.error('Failed to create perk:', err);

      showToast({
        severity: 'error',
        summary: 'Error',
        detail: error.data?.message || 'Failed to create perk.',
        life: 3000,
      });

      throw err;
    }
  };

  const handleUpdatePerk = async (data: UpdatePerkRequest) => {
    try {
      const result = await updatePerk(data).unwrap();

      closePerkForm();

      showToast({
        severity: 'success',
        summary: 'Updated',
        detail: result.message || 'Perk updated successfully.',
        life: 3000,
      });

      return result;
    } catch (err: unknown) {
      const error = err as {
        data?: {
          message?: string;
        };
      };

      console.error('Failed to update perk:', err);

      showToast({
        severity: 'error',
        summary: 'Error',
        detail: error.data?.message || 'Failed to update perk.',
        life: 3000,
      });

      throw err;
    }
  };

  const handleDeletePerk = async (id: number) => {
    try {
      const result = await deletePerk(id).unwrap();

      if (selectedPerk?.id === id) {
        setSelectedPerk(null);
      }

      showToast({
        severity: 'success',
        summary: 'Deactivated',
        detail: result.message || 'Perk deactivated successfully.',
        life: 3000,
      });

      return result;
    } catch (err: unknown) {
      const error = err as {
        data?: {
          message?: string;
        };
      };

      console.error('Failed to delete perk:', err);

      showToast({
        severity: 'error',
        summary: 'Error',
        detail: error.data?.message || 'Failed to deactivate perk.',
        life: 3000,
      });

      throw err;
    }
  };

  const handleCreatePerkType = async (data: CreatePerkTypeRequest) => {
    try {
      const result = await createPerkType(data).unwrap();

      closePerkTypeForm();

      showToast({
        severity: 'success',
        summary: 'Success',
        detail: result.message || 'Perk type created successfully.',
        life: 3000,
      });

      return result;
    } catch (err: unknown) {
      const error = err as {
        data?: {
          message?: string;
        };
      };

      console.error('Failed to create perk type:', err);

      showToast({
        severity: 'error',
        summary: 'Error',
        detail: error.data?.message || 'Failed to create perk type.',
        life: 3000,
      });

      throw err;
    }
  };

  const handleUpdatePerkType = async (data: UpdatePerkTypeRequest) => {
    try {
      const result = await updatePerkType(data).unwrap();

      closePerkTypeForm();

      showToast({
        severity: 'success',
        summary: 'Updated',
        detail: result.message || 'Perk type updated successfully.',
        life: 3000,
      });

      return result;
    } catch (err: unknown) {
      const error = err as {
        data?: {
          message?: string;
        };
      };

      console.error('Failed to update perk type:', err);

      showToast({
        severity: 'error',
        summary: 'Error',
        detail: error.data?.message || 'Failed to update perk type.',
        life: 3000,
      });

      throw err;
    }
  };

  const handleDeletePerkType = async (id: number) => {
    try {
      const result = await deletePerkType(id).unwrap();

      if (selectedPerkType?.id === id) {
        setSelectedPerkType(null);
      }

      showToast({
        severity: 'success',
        summary: 'Deactivated',
        detail: result.message || 'Perk type deactivated successfully.',
        life: 3000,
      });

      return result;
    } catch (err: unknown) {
      const error = err as {
        data?: {
          message?: string;
        };
      };

      console.error('Failed to delete perk type:', err);

      showToast({
        severity: 'error',
        summary: 'Error',
        detail: error.data?.message || 'Failed to deactivate perk type.',
        life: 3000,
      });

      throw err;
    }
  };

  const handleAssignPerk = async (data: AssignPerkRequest) => {
    try {
      const result = await assignPerk(data).unwrap();

      showToast({
        severity: 'success',
        summary: 'Assigned',
        detail: result.message || 'Perk assigned successfully.',
        life: 3000,
      });

      return result;
    } catch (err: unknown) {
      const error = err as {
        data?: {
          message?: string;
        };
      };

      console.error('Failed to assign perk:', err);

      showToast({
        severity: 'error',
        summary: 'Error',
        detail: error.data?.message || 'Failed to assign perk.',
        life: 3000,
      });

      throw err;
    }
  };

  const handleRecordPerkUsage = async (data: RecordPerkUsageRequest) => {
    try {
      const result = await recordPerkUsage(data).unwrap();

      showToast({
        severity: 'success',
        summary: 'Perk Claimed',
        detail: result.message || 'Perk usage recorded and expense logged.',
        life: 3000,
      });

      return result;
    } catch (err: unknown) {
      const error = err as {
        data?: {
          message?: string;
        };
      };

      console.error('Failed to record perk usage:', err);

      showToast({
        severity: 'error',
        summary: 'Error',
        detail: error.data?.message || 'Failed to claim perk.',
        life: 3000,
      });

      throw err;
    }
  };

  const handleUpdateUserPerk = async (data: UpdateUserPerkRequest) => {
    try {
      const result = await updateUserPerk(data).unwrap();

      setSelectedUserPerk(null);

      showToast({
        severity: 'success',
        summary: 'Updated',
        detail: result.message || 'User perk updated successfully.',
        life: 3000,
      });

      return result;
    } catch (err: unknown) {
      const error = err as {
        data?: {
          message?: string;
        };
      };

      console.error('Failed to update user perk:', err);

      showToast({
        severity: 'error',
        summary: 'Error',
        detail: error.data?.message || 'Failed to update user perk.',
        life: 3000,
      });

      throw err;
    }
  };

  const handleLinkPerkToExpense = async (data: LinkPerkToExpenseRequest) => {
    try {
      const result = await linkPerkToExpense(data).unwrap();

      showToast({
        severity: 'success',
        summary: 'Linked',
        detail: result.message || 'Expense linked to perk successfully.',
        life: 3000,
      });

      return result;
    } catch (err: unknown) {
      const error = err as {
        data?: {
          message?: string;
        };
      };

      console.error('Failed to link perk to expense:', err);

      showToast({
        severity: 'error',
        summary: 'Error',
        detail: error.data?.message || 'Failed to link expense to perk.',
        life: 3000,
      });

      throw err;
    }
  };

  const refetchAll = async () => {
    await Promise.all([
      refetchPerks(),
      refetchPerkTypes(),
      refetchUserPerks(),
      refetchPerkExpenses(),
    ]);
  };


  const isLoading = perksLoading || perkTypesLoading || userPerksLoading || perkExpensesLoading;

  const isFetching =
    perksFetching || perkTypesFetching || userPerksFetching || perkExpensesFetching;

  const isMutating =
    isCreatingPerk ||
    isUpdatingPerk ||
    isDeletingPerk ||
    isCreatingPerkType ||
    isUpdatingPerkType ||
    isDeletingPerkType ||
    isAssigningPerk ||
    isRecordingUsage ||
    isUpdatingUserPerk ||
    isLinkingExpense;


  return {
    /* Perks */
    perks,
    filteredPerks,
    perksLoading,
    perksFetching,
    perksError,
    refetchPerks,

    /* Perk Types */
    perkTypes,
    filteredPerkTypes,
    perkTypesLoading,
    perkTypesFetching,
    perkTypesError,
    refetchPerkTypes,

    /* User Perks */
    userPerks,
    filteredUserPerks,
    userPerksLoading,
    userPerksFetching,
    userPerksError,
    refetchUserPerks,

    /* Perk Expenses */
    perkExpenses,
    perkExpensesLoading,
    perkExpensesFetching,
    perkExpensesError,
    refetchPerkExpenses,

    /* Search */
    search,
    setSearch,

    /* Filters */
    activePerkType,
    setActivePerkType,
    PERK_TYPES,

    activeStatus,
    setActiveStatus,
    STATUSES,

    /* Perk form */
    showPerkForm,
    setShowPerkForm,
    selectedPerk,
    setSelectedPerk,
    openPerkForm,
    closePerkForm,

    /* Perk type form */
    showPerkTypeForm,
    setShowPerkTypeForm,
    selectedPerkType,
    setSelectedPerkType,
    openPerkTypeForm,
    closePerkTypeForm,

    /* User perk */
    selectedUserPerk,
    setSelectedUserPerk,

    /* Perk actions */
    handleCreatePerk,
    handleUpdatePerk,
    handleDeletePerk,

    /* Perk type actions */
    handleCreatePerkType,
    handleUpdatePerkType,
    handleDeletePerkType,

    handleAssignPerk,
    handleRecordPerkUsage,
    handleUpdateUserPerk,
    handleLinkPerkToExpense,
    isLoading,
    isFetching,
    isMutating,
    isCreatingPerk,
    isUpdatingPerk,
    isDeletingPerk,
    isCreatingPerkType,
    isUpdatingPerkType,
    isDeletingPerkType,
    isAssigningPerk,
    isRecordingUsage,
    isUpdatingUserPerk,
    isLinkingExpense,
    refetchAll,
  };
};
