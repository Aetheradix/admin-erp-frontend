import { useLoginMutation, useLoginWithOTPMutation, useRequestOTPMutation } from '@/store/api/authApiSlice';
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  image_url?: string;
  designation?: string;
  employee_id?: string;
  contact_no?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<any>;
  loginWithOTP: (credentials: { email: string, otp: string }) => Promise<any>;
  requestOTP: (email: string) => Promise<any>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginMutation] = useLoginMutation();
  const [loginWithOTPMutation] = useLoginWithOTPMutation();
  const [requestOTPMutation] = useRequestOTPMutation();
 

  useEffect(() => {
    // Mock check for existing session
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const processUserData = (data: any) => {
    const loggedUser: User = {
      id: data.admin.id.toString(),
      username: data.admin.username,
      email: data.admin.email,
      role: data.admin.role || 'user',
      image_url: data.admin.image_url,
      designation: data.admin.designation,
      employee_id: data.admin.employee_id,
      contact_no: data.admin.contact_no,
    };
    
    setUser(loggedUser);
    localStorage.setItem('user', JSON.stringify(loggedUser));
    localStorage.setItem('token', data.token);
    return data;
  };

  const login = async (credentials: any) => {
    try {
      const data = await loginMutation(credentials).unwrap();
      return processUserData(data);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const loginWithOTP = async (values: { email: string, otp: string }) => {
    try {
      const data = await loginWithOTPMutation(values).unwrap();
      return processUserData(data);
    } catch (error) {
      console.error('OTP Login failed:', error);
      throw error;
    }
  };

  const requestOTP = async (email: string) => {
    try {
      return await requestOTPMutation({ email }).unwrap();
    } catch (error) {
      console.error('OTP request failed:', error);
      throw error;
    }
  };


  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
   
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, loginWithOTP, requestOTP, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
