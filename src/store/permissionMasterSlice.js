import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "../services/api";
import { API_URLS } from "../services/apiUrls";

const initialState = {
  items: [],
  selectedPermission: null,
  listLoading: false,
  detailLoading: false,
  createLoading: false,
  updateLoading: false,
  listError: "",
  detailError: "",
  createError: "",
  updateError: "",
  createMessage: "",
  updateMessage: "",
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

const normalizePermission = (item, index = 0) => ({
  id: String(item?.id ?? index),
  name: item?.name || "",
  module: item?.module || "",
  action: item?.action || "",
  codename: item?.codename || "",
  resource: item?.resource || "",
});

export const fetchPermissionsMaster = createAsyncThunk(
  "permissionMaster/fetchPermissionsMaster",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_URLS.permissionsMaster);
      const list = pickList(response?.data);
      return list.map(normalizePermission);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to fetch permissions due to server/network error.",
        ),
      );
    }
  },
);

export const fetchPermissionMasterById = createAsyncThunk(
  "permissionMaster/fetchPermissionMasterById",
  async (permissionId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        API_URLS.permissionMasterById(permissionId),
      );
      const item = pickItem(response?.data);
      if (!item) {
        return rejectWithValue("Failed to fetch permission.");
      }
      return normalizePermission(item);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to fetch permission due to server/network error.",
        ),
      );
    }
  },
);

export const createPermissionMaster = createAsyncThunk(
  "permissionMaster/createPermissionMaster",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post(API_URLS.permissionsMaster, payload);
      const item = pickItem(response?.data);
      if (!item) {
        return rejectWithValue("Failed to create permission.");
      }
      return {
        item: normalizePermission(item),
        message: "Permission created successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to create permission due to server/network error.",
        ),
      );
    }
  },
);

export const updatePermissionMaster = createAsyncThunk(
  "permissionMaster/updatePermissionMaster",
  async ({ permissionId, payload }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        API_URLS.permissionMasterById(permissionId),
        payload,
      );
      const item = pickItem(response?.data);
      if (!item) {
        return rejectWithValue("Failed to update permission.");
      }
      return {
        item: normalizePermission(item),
        message: "Permission updated successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to update permission due to server/network error.",
        ),
      );
    }
  },
);

const permissionMasterSlice = createSlice({
  name: "permissionMaster",
  initialState,
  reducers: {
    selectPermissionById(state, action) {
      const id = String(action.payload || "");
      state.selectedPermission =
        state.items.find((item) => item.id === id) || null;
    },
    clearPermissionMasterListState(state) {
      state.listError = "";
      state.createError = "";
      state.createMessage = "";
      state.updateError = "";
      state.updateMessage = "";
    },
    clearPermissionMasterCreateState(state) {
      state.createLoading = false;
      state.createError = "";
      state.createMessage = "";
    },
    clearPermissionMasterUpdateState(state) {
      state.updateLoading = false;
      state.updateError = "";
      state.updateMessage = "";
    },
    clearPermissionMasterDetailState(state) {
      state.detailLoading = false;
      state.detailError = "";
    },
    clearSelectedPermissionMaster(state) {
      state.selectedPermission = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPermissionsMaster.pending, (state) => {
        state.listLoading = true;
        state.listError = "";
      })
      .addCase(fetchPermissionsMaster.fulfilled, (state, action) => {
        state.listLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchPermissionsMaster.rejected, (state, action) => {
        state.listLoading = false;
        state.items = [];
        state.listError = action.payload || "Failed to fetch permissions.";
      })
      .addCase(fetchPermissionMasterById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = "";
      })
      .addCase(fetchPermissionMasterById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedPermission = action.payload;
      })
      .addCase(fetchPermissionMasterById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload || "Failed to fetch permission.";
      })
      .addCase(createPermissionMaster.pending, (state) => {
        state.createLoading = true;
        state.createError = "";
        state.createMessage = "";
      })
      .addCase(createPermissionMaster.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createMessage = action.payload.message;
        state.items = [action.payload.item, ...state.items];
      })
      .addCase(createPermissionMaster.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload || "Failed to create permission.";
      })
      .addCase(updatePermissionMaster.pending, (state) => {
        state.updateLoading = true;
        state.updateError = "";
        state.updateMessage = "";
      })
      .addCase(updatePermissionMaster.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateMessage = action.payload.message;
        state.selectedPermission = action.payload.item;
        state.items = state.items.map((item) =>
          item.id === action.payload.item.id ? action.payload.item : item,
        );
      })
      .addCase(updatePermissionMaster.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload || "Failed to update permission.";
      });
  },
});

export const {
  selectPermissionById,
  clearPermissionMasterListState,
  clearPermissionMasterCreateState,
  clearPermissionMasterUpdateState,
  clearPermissionMasterDetailState,
  clearSelectedPermissionMaster,
} = permissionMasterSlice.actions;

export default permissionMasterSlice.reducer;
