import { useMemo, useState } from 'react';

import {
  useGetPerksQuery,
  useGetPerkTypesQuery,
  useGetUserPerksQuery,
  useCreatePerkMutation,
  useUpdatePerkMutation,
  useDeletePerkMutation,
  useCreatePerkTypeMutation,
  useUpdatePerkTypeMutation,
  useDeletePerkTypeMutation,
  useAssignPerkMutation,
  useUpdateUserPerkMutation,
  type Perk,
  type PerkType,
  type UserPerk,
  type CreatePerkRequest,
  type UpdatePerkRequest,
  type CreatePerkTypeRequest,
  type UpdatePerkTypeRequest,
  type AssignPerkRequest,
  type UpdateUserPerkRequest,
} from '@/store/api/benefitsSlice';

import { showToast } from '@/components/ui/composed/Toast.utils';

export const useBenefitsPage = (userId?: number) => {
  /* ============================================================
     UI STATE
  ============================================================ */

  const [search, setSearch] = useState('');

  const [activePerkType, setActivePerkType] = useState('All');

  const [activeStatus, setActiveStatus] = useState('All');

  const [selectedPerk, setSelectedPerk] = useState<Perk | null>(null);

  const [selectedPerkType, setSelectedPerkType] =
    useState<PerkType | null>(null);

  const [selectedUserPerk, setSelectedUserPerk] =
    useState<UserPerk | null>(null);

  const [showPerkForm, setShowPerkForm] = useState(false);

  const [showPerkTypeForm, setShowPerkTypeForm] = useState(false);

  /* ============================================================
     FILTERS
  ============================================================ */

  const PERK_TYPES = ['All'];

  const STATUSES = ['All', 'Active', 'Inactive'];

  /* ============================================================
     PERKS
  ============================================================ */

  const {
    data: perks = [],
    isLoading: perksLoading,
    isFetching: perksFetching,
    isError: perksError,
    refetch: refetchPerks,
  } = useGetPerksQuery();

  /* ============================================================
     PERK TYPES
  ============================================================ */

  const {
    data: perkTypes = [],
    isLoading: perkTypesLoading,
    isFetching: perkTypesFetching,
    isError: perkTypesError,
    refetch: refetchPerkTypes,
  } = useGetPerkTypesQuery();

  /* ============================================================
     USER PERKS
  ============================================================ */

  const {
    data: userPerks = [],
    isLoading: userPerksLoading,
    isFetching: userPerksFetching,
    isError: userPerksError,
    refetch: refetchUserPerks,
  } = useGetUserPerksQuery(userId);

  /* ============================================================
     PERK MUTATIONS
  ============================================================ */

  const [
    createPerk,
    { isLoading: isCreatingPerk },
  ] = useCreatePerkMutation();

  const [
    updatePerk,
    { isLoading: isUpdatingPerk },
  ] = useUpdatePerkMutation();

  const [
    deletePerk,
    { isLoading: isDeletingPerk },
  ] = useDeletePerkMutation();

  /* ============================================================
     PERK TYPE MUTATIONS
  ============================================================ */

  const [
    createPerkType,
    { isLoading: isCreatingPerkType },
  ] = useCreatePerkTypeMutation();

  const [
    updatePerkType,
    { isLoading: isUpdatingPerkType },
  ] = useUpdatePerkTypeMutation();

  const [
    deletePerkType,
    { isLoading: isDeletingPerkType },
  ] = useDeletePerkTypeMutation();

  /* ============================================================
     USER PERK MUTATIONS
  ============================================================ */

  const [
    assignPerk,
    { isLoading: isAssigningPerk },
  ] = useAssignPerkMutation();

  const [
    updateUserPerk,
    { isLoading: isUpdatingUserPerk },
  ] = useUpdateUserPerkMutation();

  /* ============================================================
     FILTER PERKS
  ============================================================ */

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

  /* ============================================================
     FILTER USER PERKS
  ============================================================ */

  const filteredUserPerks = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return userPerks.filter((userPerk) => {
      const perkName =
        typeof userPerk.name === 'string'
          ? userPerk.name
          : '';

      const description =
        typeof userPerk.description === 'string'
          ? userPerk.description
          : '';

      const matchesSearch =
        !searchValue ||
        perkName.toLowerCase().includes(searchValue) ||
        description.toLowerCase().includes(searchValue);

      return matchesSearch;
    });
  }, [userPerks, search]);

  /* ============================================================
     FILTER PERK TYPES
  ============================================================ */

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

  /* ============================================================
     OPEN PERK FORM
  ============================================================ */

  const openPerkForm = (perk: Perk | null = null) => {
    setSelectedPerk(perk);
    setShowPerkForm(true);
  };

  /* ============================================================
     CLOSE PERK FORM
  ============================================================ */

  const closePerkForm = () => {
    setShowPerkForm(false);
    setSelectedPerk(null);
  };

  /* ============================================================
     OPEN PERK TYPE FORM
  ============================================================ */

  const openPerkTypeForm = (perkType: PerkType | null = null) => {
    setSelectedPerkType(perkType);
    setShowPerkTypeForm(true);
  };

  /* ============================================================
     CLOSE PERK TYPE FORM
  ============================================================ */

  const closePerkTypeForm = () => {
    setShowPerkTypeForm(false);
    setSelectedPerkType(null);
  };

  /* ============================================================
     CREATE PERK
  ============================================================ */

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
        detail:
          error.data?.message ||
          'Failed to create perk.',
        life: 3000,
      });

      throw err;
    }
  };

  /* ============================================================
     UPDATE PERK
  ============================================================ */

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
        detail:
          error.data?.message ||
          'Failed to update perk.',
        life: 3000,
      });

      throw err;
    }
  };

  /* ============================================================
     DELETE PERK
  ============================================================ */

  const handleDeletePerk = async (id: number) => {
    try {
      const result = await deletePerk(id).unwrap();

      if (selectedPerk?.id === id) {
        setSelectedPerk(null);
      }

      showToast({
        severity: 'success',
        summary: 'Deactivated',
        detail:
          result.message ||
          'Perk deactivated successfully.',
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
        detail:
          error.data?.message ||
          'Failed to deactivate perk.',
        life: 3000,
      });

      throw err;
    }
  };

  /* ============================================================
     CREATE PERK TYPE
  ============================================================ */

  const handleCreatePerkType = async (
    data: CreatePerkTypeRequest,
  ) => {
    try {
      const result = await createPerkType(data).unwrap();

      closePerkTypeForm();

      showToast({
        severity: 'success',
        summary: 'Success',
        detail:
          result.message ||
          'Perk type created successfully.',
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
        detail:
          error.data?.message ||
          'Failed to create perk type.',
        life: 3000,
      });

      throw err;
    }
  };

  /* ============================================================
     UPDATE PERK TYPE
  ============================================================ */

  const handleUpdatePerkType = async (
    data: UpdatePerkTypeRequest,
  ) => {
    try {
      const result = await updatePerkType(data).unwrap();

      closePerkTypeForm();

      showToast({
        severity: 'success',
        summary: 'Updated',
        detail:
          result.message ||
          'Perk type updated successfully.',
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
        detail:
          error.data?.message ||
          'Failed to update perk type.',
        life: 3000,
      });

      throw err;
    }
  };

  /* ============================================================
     DELETE PERK TYPE
  ============================================================ */

  const handleDeletePerkType = async (id: number) => {
    try {
      const result = await deletePerkType(id).unwrap();

      if (selectedPerkType?.id === id) {
        setSelectedPerkType(null);
      }

      showToast({
        severity: 'success',
        summary: 'Deactivated',
        detail:
          result.message ||
          'Perk type deactivated successfully.',
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
        detail:
          error.data?.message ||
          'Failed to deactivate perk type.',
        life: 3000,
      });

      throw err;
    }
  };

  /* ============================================================
     ASSIGN PERK
  ============================================================ */

  const handleAssignPerk = async (
    data: AssignPerkRequest,
  ) => {
    try {
      const result = await assignPerk(data).unwrap();

      showToast({
        severity: 'success',
        summary: 'Assigned',
        detail:
          result.message ||
          'Perk assigned successfully.',
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
        detail:
          error.data?.message ||
          'Failed to assign perk.',
        life: 3000,
      });

      throw err;
    }
  };

  /* ============================================================
     UPDATE USER PERK
  ============================================================ */

  const handleUpdateUserPerk = async (
    data: UpdateUserPerkRequest,
  ) => {
    try {
      const result = await updateUserPerk(data).unwrap();

      setSelectedUserPerk(null);

      showToast({
        severity: 'success',
        summary: 'Updated',
        detail:
          result.message ||
          'User perk updated successfully.',
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
        detail:
          error.data?.message ||
          'Failed to update user perk.',
        life: 3000,
      });

      throw err;
    }
  };

  /* ============================================================
     BOOKKEEPING / REFRESH
  ============================================================ */

  const refetchAll = async () => {
    await Promise.all([
      refetchPerks(),
      refetchPerkTypes(),
      refetchUserPerks(),
    ]);
  };

  /* ============================================================
     LOADING
  ============================================================ */

  const isLoading =
    perksLoading ||
    perkTypesLoading ||
    userPerksLoading;

  const isFetching =
    perksFetching ||
    perkTypesFetching ||
    userPerksFetching;

  const isMutating =
    isCreatingPerk ||
    isUpdatingPerk ||
    isDeletingPerk ||
    isCreatingPerkType ||
    isUpdatingPerkType ||
    isDeletingPerkType ||
    isAssigningPerk ||
    isUpdatingUserPerk;

  /* ============================================================
     RETURN
  ============================================================ */

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

    /* User perk actions */
    handleAssignPerk,
    handleUpdateUserPerk,

    /* Loading */
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
    isUpdatingUserPerk,

    /* Refetch */
    refetchAll,
  };
};
