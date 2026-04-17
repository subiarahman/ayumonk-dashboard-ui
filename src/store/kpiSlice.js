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
  selectedKpi: null,
  listError: "",
  createError: "",
  detailError: "",
  updateError: "",
  deleteError: "",
  createMessage: "",
  updateMessage: "",
  deleteMessage: "",
};

const normalizeKpi = (item, index = 0) => ({
  id: String(item?.kpi_key || index),
  kpi_key: String(item?.kpi_key || index),
  display_name: item?.display_name || "Untitled KPI",
  theme_key: item?.theme_key || "",
  domain_category: item?.domain_category || "",
  wi_weight:
    item?.wi_weight === null || item?.wi_weight === undefined
      ? null
      : Number(item.wi_weight),
  start_date: item?.start_date || "",
  end_date: item?.end_date || "",
  is_active: Boolean(item?.is_active),
  created_at: item?.created_at || "",
  updated_at: item?.updated_at || "",
});

export const fetchKpis = createAsyncThunk(
  "kpi/fetchKpis",
  async ({ skip = 0, limit = 50, search = "", isActive } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get(API_URLS.kpis, {
        params: {
          skip,
          limit,
          ...(search ? { search } : {}),
          ...(typeof isActive === "boolean" ? { is_active: isActive } : {}),
        },
      });

      const payload = response?.data || {};
      if (!payload?.success) {
        return rejectWithValue(payload?.message || "Failed to fetch KPIs.");
      }

      const data = payload?.data || {};
      const items = Array.isArray(data?.items) ? data.items : [];

      return {
        items: items.map(normalizeKpi),
        total: Number(data?.total) || items.length,
        skip: Number(data?.skip) || skip,
        limit: Number(data?.limit) || limit,
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch KPIs due to server/network error."),
      );
    }
  },
);

export const createKpi = createAsyncThunk(
  "kpi/createKpi",
  async (
    { displayName, themeKey, domainCategory = "", wiWeight = null, startDate, endDate },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post(API_URLS.kpis, {
        display_name: displayName,
        theme_key: themeKey,
        domain_category: domainCategory,
        wi_weight: wiWeight,
        start_date: startDate,
        end_date: endDate,
      });

      const payload = response?.data || {};
      if (!payload?.success || !payload?.data?.kpi_key) {
        return rejectWithValue(payload?.message || "KPI creation failed.");
      }

      return {
        item: normalizeKpi(payload.data),
        message: payload?.message || "KPI created successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "KPI creation failed due to server/network error."),
      );
    }
  },
);

export const fetchKpiById = createAsyncThunk(
  "kpi/fetchKpiById",
  async (kpiKey, { rejectWithValue }) => {
    try {
      const response = await api.get(API_URLS.kpiById(kpiKey));
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(payload?.message || "Failed to fetch KPI.");
      }

      return normalizeKpi(payload.data);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch KPI due to server/network error."),
      );
    }
  },
);

export const updateKpi = createAsyncThunk(
  "kpi/updateKpi",
  async (
    {
      kpiKey,
      displayName,
      themeKey,
      domainCategory = "",
      wiWeight = null,
      startDate,
      endDate,
      isActive,
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.put(API_URLS.kpiById(kpiKey), {
        display_name: displayName,
        theme_key: themeKey,
        domain_category: domainCategory,
        wi_weight: wiWeight,
        start_date: startDate,
        end_date: endDate,
        is_active: isActive,
      });

      const payload = response?.data || {};
      if (!payload?.success || !payload?.data) {
        return rejectWithValue(payload?.message || "Failed to update KPI.");
      }

      return {
        item: normalizeKpi(payload.data),
        message: payload?.message || "KPI updated successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to update KPI due to server/network error."),
      );
    }
  },
);

export const deleteKpi = createAsyncThunk(
  "kpi/deleteKpi",
  async (kpiKey, { rejectWithValue }) => {
    try {
      const response = await api.delete(API_URLS.kpiById(kpiKey));
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(payload?.message || "Failed to delete KPI.");
      }

      return {
        item: normalizeKpi(payload.data),
        message: payload?.message || "KPI deleted successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to delete KPI due to server/network error."),
      );
    }
  },
);

const replaceKpi = (items, kpi) =>
  items.map((item) => (item.kpi_key === kpi.kpi_key ? kpi : item));

const kpiSlice = createSlice({
  name: "kpi",
  initialState,
  reducers: {
    clearKpiListError(state) {
      state.listError = "";
    },
    clearKpiCreateState(state) {
      state.createError = "";
      state.createMessage = "";
      state.createLoading = false;
    },
    clearKpiDetailState(state) {
      state.detailError = "";
      state.selectedKpi = null;
      state.detailLoading = false;
    },
    clearKpiUpdateState(state) {
      state.updateError = "";
      state.updateMessage = "";
      state.updateLoading = false;
    },
    clearKpiDeleteState(state) {
      state.deleteError = "";
      state.deleteMessage = "";
      state.deleteLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchKpis.pending, (state) => {
        state.listLoading = true;
        state.listError = "";
      })
      .addCase(fetchKpis.fulfilled, (state, action) => {
        state.listLoading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.skip = action.payload.skip;
        state.limit = action.payload.limit;
      })
      .addCase(fetchKpis.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload || "Failed to fetch KPIs.";
      })
      .addCase(createKpi.pending, (state) => {
        state.createLoading = true;
        state.createError = "";
        state.createMessage = "";
      })
      .addCase(createKpi.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createMessage = action.payload.message;
      })
      .addCase(createKpi.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload || "KPI creation failed.";
      })
      .addCase(fetchKpiById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = "";
        state.selectedKpi = null;
      })
      .addCase(fetchKpiById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedKpi = action.payload;
      })
      .addCase(fetchKpiById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload || "Failed to fetch KPI.";
      })
      .addCase(updateKpi.pending, (state) => {
        state.updateLoading = true;
        state.updateError = "";
        state.updateMessage = "";
      })
      .addCase(updateKpi.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateMessage = action.payload.message;
        state.selectedKpi = action.payload.item;
        state.items = replaceKpi(state.items, action.payload.item);
      })
      .addCase(updateKpi.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload || "Failed to update KPI.";
      })
      .addCase(deleteKpi.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = "";
        state.deleteMessage = "";
      })
      .addCase(deleteKpi.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteMessage = action.payload.message;
        state.items = replaceKpi(state.items, action.payload.item);
        if (state.selectedKpi?.kpi_key === action.payload.item.kpi_key) {
          state.selectedKpi = action.payload.item;
        }
      })
      .addCase(deleteKpi.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload || "Failed to delete KPI.";
      });
  },
});

export const {
  clearKpiListError,
  clearKpiCreateState,
  clearKpiDetailState,
  clearKpiUpdateState,
  clearKpiDeleteState,
} = kpiSlice.actions;

export default kpiSlice.reducer;
