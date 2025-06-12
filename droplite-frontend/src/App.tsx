import React, { useEffect, useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container, Box, Typography, Alert } from '@mui/material';
import { FileUpload } from './components/FileUpload';
import { FileList } from './components/FileList';
import useFileManager from './hooks/useFileManager';
import { FileInfo } from './services/api';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  const { 
    files, 
    isLoading, 
    error, 
    uploadFile, 
    deleteFile, 
    downloadFile,
    fetchFiles 
  } = useFileManager();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUpload = async (file: File) => {
    try {
      setUploadError(null);
      await uploadFile(file);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
      setUploadError(errorMessage);
    }
  };

  const handleDelete = async (file: FileInfo) => {
    try {
      await deleteFile(file.id);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete file';
      setUploadError(errorMessage);
    }
  };

  const handleDownload = async (file: FileInfo) => {
    try {
      setDownloadingId(file.id);
      await downloadFile(file);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download file';
      setUploadError(errorMessage);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            DropLite
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Simple file storage and sharing
          </Typography>
        </Box>

        {(error || uploadError) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || uploadError}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <FileUpload 
            onUpload={handleUpload} 
            isLoading={isLoading} 
          />
        </Box>

        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            Your Files
          </Typography>
          <FileList
            files={files}
            onDownload={handleDownload}
            onDelete={handleDelete}
            isLoading={isLoading}
            downloadingId={downloadingId}
          />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
