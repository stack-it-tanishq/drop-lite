import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
  Typography,
  Box,
  TablePagination,
  Chip,
  Avatar,
  useTheme,
} from '@mui/material';
import { FilePreviewModal } from './FilePreviewModal';
import {
  GetApp as DownloadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  Description as DocIcon,
  TableChart as TableIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { FileInfo, fileService } from '../services/api';

interface FileListProps {
  files: FileInfo[];
  onDownload: (file: FileInfo) => Promise<void>;
  onDelete: (file: FileInfo) => Promise<void>;
  isLoading: boolean;
  downloadingId: number | null;
  deletingId: number | null;
}

const getFileIcon = (contentType: string) => {
  if (contentType.includes('pdf')) return <PdfIcon color="error" />;
  if (contentType.startsWith('image/')) return <ImageIcon color="primary" />;
  if (contentType.includes('spreadsheet') || contentType.includes('excel')) {
    return <TableIcon color="success" />;
  }
  if (contentType.includes('text')) return <DocIcon color="info" />;
  if (contentType.includes('json')) return <CodeIcon color="warning" />;
  return <FileIcon />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const FileList: React.FC<FileListProps> = ({
  files,
  onDownload,
  onDelete,
  isLoading,
  downloadingId,
  deletingId,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  // Deleting state is now managed by Redux
  const theme = useTheme();

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = async (file: FileInfo) => {
    try {
      await onDelete(file);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleViewFile = (file: FileInfo) => {
    setSelectedFile(file);
    setPreviewOpen(true);
  };
  
  const handleClosePreview = () => {
    setPreviewOpen(false);
  };

  if (isLoading && files.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (files.length === 0) {
    return (
      <Box textAlign="center" p={4}>
        <Typography variant="body1" color="textSecondary">
          No files uploaded yet. Upload a file to get started.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Paper elevation={2} sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>File</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Uploaded</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {files
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((file) => (
                <TableRow key={file.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: 'transparent', mr: 1 }}>
                        {getFileIcon(file.contentType)}
                      </Avatar>
                      <Typography variant="body2" noWrap>
                        {file.originalFilename}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={file.contentType}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{formatFileSize(file.size)}</TableCell>
                  <TableCell>
                    {new Date(file.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title="View">
                      <IconButton
                        onClick={() => handleViewFile(file)}
                        size="small"
                        color="primary"
                        sx={{ mr: 1 }}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download">
                      <IconButton
                        onClick={() => onDownload(file)}
                        size="small"
                        color="primary"
                        disabled={downloadingId === file.id}
                      >
                        {downloadingId === file.id ? (
                          <CircularProgress size={20} />
                        ) : (
                          <DownloadIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        onClick={() => handleDeleteClick(file)}
                        size="small"
                        color="error"
                        disabled={deletingId === file.id}
                      >
                        {deletingId === file.id ? (
                          <CircularProgress size={20} />
                        ) : (
                          <DeleteIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={files.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
    <FilePreviewModal
      open={previewOpen}
      onClose={handleClosePreview}
      file={selectedFile}
    />
    </>
  );
};

export default FileList;
