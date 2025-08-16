import axios from 'axios';
import type { SearchResult, UploadResponse } from '../types';
import { getApiBaseUrl } from '../utils/api';

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadScreenshots = async (files: File[]): Promise<UploadResponse> => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  const response = await api.post<UploadResponse>('/upload-screenshots', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const searchScreenshots = async (query: string): Promise<SearchResult[]> => {
  const response = await api.post<SearchResult[]>('/search', { query });
  return response.data;
};

export const processFolder = async (folderPath: string): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('folder_path', folderPath);
  
  const response = await api.post<UploadResponse>('/process-folder', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getStatus = async () => {
  const response = await api.get('/api/status');
  return response.data;
};