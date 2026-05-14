import { useState, useEffect, useMemo } from 'react';
import { Team } from '../types';
import { mockTeams } from '../mockData';

export const useTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [view, setView] = useState<string>('grid');

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      try {
        setTeams(mockTeams);
      } catch (error) {
        console.error('Failed to fetch teams', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const filteredTeams = useMemo(() => {
    return teams.filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.department.toLowerCase().includes(search.toLowerCase())
    );
  }, [teams, search]);

  return { 
    teams: filteredTeams, 
    totalTeams: teams.length,
    loading, 
    search, 
    setSearch,
    view,
    setView
  };
};
