import {
  useGetFeaturePermissionsQuery,
  useToggleFeatureMutation,
} from '@/store/api/permissionSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';

export const useFeatureControl = () => {
  const { data: permissions = [], isLoading } = useGetFeaturePermissionsQuery();
  const [toggleFeature] = useToggleFeatureMutation();

  const handleToggle = async (feature_name: string, department: string, is_enabled: boolean) => {
    try {
      await toggleFeature({ feature_name, department, is_enabled }).unwrap();
      showToast({
        severity: 'success',
        summary: 'Success',
        detail: `Feature ${is_enabled ? 'enabled' : 'disabled'} for ${department}.`,
        life: 3000,
      });
    } catch (err: any) {
      console.error('Failed to toggle feature:', err);
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: err.data?.message || 'Failed to toggle feature.',
        life: 3000,
      });
    }
  };

  const isEnabled = (feature: string, dept: string) => {
    return permissions.some(
      (p) => p.feature_name === feature && p.department === dept && p.is_enabled
    );
  };

  return {
    permissions,
    isLoading,
    handleToggle,
    isEnabled,
  };
};
