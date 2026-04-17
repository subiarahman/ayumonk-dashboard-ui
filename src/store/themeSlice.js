import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "../services/api";
import { API_URLS } from "../services/apiUrls";

const initialState = {
  items: [],
  total: 0,
  skip: 0,
  limit: 50,
  listLoading: false,
  createLoading: false,
  detailLoading: false,
  updateLoading: false,
  deleteLoading: false,
  selectedTheme: null,
  listError: "",
  createError: "",
  detailError: "",
  updateError: "",
  deleteError: "",
  createMessage: "",
  updateMessage: "",
  deleteMessage: "",
};

const normalizeTheme = (item, index = 0) => ({
  id: String(item?.theme_key || index),
  theme_key: String(item?.theme_key || index),
  theme_display_name: item?.theme_display_name || "Untitled Theme",
  description: item?.description || "",
  duration_days:
    item?.duration_days === null || item?.duration_days === undefined
      ? null
      : Number(item.duration_days),
  target_audience: item?.target_audience || "",
  is_active: Boolean(item?.is_active),
  created_at: item?.created_at || "",
  updated_at: item?.updated_at || "",
});

export const fetchThemes = createAsyncThunk(
  "theme/fetchThemes",
  async (
    { skip = 0, limit = 50, search = "", isActive } = {},
    { rejectWithValue },
  ) => {
    try {
      const response = await api.get(API_URLS.themes, {
        params: {
          skip,
          limit,
          ...(search ? { search } : {}),
          ...(typeof isActive === "boolean" ? { is_active: isActive } : {}),
        },
      });

      const payload = response?.data || {};
      if (!payload?.success) {
        return rejectWithValue(payload?.message || "Failed to fetch themes.");
      }

      const data = payload?.data || {};
      const items = Array.isArray(data?.items) ? data.items : [];

      return {
        items: items.map(normalizeTheme),
        total: Number(data?.total) || items.length,
        skip: Number(data?.skip) || skip,
        limit: Number(data?.limit) || limit,
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch themes due to server/network error."),
      );
    }
  },
);

export const createTheme = createAsyncThunk(
  "theme/createTheme",
  async (
    { themeDisplayName, description = "", durationDays = null, targetAudience = "" },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post(API_URLS.themes, {
        theme_display_name: themeDisplayName,
        description,
        duration_days: durationDays,
        target_audience: targetAudience,
      });

      const payload = response?.data || {};
      if (!payload?.success || !payload?.data?.theme_key) {
        return rejectWithValue(payload?.message || "Theme creation failed.");
      }

      return {
        item: normalizeTheme(payload.data),
        message: payload?.message || "Theme created successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Theme creation failed due to server/network error."),
      );
    }
  },
);

export const fetchThemeById = createAsyncThunk(
  "theme/fetchThemeById",
  async (themeKey, { rejectWithValue }) => {
    try {
      const response = await api.get(API_URLS.themeById(themeKey));
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(payload?.message || "Failed to fetch theme.");
      }

      return normalizeTheme(payload.data);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch theme due to server/network error."),
      );
    }
  },
);

export const updateTheme = createAsyncThunk(
  "theme/updateTheme",
  async (
    {
      themeKey,
      themeDisplayName,
      description = "",
      durationDays = null,
      targetAudience = "",
      isActive,
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.put(API_URLS.themeById(themeKey), {
        theme_display_name: themeDisplayName,
        description,
        duration_days: durationDays,
        target_audience: targetAudience,
        is_active: isActive,
      });

      const payload = response?.data || {};
      if (!payload?.success || !payload?.data) {
        return rejectWithValue(payload?.message || "Failed to update theme.");
      }

      return {
        item: normalizeTheme(payload.data),
        message: payload?.message || "Theme updated successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to update theme due to server/network error."),
      );
    }
  },
);

export const deleteTheme = createAsyncThunk(
  "theme/deleteTheme",
  async (themeKey, { rejectWithValue }) => {
    try {
      const response = await api.delete(API_URLS.themeById(themeKey));
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(payload?.message || "Failed to delete theme.");
      }

      return {
        item: normalizeTheme(payload.data),
        message: payload?.message || "Theme deleted successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to delete theme due to server/network error."),
      );
    }
  },
);

const replaceTheme = (items, theme) =>
  items.map((item) => (item.theme_key === theme.theme_key ? theme : item));

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    clearThemeListError(state) {
      state.listError = "";
    },
    clearThemeCreateState(state) {
      state.createError = "";
      state.createMessage = "";
      state.createLoading = false;
    },
    clearThemeDetailState(state) {
      state.detailError = "";
      state.selectedTheme = null;
      state.detailLoading = false;
    },
    clearThemeUpdateState(state) {
      state.updateError = "";
      state.updateMessage = "";
      state.updateLoading = false;
    },
    clearThemeDeleteState(state) {
      state.deleteError = "";
      state.deleteMessage = "";
      state.deleteLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchThemes.pending, (state) => {
        state.listLoading = true;
        state.listError = "";
      })
      .addCase(fetchThemes.fulfilled, (state, action) => {
        state.listLoading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.skip = action.payload.skip;
        state.limit = action.payload.limit;
      })
      .addCase(fetchThemes.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload || "Failed to fetch themes.";
      })
      .addCase(createTheme.pending, (state) => {
        state.createLoading = true;
        state.createError = "";
        state.createMessage = "";
      })
      .addCase(createTheme.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createMessage = action.payload.message;
      })
      .addCase(createTheme.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload || "Theme creation failed.";
      })
      .addCase(fetchThemeById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = "";
        state.selectedTheme = null;
      })
      .addCase(fetchThemeById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedTheme = action.payload;
      })
      .addCase(fetchThemeById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload || "Failed to fetch theme.";
      })
      .addCase(updateTheme.pending, (state) => {
        state.updateLoading = true;
        state.updateError = "";
        state.updateMessage = "";
      })
      .addCase(updateTheme.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateMessage = action.payload.message;
        state.selectedTheme = action.payload.item;
        state.items = replaceTheme(state.items, action.payload.item);
      })
      .addCase(updateTheme.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload || "Failed to update theme.";
      })
      .addCase(deleteTheme.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = "";
        state.deleteMessage = "";
      })
      .addCase(deleteTheme.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteMessage = action.payload.message;
        state.items = replaceTheme(state.items, action.payload.item);
        if (state.selectedTheme?.theme_key === action.payload.item.theme_key) {
          state.selectedTheme = action.payload.item;
        }
      })
      .addCase(deleteTheme.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload || "Failed to delete theme.";
      });
  },
});

export const {
  clearThemeListError,
  clearThemeCreateState,
  clearThemeDetailState,
  clearThemeUpdateState,
  clearThemeDeleteState,
} = themeSlice.actions;

export default themeSlice.reducer;
