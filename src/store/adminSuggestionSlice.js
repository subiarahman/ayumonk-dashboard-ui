import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "../services/api";
import { API_URLS } from "../services/apiUrls";

const initialState = {
  items: [],
  total: 0,
  skip: 0,
  limit: 50,
  selectedSuggestion: null,
  listLoading: false,
  detailLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  listError: "",
  detailError: "",
  createError: "",
  updateError: "",
  deleteError: "",
  createMessage: "",
  updateMessage: "",
  deleteMessage: "",
};

const normalizeSuggestion = (item, index = 0) => ({
  id: String(item?.id || item?.suggestion_id || index),
  suggestion_type: item?.suggestion_type || "",
  title: item?.title || "",
  description: item?.description || "",
  url: item?.url || "",
  dosha_type: item?.dosha_type || "all",
  difficulty: item?.difficulty || "easy",
  duration_mins:
    item?.duration_mins === null || item?.duration_mins === undefined
      ? ""
      : Number(item.duration_mins),
  is_active: item?.is_active ?? true,
  created_at: item?.created_at || "",
  updated_at: item?.updated_at || "",
});

const buildListParams = (params = {}) => {
  const query = {
    skip: params.skip ?? 0,
    limit: params.limit ?? 50,
  };

  if (params.search?.trim()) {
    query.search = params.search.trim();
  }

  if (params.suggestion_type) {
    query.suggestion_type = params.suggestion_type;
  }

  if (typeof params.is_active === "boolean") {
    query.is_active = params.is_active;
  }

  return query;
};

export const fetchAdminSuggestions = createAsyncThunk(
  "adminSuggestion/fetchAdminSuggestions",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get(API_URLS.adminSuggestions, {
        params: buildListParams(params),
      });
      const payload = response?.data || {};

      if (!payload?.success) {
        return rejectWithValue(
          payload?.message || "Failed to fetch admin suggestions.",
        );
      }

      const data = payload?.data || {};

      return {
        items: Array.isArray(data?.items)
          ? data.items.map(normalizeSuggestion)
          : [],
        total: Number(data?.total || 0),
        skip: Number(data?.skip || params.skip || 0),
        limit: Number(data?.limit || params.limit || 50),
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to fetch admin suggestions due to server/network error.",
        ),
      );
    }
  },
);

export const fetchAdminSuggestionById = createAsyncThunk(
  "adminSuggestion/fetchAdminSuggestionById",
  async (suggestionId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        API_URLS.adminSuggestionById(suggestionId),
      );
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(
          payload?.message || "Failed to fetch admin suggestion.",
        );
      }

      return normalizeSuggestion(payload.data);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to fetch admin suggestion due to server/network error.",
        ),
      );
    }
  },
);

export const createAdminSuggestion = createAsyncThunk(
  "adminSuggestion/createAdminSuggestion",
  async (suggestion, { rejectWithValue }) => {
    try {
      const response = await api.post(API_URLS.adminSuggestions, suggestion);
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(
          payload?.message || "Failed to create admin suggestion.",
        );
      }

      return {
        item: normalizeSuggestion(payload.data),
        message: payload?.message || "Admin suggestion created successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to create admin suggestion due to server/network error.",
        ),
      );
    }
  },
);

export const updateAdminSuggestion = createAsyncThunk(
  "adminSuggestion/updateAdminSuggestion",
  async ({ suggestionId, suggestion }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        API_URLS.adminSuggestionById(suggestionId),
        suggestion,
      );
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(
          payload?.message || "Failed to update admin suggestion.",
        );
      }

      return {
        item: normalizeSuggestion(payload.data),
        message: payload?.message || "Admin suggestion updated successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to update admin suggestion due to server/network error.",
        ),
      );
    }
  },
);

export const deleteAdminSuggestion = createAsyncThunk(
  "adminSuggestion/deleteAdminSuggestion",
  async (suggestionId, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        API_URLS.adminSuggestionById(suggestionId),
      );
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(
          payload?.message || "Failed to delete admin suggestion.",
        );
      }

      return {
        item: normalizeSuggestion(payload.data),
        message: payload?.message || "Admin suggestion deleted successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to delete admin suggestion due to server/network error.",
        ),
      );
    }
  },
);

const adminSuggestionSlice = createSlice({
  name: "adminSuggestion",
  initialState,
  reducers: {
    clearAdminSuggestionListState(state) {
      state.listError = "";
      state.deleteError = "";
      state.deleteMessage = "";
      state.createError = "";
      state.createMessage = "";
      state.updateError = "";
      state.updateMessage = "";
    },
    clearAdminSuggestionDetailState(state) {
      state.selectedSuggestion = null;
      state.detailLoading = false;
      state.detailError = "";
    },
    clearAdminSuggestionCreateState(state) {
      state.createLoading = false;
      state.createError = "";
      state.createMessage = "";
    },
    clearAdminSuggestionUpdateState(state) {
      state.updateLoading = false;
      state.updateError = "";
      state.updateMessage = "";
    },
    clearAdminSuggestionDeleteState(state) {
      state.deleteLoading = false;
      state.deleteError = "";
      state.deleteMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminSuggestions.pending, (state) => {
        state.listLoading = true;
        state.listError = "";
      })
      .addCase(fetchAdminSuggestions.fulfilled, (state, action) => {
        state.listLoading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.skip = action.payload.skip;
        state.limit = action.payload.limit;
      })
      .addCase(fetchAdminSuggestions.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload || "Failed to fetch admin suggestions.";
      })
      .addCase(fetchAdminSuggestionById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = "";
      })
      .addCase(fetchAdminSuggestionById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedSuggestion = action.payload;
      })
      .addCase(fetchAdminSuggestionById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError =
          action.payload || "Failed to fetch admin suggestion.";
      })
      .addCase(createAdminSuggestion.pending, (state) => {
        state.createLoading = true;
        state.createError = "";
        state.createMessage = "";
      })
      .addCase(createAdminSuggestion.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createMessage = action.payload.message;
        state.items = [action.payload.item, ...state.items];
        state.total += 1;
      })
      .addCase(createAdminSuggestion.rejected, (state, action) => {
        state.createLoading = false;
        state.createError =
          action.payload || "Failed to create admin suggestion.";
      })
      .addCase(updateAdminSuggestion.pending, (state) => {
        state.updateLoading = true;
        state.updateError = "";
        state.updateMessage = "";
      })
      .addCase(updateAdminSuggestion.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateMessage = action.payload.message;
        state.selectedSuggestion = action.payload.item;
        state.items = state.items.map((item) =>
          item.id === action.payload.item.id ? action.payload.item : item,
        );
      })
      .addCase(updateAdminSuggestion.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError =
          action.payload || "Failed to update admin suggestion.";
      })
      .addCase(deleteAdminSuggestion.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = "";
        state.deleteMessage = "";
      })
      .addCase(deleteAdminSuggestion.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteMessage = action.payload.message;
        state.items = state.items.filter(
          (item) => item.id !== action.payload.item.id,
        );
        state.total = Math.max(0, state.total - 1);
        if (state.selectedSuggestion?.id === action.payload.item.id) {
          state.selectedSuggestion = null;
        }
      })
      .addCase(deleteAdminSuggestion.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError =
          action.payload || "Failed to delete admin suggestion.";
      });
  },
});

export const {
  clearAdminSuggestionListState,
  clearAdminSuggestionDetailState,
  clearAdminSuggestionCreateState,
  clearAdminSuggestionUpdateState,
  clearAdminSuggestionDeleteState,
} = adminSuggestionSlice.actions;

export default adminSuggestionSlice.reducer;
