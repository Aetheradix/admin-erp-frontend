import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { RolesTab } from '../types';

export function useRolesPageState() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<RolesTab>('roles');
  const [selectedRoleForMatrix, setSelectedRoleForMatrix] = useState<number | null>(null);
  const [userSearchText, setUserSearchText] = useState('');
  const [syncedParamsKey, setSyncedParamsKey] = useState<string | null>(null);

  const tabParam = searchParams.get('tab');
  const userParam = searchParams.get('user');
  const paramsKey = `${tabParam ?? ''}|${userParam ?? ''}`;

  // Handle URL query parameters (e.g. ?tab=assignments&user=...)
  if (syncedParamsKey !== paramsKey) {
    setSyncedParamsKey(paramsKey);
    if (tabParam === 'assignments') setActiveTab('assignments');
    if (userParam) setUserSearchText(userParam);
  }

  return {
    userParam,
    activeTab,
    setActiveTab,
    selectedRoleForMatrix,
    setSelectedRoleForMatrix,
    userSearchText,
    setUserSearchText,
  };
}
