import { createContext, useContext, useState, type ReactNode } from 'react';

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'employee';
  image_url?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user, setUser] = useState<User | null>({
    id: '1',
    username: 'Admin User',
    role: 'admin',
    image_url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix'
  });

  const login = () => {
    setIsAuthenticated(true);
    setUser({
      id: '1',
      username: 'Admin User',
      role: 'admin'
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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
