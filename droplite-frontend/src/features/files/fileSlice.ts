import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fileService, FileInfo } from '../../services/api';

interface FileState {
  files: FileInfo[];
  loading: boolean;
  error: string | null;
  currentRequestId: string | undefined;
  uploadProgress: number;
  downloadingId: number | null;
  deletingId: number | null;
}

const initialState: FileState = {
  files: [],
  loading: false,
  error: null,
  currentRequestId: undefined,
  uploadProgress: 0,
  downloadingId: null,
  deletingId: null,
};

// Async thunks
export const fetchFiles = createAsyncThunk(
  'files/fetchFiles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fileService.getFiles();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch files');
    }
  }
);

export const uploadFile = createAsyncThunk(
  'files/uploadFile',
  async (file: File, { rejectWithValue }) => {
    try {
      const response = await fileService.uploadFile(file);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload file');
    }
  }
);

export const deleteFile = createAsyncThunk(
  'files/deleteFile',
  async (fileId: number, { rejectWithValue }) => {
    try {
      await fileService.deleteFile(fileId);
      return fileId;
    } catch (error: any) {
      return rejectWithValue({
        error: error.response?.data?.message || 'Failed to delete file',
        fileId
      });
    }
  }
);

const fileSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch files
    builder.addCase(fetchFiles.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchFiles.fulfilled, (state, action) => {
      state.loading = false;
      state.files = action.payload;
    });
    builder.addCase(fetchFiles.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Upload file
    builder.addCase(uploadFile.pending, (state, action) => {
      state.loading = true;
      state.error = null;
      state.uploadProgress = 0;
    });
    builder.addCase(uploadFile.fulfilled, (state, action) => {
      state.loading = false;
      state.files = [action.payload, ...state.files];
      state.uploadProgress = 100;
    });
    builder.addCase(uploadFile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.uploadProgress = 0;
    });

    // Delete file
    builder.addCase(deleteFile.pending, (state, action) => {
      state.deletingId = action.meta.arg;
      state.error = null;
    });
    builder.addCase(deleteFile.fulfilled, (state, action) => {
      state.files = state.files.filter(file => file.id !== action.payload);
      state.deletingId = null;
    });
    builder.addCase(deleteFile.rejected, (state, action: any) => {
      state.error = action.payload?.error || 'Failed to delete file';
      state.deletingId = null;
    });
  },
});

export const { setUploadProgress, clearError } = fileSlice.actions;
export default fileSlice.reducer;
