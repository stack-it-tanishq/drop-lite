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
} from '@mui/material';
import { Close as CloseIcon, Download as DownloadIcon } from '@mui/icons-material';
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

  useEffect(() => {
    if (!file) return;
    
    const fetchFileContent = async () => {
      if (file.contentType.startsWith('image/') || file.contentType.includes('pdf')) {
        return; // Don't fetch content for images and PDFs
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
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

  const getPreviewContent = () => {
    if (!file) return null;

    // Get file extension
    const fileExt = file.originalFilename.split('.').pop()?.toLowerCase();
    
    // Handle images (jpg, jpeg, png)
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
    // Handle text and json files
    else if (['txt', 'json'].includes(fileExt || '')) {
      return (
        <Box sx={{ height: '70vh', width: '100%', overflow: 'auto', p: 2 }}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">
              {error}
              <Box mt={1}>
                <a 
                  href={fileService.viewFile(file.id)} 
                  download={file.originalFilename}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  <Box display="flex" alignItems="center" mt={1}>
                    <DownloadIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <span>Download file instead</span>
                  </Box>
                </a>
              </Box>
            </Alert>
          ) : (
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                height: '100%', 
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                bgcolor: 'background.default'
              }}
            >
              {fileContent}
            </Paper>
          )}
        </Box>
      );
    } else {
      // For unsupported preview types, show a message and download link
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