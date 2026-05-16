import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "../services/api";
import { API_URLS } from "../services/apiUrls";

const initialState = {
  items: [],
  total: 0,
  skip: 0,
  limit: 50,
  loadedCompanyId: "",
  listLoading: false,
  listError: "",
  createLoading: false,
  createError: "",
  createMessage: "",
  updateLoading: false,
  updateError: "",
  updateMessage: "",
  deleteLoading: false,
  deleteError: "",
  deleteMessage: "",
};

const pickList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

const pickTotal = (payload, fallback) => {
  const raw =
    payload?.data?.total ??
    payload?.total ??
    payload?.count ??
    null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeDepartment = (item, index = 0) => ({
  id: String(item?.id ?? index),
  name: item?.name || "",
  description: item?.description || "",
  company_id: item?.company_id || "",
  is_active: item?.is_active ?? true,
  created_at: item?.created_at || "",
  updated_at: item?.updated_at || "",
});

export const fetchDepartments = createAsyncThunk(
  "department/fetchDepartments",
  async (arg = "", { rejectWithValue }) => {
    // Back-compat: accept either a bare companyId string or an options object.
    const {
      companyId,
      isActive,
      search,
      skip,
      limit,
    } =
      typeof arg === "object" && arg !== null
        ? arg
        : { companyId: arg, isActive: true };

    try {
      const params = {};
      if (companyId) params.company_id = companyId;
      if (typeof isActive === "boolean") params.is_active = isActive;
      const trimmedSearch = (search || "").trim();
      if (trimmedSearch) params.search = trimmedSearch;
      if (typeof skip === "number") params.skip = skip;
      if (typeof limit === "number") params.limit = limit;

      const response = await api.get(API_URLS.departments, { params });
      const payload = response?.data || {};
      const list = pickList(payload);
      const normalized = list.map(normalizeDepartment);
      return {
        companyId: companyId || "",
        items: normalized,
        total: pickTotal(payload, normalized.length),
        skip: typeof skip === "number" ? skip : 0,
        limit: typeof limit === "number" ? limit : normalized.length,
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to fetch departments due to server/network error.",
        ),
      );
    }
  },
);

export const createDepartment = createAsyncThunk(
  "department/createDepartment",
  async ({ name, description, company_id }, { rejectWithValue }) => {
    try {
      const response = await api.post(API_URLS.departments, {
        name,
        description,
        company_id,
      });
      const payload = response?.data || {};
      if (!payload?.success && payload?.success !== undefined) {
        return rejectWithValue(payload?.message || "Failed to create department.");
      }
      const created = payload?.data?.department || payload?.data || {};
      return {
        department: normalizeDepartment(created),
        message: payload?.message || "Department created successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to create department due to server/network error.",
        ),
      );
    }
  },
);

export const updateDepartment = createAsyncThunk(
  "department/updateDepartment",
  async ({ id, company_id, name, description }, { rejectWithValue }) => {
    try {
      const body = {};
      if (name !== undefined) body.name = name;
      if (description !== undefined) body.description = description;

      const response = await api.put(API_URLS.departmentById(id), body, {
        params: company_id ? { company_id } : undefined,
      });
      const payload = response?.data || {};
      if (!payload?.success && payload?.success !== undefined) {
        return rejectWithValue(payload?.message || "Failed to update department.");
      }
      const updated = payload?.data?.department || payload?.data || {};
      return {
        department: normalizeDepartment(updated),
        message: payload?.message || "Department updated successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to update department due to server/network error.",
        ),
      );
    }
  },
);

export const deleteDepartment = createAsyncThunk(
  "department/deleteDepartment",
  async ({ id, company_id }, { rejectWithValue }) => {
    try {
      const response = await api.delete(API_URLS.departmentById(id), {
        params: company_id ? { company_id } : undefined,
      });
      const payload = response?.data || {};
      if (!payload?.success && payload?.success !== undefined) {
        return rejectWithValue(payload?.message || "Failed to delete department.");
      }
      return {
        id: String(id),
        message: payload?.message || "Department deleted successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to delete department due to server/network error.",
        ),
      );
    }
  },
);

const departmentSlice = createSlice({
  name: "department",
  initialState,
  reducers: {
    clearDepartmentListState(state) {
      state.listError = "";
    },
    resetDepartments(state) {
      state.items = [];
      state.total = 0;
      state.loadedCompanyId = "";
      state.listError = "";
      state.listLoading = false;
    },
    clearDepartmentCreateState(state) {
      state.createLoading = false;
      state.createError = "";
      state.createMessage = "";
    },
    clearDepartmentUpdateState(state) {
      state.updateLoading = false;
      state.updateError = "";
      state.updateMessage = "";
    },
    clearDepartmentDeleteState(state) {
      state.deleteLoading = false;
      state.deleteError = "";
      state.deleteMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.listLoading = true;
        state.listError = "";
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.listLoading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.skip = action.payload.skip;
        state.limit = action.payload.limit;
        state.loadedCompanyId = action.payload.companyId;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.listLoading = false;
        state.items = [];
        state.listError = action.payload || "Failed to fetch departments.";
      })
      .addCase(createDepartment.pending, (state) => {
        state.createLoading = true;
        state.createError = "";
        state.createMessage = "";
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createMessage = action.payload.message;
        if (action.payload.department?.id) {
          state.items = [action.payload.department, ...state.items];
          state.total += 1;
        }
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload || "Failed to create department.";
      })
      .addCase(updateDepartment.pending, (state) => {
        state.updateLoading = true;
        state.updateError = "";
        state.updateMessage = "";
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateMessage = action.payload.message;
        const updated = action.payload.department;
        if (updated?.id) {
          state.items = state.items.map((item) =>
            item.id === updated.id ? { ...item, ...updated } : item,
          );
        }
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload || "Failed to update department.";
      })
      .addCase(deleteDepartment.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = "";
        state.deleteMessage = "";
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteMessage = action.payload.message;
        state.items = state.items.filter(
          (item) => item.id !== action.payload.id,
        );
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload || "Failed to delete department.";
      });
  },
});

export const {
  clearDepartmentListState,
  resetDepartments,
  clearDepartmentCreateState,
  clearDepartmentUpdateState,
  clearDepartmentDeleteState,
} = departmentSlice.actions;

export default departmentSlice.reducer;
