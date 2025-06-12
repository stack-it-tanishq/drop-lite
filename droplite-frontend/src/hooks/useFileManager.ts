import { useState, useCallback } from 'react';
import { fileService, FileInfo } from '../services/api';

export const useFileManager = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fileService.getFiles();
      setFiles(data);
    } catch (err) {
      setError('Failed to fetch files');
      console.error('Error fetching files:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const newFile = await fileService.uploadFile(file);
      setFiles(prevFiles => [newFile, ...prevFiles]);
      return newFile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteFile = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await fileService.deleteFile(id);
      setFiles(prevFiles => prevFiles.filter(file => file.id !== id));
    } catch (err) {
      setError('Failed to delete file');
      console.error('Error deleting file:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const downloadFile = useCallback(async (file: FileInfo) => {
    try {
      await fileService.downloadFile(file.id, file.originalFilename);
    } catch (err) {
      setError('Failed to download file');
      console.error('Error downloading file:', err);
      throw err;
    }
  }, []);

  return {
    files,
    isLoading,
    error,
    fetchFiles,
    uploadFile,
    deleteFile,
    downloadFile,
  };
};

export default useFileManager;
