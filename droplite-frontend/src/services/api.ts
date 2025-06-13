import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface FileInfo {
  id: number;
  filename: string;
  originalFilename: string;
  path: string;
  contentType: string;
  size: number;
  createdAt: string;
}

export const fileService = {
  // Upload a file
  uploadFile: async (file: File): Promise<FileInfo> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<FileInfo>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Get all files
  getFiles: async (): Promise<FileInfo[]> => {
    const response = await api.get<FileInfo[]>('/files');
    return response.data;
  },

  // Download a file
  downloadFile: async (id: number, filename: string): Promise<void> => {
    const response = await api.get(`/files/download/${id}`, {
      responseType: 'blob',
    });
    
    // Create a download link and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Delete a file
  deleteFile: async (id: number): Promise<void> => {
    await api.delete(`/files/${id}`);
  },

  // View a file in the browser
  viewFile: (id: number): string => {
    return `${API_BASE_URL}/files/view/${id}`;
  },
};
