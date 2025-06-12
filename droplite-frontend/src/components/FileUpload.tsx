import { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Button, Box, Typography, CircularProgress } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  isLoading: boolean;
  acceptedFileTypes?: string[];
  maxSize?: number; // in bytes
}

const defaultAcceptedTypes = [
  'image/*',
  'application/pdf',
  'text/plain',
  'application/json',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB

export const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  isLoading,
  acceptedFileTypes = defaultAcceptedTypes,
  maxSize = DEFAULT_MAX_SIZE,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      try {
        setError(null);
        await onUpload(file);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
        setError(errorMessage);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => ({
      ...acc,
      [type]: []
    }), {} as Record<string, string[]>),
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
        Supported formats: {acceptedFileTypes.join(', ').replace(/\/\*/g, '')}
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
