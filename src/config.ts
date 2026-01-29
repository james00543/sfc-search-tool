export const getApiBaseUrl = () => {
    // Always use relative path so requests go through the own server (proxy)
    // This avoids CORS issues where the API doesn't allow our origin.
    return '';
};
