import { ReactNode } from 'react';

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  color: string;
  connected: boolean;
  category: string;
}
