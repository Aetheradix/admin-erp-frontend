import { type ReactNode } from 'react';
import { AntdProvider } from './AntdProvider';
import { AuthProvider } from '../context/AuthContext';
import { Provider } from 'react-redux';
import { store } from '@/store';

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <Provider store={store}>
      <AntdProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </AntdProvider>
    </Provider>
  );
};
