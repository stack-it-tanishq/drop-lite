import axios, { AxiosError, AxiosResponse } from 'axios';

// Base URL for API requests - in production, this should come from environment variables
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

/**
 * Configured axios instance with base URL and default headers
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to prevent hanging requests
  timeout: 30000, // 30 seconds
});

// Add response interceptor for consistent error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Handle different types of errors
    if (error.response) {
      // Server responded with an error status code
      console.error('API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('API Request Error:', error.request);
    } else {
      // Something else happened while setting up the request
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Represents file metadata returned by the API
 */
export interface FileInfo {
  /** Unique identifier for the file */
  id: number;
  /** System-generated filename (UUID based) */
  filename: string;
  /** Original filename provided by the user */
  originalFilename: string;
  /** Server path to the stored file */
  path: string;
  /** MIME type of the file */
  contentType: string;
  /** File size in bytes */
  size: number;
  /** ISO 8601 timestamp when the file was uploaded */
  createdAt: string;
}

/**
 * Service for interacting with the file-related API endpoints
 */
export const fileService = {
  /**
   * Uploads a file to the server
   * @param file The file to upload
   * @returns Promise resolving to the uploaded file's metadata
   */
  uploadFile: async (file: File): Promise<FileInfo> => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post<FileInfo>('/files/upload', formData, {
        headers: {
          // Let the browser set the content type with the correct boundary
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('File upload failed:', error);
      throw new Error('Failed to upload file. Please try again.');
    }
  },

  /**
   * Fetches metadata for all files
   * @returns Promise resolving to an array of file metadata objects
   */
  getFiles: async (): Promise<FileInfo[]> => {
    try {
      const response = await api.get<FileInfo[]>('/files');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch files:', error);
      throw new Error('Failed to load files. Please refresh the page to try again.');
    }
  },

  /**
   * Initiates a file download
   * @param id The ID of the file to download
   * @param filename The desired filename for the downloaded file
   */
  downloadFile: async (id: number, filename: string): Promise<void> => {
    try {
      const response = await api.get(`/files/download/${id}`, {
        responseType: 'blob',
      });
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create and trigger a download link
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('File download failed:', error);
      throw new Error('Failed to download file. Please try again.');
    }
  },

  /**
   * Deletes a file from the server
   * @param id The ID of the file to delete
   */
  deleteFile: async (id: number): Promise<void> => {
    try {
      await api.delete(`/files/${id}`);
    } catch (error) {
      console.error(`Failed to delete file ${id}:`, error);
      throw new Error('Failed to delete file. Please try again.');
    }
  },

  /**
   * Generates a URL for viewing a file in the browser
   * @param id The ID of the file to view
   * @returns The full URL to view the file
   */
  viewFile: (id: number): string => {
    return `${API_BASE_URL}/files/view/${id}`;
  },
};
