export interface Permissions {
  projects: boolean;
  finance: boolean;
  users: boolean;
  settings: boolean;
  reports: boolean;
  inventory: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  users: number;
  color: string;
  permissions: Permissions;
}
