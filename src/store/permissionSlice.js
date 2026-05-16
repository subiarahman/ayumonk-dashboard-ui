import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import authService from "../services/authService";
import { getApiErrorMessage } from "../services/api";

const initialSnapshot = authService.snapshot();

const initialState = {
  permissions: initialSnapshot.permissions || [],
  menus: initialSnapshot.menus || [],
  policy: initialSnapshot.policy || null,
  loaded: Boolean(
    initialSnapshot.permissions?.length ||
      initialSnapshot.menus?.length ||
      initialSnapshot.policy,
  ),
  loading: false,
  error: null,
};

export const loadAuthorization = createAsyncThunk(
  "permission/loadAuthorization",
  async ({ force = false } = {}, { rejectWithValue }) => {
    try {
      return await authService.loadAuthorization({ force });
    } catch (requestError) {
      return rejectWithValue(
        getApiErrorMessage(requestError, "Unable to load authorization."),
      );
    }
  },
);

const permissionSlice = createSlice({
  name: "permission",
  initialState,
  reducers: {
    clearAuthorization(state) {
      authService.clear();
      state.permissions = [];
      state.menus = [];
      state.policy = null;
      state.loaded = false;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAuthorization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadAuthorization.fulfilled, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.permissions = action.payload.permissions || [];
        state.menus = action.payload.menus || [];
        state.policy = action.payload.policy || null;
      })
      .addCase(loadAuthorization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load authorization.";
      });
  },
});

export const { clearAuthorization } = permissionSlice.actions;
export default permissionSlice.reducer;
