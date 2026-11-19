interface ApiErrorShape {
  data?: { message?: string } | string;
  message?: string;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'string') return error || fallback;
  if (error && typeof error === 'object') {
    const shaped = error as ApiErrorShape;
    if (typeof shaped.data === 'string' && shaped.data) return shaped.data;
    if (shaped.data && typeof shaped.data === 'object' && shaped.data.message) {
      return shaped.data.message;
    }
    if (shaped.message) return shaped.message;
  }
  return fallback;
}
