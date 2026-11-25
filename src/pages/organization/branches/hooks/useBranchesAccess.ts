import { useAuth } from '@/hooks/useAuth';
import { usePermission } from '@/hooks/usePermission';

export function useBranchesAccess(): boolean {
  const { isSuperadmin: isAuthSuper, roles } = useAuth();
  const { can, isSuperadmin: isPermSuper } = usePermission();
  return (
    isAuthSuper ||
    isPermSuper ||
    can('organization:manage') ||
    Boolean(
      roles?.some((r) => {
        const lr = String(r)
          .toLowerCase()
          .replace(/[\s_-]/g, '');
        return lr.includes('admin') || lr.includes('hr');
      })
    )
  );
}
