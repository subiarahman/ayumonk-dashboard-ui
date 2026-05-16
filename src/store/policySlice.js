import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "../services/api";
import { API_URLS } from "../services/apiUrls";

const initialState = {
  items: [],
  selectedPolicy: null,
  selectedTenantId: "",
  selectedModule: "",
  listLoading: false,
  createLoading: false,
  listError: "",
  createError: "",
  createMessage: "",
};

const pickList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

const pickItem = (payload) => {
  if (!payload) return null;
  if (payload?.data && typeof payload.data === "object") return payload.data;
  return payload;
};

const normalizeObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : {};

const normalizePolicy = (item, index = 0) => ({
  id: String(item?.id ?? index),
  name: item?.name || "",
  module: item?.module || "",
  scope: item?.scope || "",
  description: item?.description || "",
  conditions: normalizeObject(item?.conditions),
  condition_json: normalizeObject(item?.condition_json),
  effect: item?.effect || "",
  tenant_id: item?.tenant_id || "",
  is_active: item?.is_active ?? true,
});

export const fetchPolicies = createAsyncThunk(
  "policy/fetchPolicies",
  async ({ tenantId, module = "" } = {}, { rejectWithValue }) => {
    try {
      const params = { tenant_id: tenantId };
      if (module && module.trim()) {
        params.module = module.trim();
      }
      const response = await api.get(API_URLS.policies, { params });
      const list = pickList(response?.data);
      return {
        tenantId: tenantId || "",
        module: module || "",
        items: list.map(normalizePolicy),
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to fetch policies due to server/network error.",
        ),
      );
    }
  },
);

export const createPolicy = createAsyncThunk(
  "policy/createPolicy",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post(API_URLS.policies, payload);
      const item = pickItem(response?.data);
      if (!item) {
        return rejectWithValue("Failed to create policy.");
      }
      return {
        item: normalizePolicy(item),
        message: "Policy created successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to create policy due to server/network error.",
        ),
      );
    }
  },
);

const policySlice = createSlice({
  name: "policy",
  initialState,
  reducers: {
    setSelectedPolicyTenantId(state, action) {
      state.selectedTenantId = action.payload || "";
    },
    setSelectedPolicyModule(state, action) {
      state.selectedModule = action.payload || "";
    },
    selectPolicyById(state, action) {
      const id = String(action.payload || "");
      state.selectedPolicy =
        state.items.find((item) => item.id === id) || null;
    },
    clearPolicyListState(state) {
      state.listError = "";
      state.createError = "";
      state.createMessage = "";
    },
    clearPolicyCreateState(state) {
      state.createLoading = false;
      state.createError = "";
      state.createMessage = "";
    },
    clearSelectedPolicy(state) {
      state.selectedPolicy = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPolicies.pending, (state) => {
        state.listLoading = true;
        state.listError = "";
      })
      .addCase(fetchPolicies.fulfilled, (state, action) => {
        state.listLoading = false;
        state.items = action.payload.items;
        state.selectedTenantId = action.payload.tenantId;
        state.selectedModule = action.payload.module;
      })
      .addCase(fetchPolicies.rejected, (state, action) => {
        state.listLoading = false;
        state.items = [];
        state.listError = action.payload || "Failed to fetch policies.";
      })
      .addCase(createPolicy.pending, (state) => {
        state.createLoading = true;
        state.createError = "";
        state.createMessage = "";
      })
      .addCase(createPolicy.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createMessage = action.payload.message;
        state.items = [action.payload.item, ...state.items];
      })
      .addCase(createPolicy.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload || "Failed to create policy.";
      });
  },
});

export const {
  setSelectedPolicyTenantId,
  setSelectedPolicyModule,
  selectPolicyById,
  clearPolicyListState,
  clearPolicyCreateState,
  clearSelectedPolicy,
} = policySlice.actions;

export default policySlice.reducer;
