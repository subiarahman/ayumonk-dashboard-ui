import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "../services/api";
import { API_URLS } from "../services/apiUrls";

const initialState = {
  loading: false,
  status: null,
  error: "",
  responseData: null,
};

export const uploadUserFile = createAsyncThunk(
  "userUpload/uploadUserFile",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post(API_URLS.userUpload, formData);

      const payload = response?.data || {};
      if (!payload?.success) {
        return rejectWithValue(payload?.message || "Upload failed.");
      }

      return payload?.data || null;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Upload failed due to server/network error."),
      );
    }
  },
);

const userUploadSlice = createSlice({
  name: "userUpload",
  initialState,
  reducers: {
    resetUserUpload(state) {
      state.loading = false;
      state.status = null;
      state.error = "";
      state.responseData = null;
    },
    clearUserUploadError(state) {
      state.error = "";
      if (state.status === "error") {
        state.status = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadUserFile.pending, (state) => {
        state.loading = true;
        state.status = null;
        state.error = "";
        state.responseData = null;
      })
      .addCase(uploadUserFile.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "success";
        state.responseData = action.payload;
      })
      .addCase(uploadUserFile.rejected, (state, action) => {
        state.loading = false;
        state.status = "error";
        state.error = action.payload || "Upload failed.";
      });
  },
});

export const { resetUserUpload, clearUserUploadError } = userUploadSlice.actions;
export default userUploadSlice.reducer;
