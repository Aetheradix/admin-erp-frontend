export interface User {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'employee';
    image_url?: string;
    designation?: string;
    employee_id?: string;
    contact_number?: string;
    department?: string;
    join_date?: string;
}

export interface LoginCredentials {
    username?: string;
    email?: string;
    password?: string;
}

export interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}
