/**
 * Centralized environment configuration for AetherERP.
 * This is the 'single source of truth' for mapping backend URLs based on the hosting environment.
 */

const HOST_MAPPING: Record<string, string> = {
    'erp.aetheradix.com': 'https://test.aetheradix.com',
    'test.aetheradix.com': 'https://test.aetheradix.com',
    'localhost': 'http://localhost:5000', // Default local backend port
};

const getApiBaseUrl = (): string => {
    // Priority 1: Environment variable from build/deployment (Vercel, Docker, etc.)
    console.log(`[Env Config] Checking VITE_API_BASE_URL: ${import.meta.env.VITE_API_BASE_URL}`);
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }

    // Priority 2: Dynamic mapping based on current hostname
    const currentHost = window.location.hostname;

    if (HOST_MAPPING[currentHost]) {
        return HOST_MAPPING[currentHost];
    }

    // Priority 3: Fallback for specific hosting sites to use relative paths
    // If the host is one of the hosting sites, we assume a reverse proxy is used.
    if (currentHost.includes('hostingsite.com') || currentHost.includes('hostingersite.com')) {
        return ''; // Relative to current host
    }

    // Priority 4: Default fallback
    return import.meta.env.DEV ? 'http://localhost:5000' : '';
};

export const API_BASE_URL = getApiBaseUrl();

// Standardized API endpoint URL
// If API_BASE_URL is empty, it results in '/api' (relative path)
// If it starts with http, it results in 'http://.../api' (absolute path)
export const API_URL = API_BASE_URL ? `${API_BASE_URL}/api` : '/api';

console.log(`[Env Config] Host: ${window.location.hostname}, API Base: ${API_BASE_URL || '(relative)'}, Final API URL: ${API_URL}`);
