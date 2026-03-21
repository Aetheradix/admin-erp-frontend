import { type ReactNode } from 'react';
import { PrimeReactProvider } from 'primereact/api';

export const PrimeProvider = ({ children }: { children: ReactNode }) => {
  return (
    <PrimeReactProvider>
      {children}
    </PrimeReactProvider>
  );
};
