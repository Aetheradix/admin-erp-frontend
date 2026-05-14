import { useState, useEffect, useMemo } from 'react';
import { Task } from '../types';
import { mockTasks } from '../mockData';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [view, setView] = useState<string>('kanban');

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        setTasks(mockTasks);
      } catch (error) {
        console.error('Failed to fetch tasks', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
  }, [tasks, search]);

  return { 
    tasks: filteredTasks, 
    totalTasks: tasks.length,
    loading, 
    search, 
    setSearch,
    view,
    setView
  };
};
