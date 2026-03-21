import { type ReactNode } from 'react';
import { PrimeProvider } from './PrimeProvider';
import { AuthProvider } from '../context/AuthContext';

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <PrimeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </PrimeProvider>
  );
};
