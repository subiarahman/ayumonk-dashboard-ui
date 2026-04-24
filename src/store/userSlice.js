import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "../services/api";
import { API_URLS } from "../services/apiUrls";

const initialState = {
  users: [],
  selectedUser: null,
  total: 0,
  skip: 0,
  limit: 100,
  usersLoading: false,
  detailLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  error: "",
  detailError: "",
  createError: "",
  updateError: "",
  deleteError: "",
  message: "",
  detailMessage: "",
  createMessage: "",
  updateMessage: "",
  deleteMessage: "",
};

const pickArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

const normalizeUser = (item, index = 0) => ({
  id: String(item?.id || item?.user_id || index),
  emp_id: item?.emp_id || item?.employee_id || "",
  full_name: item?.full_name || "",
  department: item?.department || "",
  location: item?.location || "",
  gender: item?.gender || "",
  age_band: item?.age_band || "",
  phone: String(item?.phone ?? ""),
  email: item?.email || "",
  company_id: item?.company_id || "",
  is_active: Boolean(item?.is_active),
  created_at: item?.created_at || "",
  updated_at: item?.updated_at || "",
});

export const fetchUsers = createAsyncThunk(
  "user/fetchUsers",
  async ({ companyId, search = "", isActive } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get(API_URLS.users, {
        params: {
          ...(companyId ? { company_id: companyId } : {}),
          ...(search ? { search } : {}),
          ...(typeof isActive === "boolean" ? { is_active: isActive } : {}),
        },
      });
      const payload = response?.data || {};

      if (!payload?.success) {
        return rejectWithValue(payload?.message || "Failed to fetch users.");
      }

      return {
        users: pickArray(payload).map(normalizeUser),
        total: Number(payload?.data?.total ?? pickArray(payload).length ?? 0),
        skip: Number(payload?.data?.skip ?? 0),
        limit: Number(payload?.data?.limit ?? 100),
        message: payload?.message || "Company users fetched successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to fetch users due to server/network error.",
        ),
      );
    }
  },
);

export const fetchUserById = createAsyncThunk(
  "user/fetchUserById",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(API_URLS.userById(userId));
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(payload?.message || "Failed to fetch user.");
      }

      return {
        user: normalizeUser(payload.data),
        message: payload?.message || "Company user fetched successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to fetch user due to server/network error.",
        ),
      );
    }
  },
);

export const createUser = createAsyncThunk(
  "user/createUser",
  async (user, { rejectWithValue }) => {
    try {
      const response = await api.post(API_URLS.users, user);
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(payload?.message || "Failed to create user.");
      }

      return {
        user: normalizeUser(payload.data),
        message: payload?.message || "Company user created successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to create user due to server/network error.",
        ),
      );
    }
  },
);

export const updateUser = createAsyncThunk(
  "user/updateUser",
  async ({ userId, user }, { rejectWithValue }) => {
    try {
      const response = await api.put(API_URLS.userById(userId), user);
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(payload?.message || "Failed to update user.");
      }

      return {
        user: normalizeUser(payload.data),
        message: payload?.message || "Company user updated successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to update user due to server/network error.",
        ),
      );
    }
  },
);

export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.delete(API_URLS.userById(userId));
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(payload?.message || "Failed to delete user.");
      }

      return {
        user: normalizeUser(payload.data),
        message: payload?.message || "Company user deleted successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to delete user due to server/network error.",
        ),
      );
    }
  },
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserError(state) {
      state.error = "";
      state.createError = "";
      state.updateError = "";
      state.deleteError = "";
    },
    clearUserDetailState(state) {
      state.selectedUser = null;
      state.detailLoading = false;
      state.detailError = "";
      state.detailMessage = "";
    },
    clearUserCreateState(state) {
      state.createLoading = false;
      state.createError = "";
      state.createMessage = "";
    },
    clearUserUpdateState(state) {
      state.updateLoading = false;
      state.updateError = "";
      state.updateMessage = "";
    },
    clearUserDeleteState(state) {
      state.deleteLoading = false;
      state.deleteError = "";
      state.deleteMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.usersLoading = true;
        state.error = "";
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload.users;
        state.total = action.payload.total;
        state.skip = action.payload.skip;
        state.limit = action.payload.limit;
        state.message = action.payload.message;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload || "Failed to fetch users.";
      })
      .addCase(fetchUserById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = "";
        state.detailMessage = "";
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedUser = action.payload.user;
        state.detailMessage = action.payload.message;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload || "Failed to fetch user.";
      })
      .addCase(createUser.pending, (state) => {
        state.createLoading = true;
        state.createError = "";
        state.createMessage = "";
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createMessage = action.payload.message;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload || "Failed to create user.";
      })
      .addCase(updateUser.pending, (state) => {
        state.updateLoading = true;
        state.updateError = "";
        state.updateMessage = "";
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateMessage = action.payload.message;
        state.selectedUser = action.payload.user;
        state.users = state.users.map((item) =>
          item.id === action.payload.user.id ? action.payload.user : item,
        );
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload || "Failed to update user.";
      })
      .addCase(deleteUser.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = "";
        state.deleteMessage = "";
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteMessage = action.payload.message;
        state.users = state.users.filter((item) => item.id !== action.payload.user.id);
        state.total = Math.max(0, state.total - 1);
        if (state.selectedUser?.id === action.payload.user.id) {
          state.selectedUser = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload || "Failed to delete user.";
      });
  },
});

export const {
  clearUserError,
  clearUserDetailState,
  clearUserCreateState,
  clearUserUpdateState,
  clearUserDeleteState,
} = userSlice.actions;

export { normalizeUser };

export default userSlice.reducer;
