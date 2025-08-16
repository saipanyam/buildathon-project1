// API utilities for handling different environments

export const getApiBaseUrl = (): string => {
  // In development, use localhost
  if (import.meta.env.DEV) {
    console.log('Using development API base URL: http://localhost:8000');
    return 'http://localhost:8000';
  }
  
  // In production, use current origin (same domain as frontend)
  const origin = window.location.origin;
  console.log(`Using production API base URL: ${origin}`);
  return origin;
};

export const getImageUrl = (fileHash: string): string => {
  const url = `${getApiBaseUrl()}/uploads/${fileHash}`;
  console.log(`Generated image URL for ${fileHash}: ${url}`);
  return url;
};

export const getApiUrl = (endpoint: string): string => {
  return `${getApiBaseUrl()}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};