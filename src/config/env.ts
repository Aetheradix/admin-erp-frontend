/**
 * Centralized environment configuration for AetherERP
 */

const HOST_MAPPING: Record<string, string> = {
  'erp.aetheradix.com': 'https://erp.aetheradix.com',
  'arx.aetheradix.com': 'https://arx.aetheradix.com',
  localhost: 'http://localhost:5000',
};

const getApiBaseUrl = (): string => {
  const hostname = window.location.hostname;
  console.log(import.meta.env.VITE_API_BASE_URL, hostname, HOST_MAPPING[hostname]);

  // Priority 1: Environment Variable (you can override if needed)
  if (import.meta.env.VITE_API_BASE_URL !== undefined && import.meta.env.VITE_API_BASE_URL !== '') {
    return import.meta.env.VITE_API_BASE_URL;
  }


  // Priority 2: Host-based mapping
  if (HOST_MAPPING[hostname]) {
    return HOST_MAPPING[hostname];
  }

  // Priority 3: Hostinger fallback
  if (hostname.includes('hostingsite.com') || hostname.includes('hostingersite.com')) {
    return '';
  }

  // Priority 4: Default
  return import.meta.env.DEV ? 'http://localhost:5000' : '';
};

export const API_BASE_URL = getApiBaseUrl().replace(/\/$/, ''); // strip any trailing slash

// Append /api — API_BASE_URL is guaranteed no trailing slash so no double-slash can occur
export const API_URL = API_BASE_URL + '/api';

// Gemini AI API Key from environment variables (safe fallback if unset)
export const GEMINI_API_KEY = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
