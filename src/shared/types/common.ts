import type { ReactNode } from 'react';

export type Nullable<T> = T | null;
export type Maybe<T> = T | null | undefined;

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface SelectOption<T extends string | number = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';

export interface PersonSummary {
  id?: number | string;
  userId?: number | string;
  username?: string | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  image_url?: string | null;
  role?: string | null;
  designation?: string | null;
  department?: string | null;
}

export interface ActionItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export interface PositionedNode {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}
