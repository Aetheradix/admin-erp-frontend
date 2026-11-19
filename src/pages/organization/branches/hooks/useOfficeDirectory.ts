import { useGetAllOfficesQuery, useGetGeofenceLogsQuery } from '@/store/api/attendanceSlice';
import type { BranchesSubTab } from '../types';

export function useOfficeDirectory(activeSubTab: BranchesSubTab) {
  const { data: offices = [], isLoading: isLoadingOffices, refetch: refetchOffices } =
    useGetAllOfficesQuery();
  const { data: geofenceLogs = [], isLoading: isLoadingLogs, refetch: refetchLogs } =
    useGetGeofenceLogsQuery(undefined, { skip: activeSubTab !== 'logs' });

  return { offices, isLoadingOffices, refetchOffices, geofenceLogs, isLoadingLogs, refetchLogs };
}
