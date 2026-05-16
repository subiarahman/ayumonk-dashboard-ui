import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "../services/api";
import { API_URLS } from "../services/apiUrls";

const initialState = {
  items: [],
  total: 0,
  skip: 0,
  limit: 50,
  selectedMapping: null,
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

const normalizeNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") return fallback;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const normalizeMapping = (item, index = 0) => ({
  id: String(item?.id || index),
  kpi_key: String(item?.kpi_key || ""),
  kpi_name: item?.kpi_name || "",
  trigger_mode: item?.trigger_mode || "",
  risk_level: item?.risk_level || "",
  question_key: String(item?.question_key || ""),
  question_code: item?.question_code || "",
  question_text: item?.question_text || "",
  score_threshold_below: normalizeNumber(item?.score_threshold_below),
  score_threshold_above: normalizeNumber(item?.score_threshold_above),
  kpi_score_below: normalizeNumber(item?.kpi_score_below),
  suggestion_id: String(item?.suggestion_id || ""),
  suggestion_title: item?.suggestion_title || "",
  priority: normalizeNumber(item?.priority, 1),
  is_active: item?.is_active ?? true,
  created_at: item?.created_at || "",
  updated_at: item?.updated_at || "",
});

const buildListParams = (params = {}) => {
  const query = {
    skip: params.skip ?? 0,
    limit: params.limit ?? 50,
  };

  if (params.kpi_key?.trim()) {
    query.kpi_key = params.kpi_key.trim();
  }

  if (params.suggestion_id?.trim()) {
    query.suggestion_id = params.suggestion_id.trim();
  }

  if (params.question_key?.trim()) {
    query.question_key = params.question_key.trim();
  }

  if (params.trigger_mode?.trim()) {
    query.trigger_mode = params.trigger_mode.trim();
  }

  if (typeof params.is_active === "boolean") {
    query.is_active = params.is_active;
  }

  return query;
};

export const fetchKpiSuggestionMappings = createAsyncThunk(
  "kpiSuggestionMapping/fetchKpiSuggestionMappings",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get(API_URLS.kpiSuggestionMappings, {
        params: buildListParams(params),
      });
      const payload = response?.data || {};

      if (!payload?.success) {
        return rejectWithValue(
          payload?.message || "Failed to fetch KPI suggestion mappings.",
        );
      }

      const data = payload?.data || {};
      return {
        items: Array.isArray(data?.items)
          ? data.items.map(normalizeMapping)
          : [],
        total: Number(data?.total || 0),
        skip: Number(data?.skip || params.skip || 0),
        limit: Number(data?.limit || params.limit || 50),
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to fetch KPI suggestion mappings due to server/network error.",
        ),
      );
    }
  },
);

export const fetchKpiSuggestionMappingById = createAsyncThunk(
  "kpiSuggestionMapping/fetchKpiSuggestionMappingById",
  async (mappingId, { rejectWithValue }) => {
    try {
      const response = await api.get(API_URLS.kpiSuggestionMappingById(mappingId));
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(
          payload?.message || "Failed to fetch KPI suggestion mapping.",
        );
      }

      return normalizeMapping(payload.data);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to fetch KPI suggestion mapping due to server/network error.",
        ),
      );
    }
  },
);

export const createKpiSuggestionMapping = createAsyncThunk(
  "kpiSuggestionMapping/createKpiSuggestionMapping",
  async (mapping, { rejectWithValue }) => {
    try {
      const response = await api.post(API_URLS.kpiSuggestionMappings, mapping);
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(
          payload?.message || "Failed to create KPI suggestion mapping.",
        );
      }

      return {
        item: normalizeMapping(payload.data),
        message:
          payload?.message || "KPI suggestion mapping created successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to create KPI suggestion mapping due to server/network error.",
        ),
      );
    }
  },
);

export const updateKpiSuggestionMapping = createAsyncThunk(
  "kpiSuggestionMapping/updateKpiSuggestionMapping",
  async ({ mappingId, mapping }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        API_URLS.kpiSuggestionMappingById(mappingId),
        mapping,
      );
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(
          payload?.message || "Failed to update KPI suggestion mapping.",
        );
      }

      return {
        item: normalizeMapping(payload.data),
        message:
          payload?.message || "KPI suggestion mapping updated successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to update KPI suggestion mapping due to server/network error.",
        ),
      );
    }
  },
);

