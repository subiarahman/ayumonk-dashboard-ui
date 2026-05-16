import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "../services/api";
import { API_URLS } from "../services/apiUrls";

// Per-user overrides — spec §6 documents only the POST endpoints
// (no /add or /remove suffix, no GET). The body shape is modeled on the
// role-level pattern: `{ tenant_id, items: [...] }`. If the backend uses
// a different contract (e.g. `permission_ids` like role endpoints) the
// fix is local to `buildPermissionPayload` / `buildMenuPayload` below.

const initialState = {
  saving: {
    permissions: false,
    menus: false,
  },
  error: "",
  message: "",
};

const buildPermissionPayload = (items, tenantId) => ({
  tenant_id: tenantId || undefined,
  items: items.map((entry) => ({
    permission_id: Number(entry.permission_id),
    is_granted: Boolean(entry.is_granted),
  })),
});

const buildMenuPayload = (items, tenantId) => ({
  tenant_id: tenantId || undefined,
  items: items.map((entry) => ({
    menu_id: Number(entry.menu_id),
    access_level: entry.access_level || "view",
  })),
});

export const saveUserPermissionOverrides = createAsyncThunk(
  "userOverrides/saveUserPermissionOverrides",
  async ({ userId, items, tenantId }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        API_URLS.userOverridePermissions(userId),
        buildPermissionPayload(items, tenantId),
      );
      return {
        data: response?.data || null,
        message: "Per-user permission overrides saved.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to save per-user permission overrides."),
      );
    }
  },
);

export const saveUserMenuOverrides = createAsyncThunk(
  "userOverrides/saveUserMenuOverrides",
  async ({ userId, items, tenantId }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        API_URLS.userOverrideMenus(userId),
        buildMenuPayload(items, tenantId),
      );
      return {
        data: response?.data || null,
        message: "Per-user menu overrides saved.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to save per-user menu overrides."),
      );
    }
  },
);

const userOverridesSlice = createSlice({
  name: "userOverrides",
  initialState,
  reducers: {
    clearUserOverridesFeedback(state) {
      state.error = "";
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveUserPermissionOverrides.pending, (state) => {
        state.saving.permissions = true;
        state.error = "";
        state.message = "";
      })
      .addCase(saveUserPermissionOverrides.fulfilled, (state, action) => {
        state.saving.permissions = false;
        state.message = action.payload.message;
      })
      .addCase(saveUserPermissionOverrides.rejected, (state, action) => {
        state.saving.permissions = false;
        state.error = action.payload || "Failed to save permission overrides.";
      })
      .addCase(saveUserMenuOverrides.pending, (state) => {
        state.saving.menus = true;
        state.error = "";
        state.message = "";
      })
      .addCase(saveUserMenuOverrides.fulfilled, (state, action) => {
        state.saving.menus = false;
        state.message = action.payload.message;
      })
      .addCase(saveUserMenuOverrides.rejected, (state, action) => {
        state.saving.menus = false;
        state.error = action.payload || "Failed to save menu overrides.";
      });
  },
});

export const { clearUserOverridesFeedback } = userOverridesSlice.actions;
export default userOverridesSlice.reducer;
