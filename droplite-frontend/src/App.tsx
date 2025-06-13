import { useEffect } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  Container, 
  Box, 
  Typography, 
  Alert, 
  AppBar, 
  Toolbar 
} from '@mui/material';
import { FileUpload } from './components/FileUpload';
import { FileList } from './components/FileList';
import { AppLogo } from './components/AppLogo';
import { Provider } from 'react-redux';
import { store, RootState } from './app/store';
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

const AppContent = () => {
  const dispatch = useAppDispatch();
  const { files, loading, error, downloadingId, deletingId } = useAppSelector((state: RootState) => ({
    files: state.files.files,
    loading: state.files.loading,
    error: state.files.error,
    downloadingId: state.files.downloadingId,
    deletingId: state.files.deletingId
  }));

  useEffect(() => {
    dispatch(fetchFiles());
  }, [dispatch]);

  const handleUpload = async (file: File) => {
    try {
      await dispatch(uploadFile(file)).unwrap();
    } catch (err) {
      console.error('Upload failed:', err);
      throw err; // Re-throw to let FileUpload component handle the error
    }
  };

  const handleDelete = async (file: FileInfo) => {
    if (window.confirm(`Are you sure you want to delete ${file.originalFilename}?`)) {
      try {
        await dispatch(deleteFile(file.id)).unwrap();
      } catch (err) {
        console.error('Delete failed:', err);
      }
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
    <>
      <AppBar position="static" color="default" elevation={1} sx={{ mb: 4 }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <AppLogo size={36} withText />
            <Box sx={{ flexGrow: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Simple & Secure File Sharing
            </Typography>
          </Toolbar>
        </Container>
      </AppBar>
      
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="lg" sx={{ py: 2, px: { xs: 2, sm: 3 } }}>
          <Box sx={{ mb: 4 }}>
            <FileUpload
              onUpload={handleUpload}
              acceptTypes={['.jpg', '.jpeg', '.png', '.txt', '.json']}
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
    </>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