export const deleteKpiSuggestionMapping = createAsyncThunk(
  "kpiSuggestionMapping/deleteKpiSuggestionMapping",
  async (mappingId, { rejectWithValue }) => {
    try {
      const response = await api.delete(API_URLS.kpiSuggestionMappingById(mappingId));
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(
          payload?.message || "Failed to delete KPI suggestion mapping.",
        );
      }

      return {
        item: normalizeMapping(payload.data),
        message:
          payload?.message || "KPI suggestion mapping deleted successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to delete KPI suggestion mapping due to server/network error.",
        ),
      );
    }
  },
);

const kpiSuggestionMappingSlice = createSlice({
  name: "kpiSuggestionMapping",
  initialState,
  reducers: {
    clearKpiSuggestionMappingListState(state) {
      state.listError = "";
      state.deleteError = "";
      state.deleteMessage = "";
      state.createError = "";
      state.createMessage = "";
      state.updateError = "";
      state.updateMessage = "";
    },
    clearKpiSuggestionMappingDetailState(state) {
      state.selectedMapping = null;
      state.detailLoading = false;
      state.detailError = "";
    },
    clearKpiSuggestionMappingCreateState(state) {
      state.createLoading = false;
      state.createError = "";
      state.createMessage = "";
    },
    clearKpiSuggestionMappingUpdateState(state) {
      state.updateLoading = false;
      state.updateError = "";
      state.updateMessage = "";
    },
    clearKpiSuggestionMappingDeleteState(state) {
      state.deleteLoading = false;
      state.deleteError = "";
      state.deleteMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchKpiSuggestionMappings.pending, (state) => {
        state.listLoading = true;
        state.listError = "";
      })
      .addCase(fetchKpiSuggestionMappings.fulfilled, (state, action) => {
        state.listLoading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.skip = action.payload.skip;
        state.limit = action.payload.limit;
      })
      .addCase(fetchKpiSuggestionMappings.rejected, (state, action) => {
        state.listLoading = false;
        state.listError =
          action.payload || "Failed to fetch KPI suggestion mappings.";
      })
      .addCase(fetchKpiSuggestionMappingById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = "";
      })
      .addCase(fetchKpiSuggestionMappingById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedMapping = action.payload;
      })
      .addCase(fetchKpiSuggestionMappingById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError =
          action.payload || "Failed to fetch KPI suggestion mapping.";
      })
      .addCase(createKpiSuggestionMapping.pending, (state) => {
        state.createLoading = true;
        state.createError = "";
        state.createMessage = "";
      })
      .addCase(createKpiSuggestionMapping.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createMessage = action.payload.message;
        state.items = [action.payload.item, ...state.items];
        state.total += 1;
      })
      .addCase(createKpiSuggestionMapping.rejected, (state, action) => {
        state.createLoading = false;
        state.createError =
          action.payload || "Failed to create KPI suggestion mapping.";
      })
      .addCase(updateKpiSuggestionMapping.pending, (state) => {
        state.updateLoading = true;
        state.updateError = "";
        state.updateMessage = "";
      })
      .addCase(updateKpiSuggestionMapping.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateMessage = action.payload.message;
        state.selectedMapping = action.payload.item;
        state.items = state.items.map((item) =>
          item.id === action.payload.item.id ? action.payload.item : item,
        );
      })
      .addCase(updateKpiSuggestionMapping.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError =
          action.payload || "Failed to update KPI suggestion mapping.";
      })
      .addCase(deleteKpiSuggestionMapping.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = "";
        state.deleteMessage = "";
      })
      .addCase(deleteKpiSuggestionMapping.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteMessage = action.payload.message;
        state.items = state.items.filter(
          (item) => item.id !== action.payload.item.id,
        );
        state.total = Math.max(0, state.total - 1);
        if (state.selectedMapping?.id === action.payload.item.id) {
          state.selectedMapping = null;
        }
      })
      .addCase(deleteKpiSuggestionMapping.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError =
          action.payload || "Failed to delete KPI suggestion mapping.";
      });
  },
});

export const {
  clearKpiSuggestionMappingListState,
  clearKpiSuggestionMappingDetailState,
  clearKpiSuggestionMappingCreateState,
  clearKpiSuggestionMappingUpdateState,
  clearKpiSuggestionMappingDeleteState,
} = kpiSuggestionMappingSlice.actions;

export default kpiSuggestionMappingSlice.reducer;
