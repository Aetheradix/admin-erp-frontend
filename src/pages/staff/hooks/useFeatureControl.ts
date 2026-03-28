import { useGetFeaturePermissionsQuery, useToggleFeatureMutation } from '@/store/api/permissionSlice';

export const useFeatureControl = () => {
    const { data: permissions = [], isLoading } = useGetFeaturePermissionsQuery();
    const [toggleFeature] = useToggleFeatureMutation();

    const handleToggle = async (feature_name: string, department: string, is_enabled: boolean) => {
        try {
            await toggleFeature({ feature_name, department, is_enabled }).unwrap();
        } catch (err) {
            console.error('Failed to toggle feature:', err);
        }
    };

    const isEnabled = (feature: string, dept: string) => {
        return permissions.some(p => p.feature_name === feature && p.department === dept && p.is_enabled);
    };

    return {
        permissions,
        isLoading,
        handleToggle,
        isEnabled
    };
};
