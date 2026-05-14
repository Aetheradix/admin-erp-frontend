import { useState, useEffect } from 'react';
import { Integration } from '../types';
import { mockIntegrations } from '../mockData';

export const useIntegrations = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchIntegrations = async () => {
      setLoading(true);
      try {
        setIntegrations(mockIntegrations);
      } catch (error) {
        console.error('Failed to fetch integrations', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIntegrations();
  }, []);

  return {
    integrations,
    loading,
  };
};
