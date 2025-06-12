import React, { useEffect, useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container, Box, Typography, Alert } from '@mui/material';
import { FileUpload } from './components/FileUpload';
import { FileList } from './components/FileList';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { uploadFile, deleteFile, fetchFiles } from './features/files/fileSlice';
import { fileService, FileInfo } from './services/api';

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

function AppContent() {
  const dispatch = useAppDispatch();
  const { files, loading, error, downloadingId, deletingId } = useAppSelector(
    (state) => ({
      files: state.files.files as FileInfo[],
      loading: state.files.loading,
      error: state.files.error,
      downloadingId: state.files.downloadingId,
      deletingId: state.files.deletingId,
    })
  );

  useEffect(() => {
    dispatch(fetchFiles());
  }, [dispatch]);

  const handleUpload = async (file: File) => {
    try {
      await dispatch(uploadFile(file)).unwrap();
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleDelete = async (file: FileInfo) => {
    try {
      await dispatch(deleteFile(file.id)).unwrap();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleDownload = async (file: FileInfo) => {
    try {
      await fileService.downloadFile(file.id, file.originalFilename);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            DropLite
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Simple file storage and sharing
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <FileUpload
            onUpload={handleUpload}
            acceptTypes={['image/*', 'application/pdf', 'text/plain']}
            maxSize={10 * 1024 * 1024} // 10MB
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>

        <Box>
          <Typography variant="h6" component="h2" gutterBottom>
            Your Files
          </Typography>
          <FileList
            files={files}
            onDownload={handleDownload}
            onDelete={handleDelete}
            isLoading={loading}
            downloadingId={downloadingId}
            deletingId={deletingId}
          />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
