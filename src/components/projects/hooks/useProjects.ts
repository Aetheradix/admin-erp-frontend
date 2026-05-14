import { useState, useEffect, useMemo } from 'react';
import { Project } from '../types';
import { mockProjects } from '../mockData';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        setProjects(mockProjects);
      } catch (error) {
        console.error('Failed to fetch projects', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [projects, search]);

  return { 
    projects: filteredProjects, 
    totalProjects: projects.length,
    loading, 
    search, 
    setSearch 
  };
};
