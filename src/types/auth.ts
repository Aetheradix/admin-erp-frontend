import type { UserRole } from '@/config/navItems';

export interface TeamScope {
  roleId: number;
  roleName: string;
  teamId: number | null;
  teamName?: string | null;
}

export interface UserRbac {
  userId: number;
  username: string;
  email: string;
  department?: string;
  roles: string[];
  isSuperadmin: boolean;
  permissions: string[];
  teamScopes: TeamScope[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  image_url?: string;
  designation?: string;
  employee_id?: string;
  contact_number?: string;
  department?: string;
  join_date?: string;
  roles?: string[];
  permissions?: string[];
}

export interface LoginCredentials {
  username?: string;
  email?: string;
  password?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  permissions: string[];
  roles: string[];
  teamScopes: TeamScope[];
  isSuperadmin: boolean;
  hasPermission: (permission: string) => boolean;
  refreshPermissions: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}
