import { useState, useEffect, useMemo } from 'react';
import { User } from '../types';
import { mockUsers } from '../mockData';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        setUsers(mockUsers);
      } catch (error) {
        console.error('Failed to fetch users', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const addUser = (data: Omit<User, 'id' | 'status' | 'lastActive' | 'avatar'>) => {
    const newUser: User = {
      ...data,
      id: `USR-${Math.floor(Math.random() * 10000)}`,
      status: 'active',
      lastActive: 'Just now',
      avatar: data.name.charAt(0).toUpperCase(),
    };
    setUsers((prev) => [newUser, ...prev]);
  };

  return {
    users: filteredUsers,
    totalUsers: users.length,
    loading,
    search,
    setSearch,
    addUser,
  };
};
