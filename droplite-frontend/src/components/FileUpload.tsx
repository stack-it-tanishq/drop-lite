import { useCallback, useState } from 'react';
import { useDropzone, FileRejection, Accept } from 'react-dropzone';
import { Button, Box, Typography, CircularProgress, Chip } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  acceptTypes?: string[];
  maxSize?: number;
  isLoading?: boolean;
  error?: string | null;
}

interface FileWithPreview extends File {
  preview?: string;
}

// Default accepted file extensions
const defaultAcceptedTypes = [
  '.jpg',
  '.jpeg',
  '.png',
  '.txt',
  '.json'
];

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB

export const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  isLoading = false,
  acceptTypes = defaultAcceptedTypes,
  maxSize = DEFAULT_MAX_SIZE,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle file drop or selection
const onDrop = useCallback(
  async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
    // Process any file rejection errors first
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      // Handle invalid file type error
      if (rejection.errors.some(e => e.code === 'file-invalid-type')) {
        setError('File type not allowed');
        return;
      }
      // Handle file size limit error
      if (rejection.errors.some(e => e.code === 'file-too-large')) {
        setError(`File is too large. Max size is ${maxSize / (1024 * 1024)}MB`);
        return;
      }
    }

    // Process the first accepted file (multiple uploads not supported)
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setError(null);
      // Call the parent component's upload handler
      await onUpload(file);
    } catch (err: unknown) {
      // Handle any upload errors with a user-friendly message
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
      setError(errorMessage);
    }
  },
  [onUpload, maxSize] // Dependencies for useCallback
);

  const fileTypes = acceptTypes || defaultAcceptedTypes;
  
  // Convert file type array into the format expected by react-dropzone
  // Example: ['.jpg', '.png'] -> { '.jpg': [], '.png': [] }
  const acceptedFileTypes = fileTypes.reduce<Record<string, string[]>>((acc, type) => {
    // Handle both formats: '.ext' and 'image/*'
    if (type.startsWith('.')) {
      // Extract extension without the dot and create the expected format
      const ext = type.substring(1);
      return { ...acc, [`.${ext}`]: [] };
    }
    // Keep MIME types as they are
    return { ...acc, [type]: [] };
  }, {});

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes as Accept,
    maxSize,
    multiple: false,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    onDropAccepted: () => setDragActive(false),
    onDropRejected: (fileRejections) => {
      setDragActive(false);
      const rejection = fileRejections[0];
      if (rejection.errors.some((e: { code: string }) => e.code === 'file-too-large')) {
        setError(`File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
      } else if (rejection.errors.some((e: { code: string }) => e.code === 'file-invalid-type')) {
        setError('File type not supported');
      } else {
        setError('Error uploading file');
      }
    },
  });

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: '2px dashed',
        borderColor: dragActive ? 'primary.main' : 'divider',
        borderRadius: 2,
        p: 4,
        textAlign: 'center',
        transition: 'border-color 0.3s ease-in-out',
        backgroundColor: dragActive ? 'action.hover' : 'background.paper',
        cursor: 'pointer',
        '&:hover': {
          borderColor: 'primary.main',
          backgroundColor: 'action.hover',
        },
      }}
    >
      <input {...getInputProps()} />
      <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        {isDragActive ? 'Drop the file here' : 'Drag and drop a file here, or click to select'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        <Box component="span" fontWeight="bold">Supported formats:</Box>
        <Box component="span" sx={{ ml: 1, display: 'inline-flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          {acceptTypes.map(ext => (
            <Chip 
              key={ext} 
              label={ext} 
              size="small" 
              variant="outlined"
              sx={{ 
                fontWeight: 500,
                bgcolor: 'background.paper',
                borderColor: 'divider'
              }}
            />
          ))}
        </Box>
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Max size: {maxSize / (1024 * 1024)}MB
      </Typography>
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          component="span"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading ? 'Uploading...' : 'Select File'}
        </Button>
      </Box>
    </Box>
  );
};

export default FileUpload;
