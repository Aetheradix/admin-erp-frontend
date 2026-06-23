/**
 * Centralized environment configuration for AetherERP
 */

const HOST_MAPPING: Record<string, string> = {
    'erp.aetheradix.com': 'https://test.aetheradix.com',
    'test.aetheradix.com': 'https://test.aetheradix.com',
    'localhost': 'http://localhost:5000',
};

const getApiBaseUrl = (): string => {
    const hostname = window.location.hostname;
    console.log(`[Env Config] Current Host: ${hostname}`);

    // Priority 1: Environment Variable (you can override if needed)
    if (import.meta.env.VITE_API_BASE_URL !== undefined && import.meta.env.VITE_API_BASE_URL !== '') {
        console.log(`[Env Config] Using VITE_API_BASE_URL from env: ${import.meta.env.VITE_API_BASE_URL}`);
        return import.meta.env.VITE_API_BASE_URL;
    }

    // Priority 2: Host-based mapping
    if (HOST_MAPPING[hostname]) {
        console.log(`[Env Config] Using mapping for ${hostname} → ${HOST_MAPPING[hostname]}`);
        return HOST_MAPPING[hostname];
    }

    // Priority 3: Hostinger fallback
    if (hostname.includes('hostingsite.com') || hostname.includes('hostingersite.com')) {
        console.log(`[Env Config] Using relative URL for Hostinger`);
        return '';
    }

    // Priority 4: Default
    console.log(`[Env Config] Using default fallback`);
    return import.meta.env.DEV ? 'http://localhost:5000' : '';
};

export const API_BASE_URL = getApiBaseUrl();

// Fixes double slash issues by checking if base URL already ends with a slash
export const API_URL = API_BASE_URL+'/api'
   
console.log(`[Env Config] Final API_URL: ${API_URL}`);