import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Paper,
  TextField,
  Alert,
  Button,
} from '@mui/material';
import { Close as CloseIcon, Download as DownloadIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { FileInfo, fileService } from '../services/api';

interface FilePreviewModalProps {
  open: boolean;
  onClose: () => void;
  file: FileInfo | null;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  open,
  onClose,
  file,
}) => {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch file content when the modal is opened with a file
  useEffect(() => {
    if (!file) return;
    
    const fetchFileContent = async () => {
      // Skip fetching for binary files that will be displayed as images or in iframes
      if (file.contentType.startsWith('image/') || file.contentType.includes('pdf')) {
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch the file content as text for preview
        const response = await fetch(fileService.viewFile(file.id));
        if (!response.ok) throw new Error('Failed to load file content');
        const text = await response.text();
        setFileContent(text);
      } catch (err) {
        console.error('Error loading file content:', err);
        setError('Failed to load file content');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFileContent();
  }, [file]);

  if (!file) return null;

  /**
   * Renders the appropriate preview component based on file type
   * @returns JSX element for the file preview
   */
  const getPreviewContent = () => {
    if (!file) return null;

    // Extract file extension for type-based rendering
    const fileExt = file.originalFilename.split('.').pop()?.toLowerCase();
    
    // Handle image previews (JPEG, PNG)
    if (['jpg', 'jpeg', 'png'].includes(fileExt || '')) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <img
            src={fileService.viewFile(file.id)}
            alt={file.originalFilename}
            style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
          />
        </Box>
      );
    } 
    // Handle text and JSON files with syntax highlighting
    else if (['txt', 'json'].includes(fileExt || '')) {
      // Open file in new tab for better viewing experience
      const viewInNewTab = () => {
        window.open(fileService.viewFile(file.id), '_blank', 'noopener,noreferrer');
      };

      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '70vh', width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<OpenInNewIcon />}
              onClick={viewInNewTab}
              sx={{ textTransform: 'none' }}
            >
              Open in new tab
            </Button>
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            {isLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">
                {error}
              </Alert>
            ) : (
              <Paper 
                variant="outlined" 
                component="pre"
                sx={{ 
                  p: 2, 
                  height: '100%', 
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  bgcolor: 'background.default',
                  m: 0,
                  '&:hover': {
                    boxShadow: 1
                  }
                }}
              >
                {fileContent || 'No content to display'}
              </Paper>
            )}
          </Box>
        </Box>
      );
    } else {
      // Unsupported file type
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" gutterBottom>
            Preview not available for this file type.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You can download the file to view it.
          </Typography>
        </Box>
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="file-preview-dialog-title"
    >
      <DialogTitle id="file-preview-dialog-title">
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="div" noWrap>
            {file.originalFilename}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {getPreviewContent()}
      </DialogContent>
    </Dialog>
  );
};

export default FilePreviewModal;