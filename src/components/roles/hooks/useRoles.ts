import { useState, useEffect } from 'react';
import { Role } from '../types';
import { mockRoles } from '../mockData';

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate fetching data
    const fetchRoles = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        setRoles(mockRoles);
      } catch (error) {
        console.error('Failed to fetch roles', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  return { roles, loading };
};
