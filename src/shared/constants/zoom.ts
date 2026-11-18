export const ZOOM_LIMITS = {
  MIN: 0.35,
  MAX: 1.8,
  DEFAULT: 0.9,
  FIT_MIN: 0.45,
  FIT_MAX: 1.0,
  STEP: 1.2,
  CANVAS_PADDING: 48,
} as const;

export const WHEEL_ZOOM_FACTORS = {
  IN: 1.12,
  OUT: 0.89,
} as const;
