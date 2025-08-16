// API utilities for handling different environments

export const getApiBaseUrl = (): string => {
  // In development, use localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:8000';
  }
  
  // In production, use current origin (same domain as frontend)
  return window.location.origin;
};

export const getImageUrl = (fileHash: string): string => {
  return `${getApiBaseUrl()}/uploads/${fileHash}`;
};

export const getApiUrl = (endpoint: string): string => {
  return `${getApiBaseUrl()}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};