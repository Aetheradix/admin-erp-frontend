import { type ReactNode } from 'react';
import { PrimeProvider } from './PrimeProvider';
import { AuthProvider } from '../context/AuthContext';
import { Provider } from 'react-redux';
import { store } from '@/store';

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <Provider store={store}>
      <PrimeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </PrimeProvider>
    </Provider>
  );
};
