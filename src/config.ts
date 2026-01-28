export const getApiBaseUrl = () => {
    // In production (Vercel), try to hit the private IP directly
    if (import.meta.env.PROD) {
        return 'http://10.16.137.111';
    }
    // In development, use the relative path to trigger the Vite proxy
    return '';
};
