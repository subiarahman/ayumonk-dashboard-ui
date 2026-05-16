import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "../services/api";
import { API_URLS } from "../services/apiUrls";

const initialState = {
  loading: {
    permissionsAdd: false,
    permissionsRemove: false,
    policiesAdd: false,
    policiesRemove: false,
    menusAdd: false,
    menusRemove: false,
  },
  error: "",
  message: "",
  rolePermissions: [],
  roleMenus: [],
  rolePermissionsRoleId: "",
  roleMenusRoleId: "",
  rolePermissionsLoading: false,
  roleMenusLoading: false,
  rolePermissionsError: "",
  roleMenusError: "",
};

const buildThunk = (typeName, urlBuilder, fallbackError) =>
  createAsyncThunk(
    `roleAssignment/${typeName}`,
    async ({ roleId, payload }, { rejectWithValue }) => {
      try {
        const response = await api.post(urlBuilder(roleId), payload);
        return {
          data: response?.data || null,
        };
      } catch (error) {
        return rejectWithValue(getApiErrorMessage(error, fallbackError));
      }
    },
  );

const pickList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

const normalizeRolePermission = (item, index = 0) => ({
  id: String(item?.permission_id ?? item?.id ?? index),
  name: item?.permission_name || item?.name || "",
  codename: item?.permission_codename || item?.codename || "",
  module: item?.module || "",
  action: item?.action || "",
  resource: item?.resource || "",
  is_granted: item?.is_granted ?? true,
  is_override: item?.is_override ?? false,
});

const normalizeRoleMenu = (item, index = 0) => {
  const rawId = item?.menu_id ?? item?.id ?? index;
  return {
    id: String(rawId),
    name: item?.menu_name || item?.name || "",
    slug: item?.menu_slug || item?.slug || "",
    path: item?.path || "",
    icon: item?.icon || "",
    access_level: item?.access_level || "",
    order_no:
      item?.order_no === null || item?.order_no === undefined
        ? 0
        : Number(item.order_no),
  };
};

export const addRolePermissions = buildThunk(
  "addRolePermissions",
  API_URLS.roleAddPermissions,
  "Failed to add permissions to role.",
);
export const removeRolePermissions = buildThunk(
  "removeRolePermissions",
  API_URLS.roleRemovePermissions,
  "Failed to remove permissions from role.",
);
export const addRolePolicies = buildThunk(
  "addRolePolicies",
  API_URLS.roleAddPolicies,
  "Failed to add policies to role.",
);
export const removeRolePolicies = buildThunk(
  "removeRolePolicies",
  API_URLS.roleRemovePolicies,
  "Failed to remove policies from role.",
);
export const addRoleMenus = buildThunk(
  "addRoleMenus",
  API_URLS.roleAddMenus,
  "Failed to add menus to role.",
);
export const removeRoleMenus = buildThunk(
  "removeRoleMenus",
  API_URLS.roleRemoveMenus,
  "Failed to remove menus from role.",
);

export const fetchRolePermissions = createAsyncThunk(
  "roleAssignment/fetchRolePermissions",
  async ({ roleId, tenantId }, { rejectWithValue }) => {
    try {
      const response = await api.get(API_URLS.roleListPermissions(roleId), {
        params: { tenant_id: tenantId },
      });
      const list = pickList(response?.data);
      return {
        roleId: String(roleId),
        items: list.map(normalizeRolePermission),
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch role permissions."),
      );
    }
  },
);

export const fetchRoleMenus = createAsyncThunk(
  "roleAssignment/fetchRoleMenus",
  async ({ roleId, tenantId }, { rejectWithValue }) => {
    try {
      const response = await api.get(API_URLS.roleListMenus(roleId), {
        params: { tenant_id: tenantId },
      });
      const list = pickList(response?.data);
      return {
        roleId: String(roleId),
        items: list.map(normalizeRoleMenu),
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch role menus."),
      );
    }
  },
);

const loadingMap = {
  [addRolePermissions.typePrefix]: "permissionsAdd",
  [removeRolePermissions.typePrefix]: "permissionsRemove",
  [addRolePolicies.typePrefix]: "policiesAdd",
  [removeRolePolicies.typePrefix]: "policiesRemove",
  [addRoleMenus.typePrefix]: "menusAdd",
  [removeRoleMenus.typePrefix]: "menusRemove",
};

const successMessageMap = {
  [addRolePermissions.typePrefix]: "Permissions added to role.",
  [removeRolePermissions.typePrefix]: "Permissions removed from role.",
  [addRolePolicies.typePrefix]: "Policies added to role.",
  [removeRolePolicies.typePrefix]: "Policies removed from role.",
  [addRoleMenus.typePrefix]: "Menus added to role.",
  [removeRoleMenus.typePrefix]: "Menus removed from role.",
};

const roleAssignmentSlice = createSlice({
  name: "roleAssignment",
  initialState,
  reducers: {
    clearRoleAssignmentFeedback(state) {
      state.error = "";
      state.message = "";
    },
    clearRolePermissionsList(state) {
      state.rolePermissions = [];
      state.rolePermissionsRoleId = "";
      state.rolePermissionsError = "";
      state.rolePermissionsLoading = false;
    },
    clearRoleMenusList(state) {
      state.roleMenus = [];
      state.roleMenusRoleId = "";
      state.roleMenusError = "";
      state.roleMenusLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRolePermissions.pending, (state, action) => {
        state.rolePermissionsLoading = true;
        state.rolePermissionsError = "";
        state.rolePermissionsRoleId = String(action.meta.arg.roleId);
      })
      .addCase(fetchRolePermissions.fulfilled, (state, action) => {
        state.rolePermissionsLoading = false;
        state.rolePermissions = action.payload.items;
        state.rolePermissionsRoleId = action.payload.roleId;
      })
      .addCase(fetchRolePermissions.rejected, (state, action) => {
        state.rolePermissionsLoading = false;
        state.rolePermissions = [];
        state.rolePermissionsError =
          action.payload || "Failed to fetch role permissions.";
      })
      .addCase(fetchRoleMenus.pending, (state, action) => {
        state.roleMenusLoading = true;
        state.roleMenusError = "";
        state.roleMenusRoleId = String(action.meta.arg.roleId);
      })
      .addCase(fetchRoleMenus.fulfilled, (state, action) => {
        state.roleMenusLoading = false;
        state.roleMenus = action.payload.items;
        state.roleMenusRoleId = action.payload.roleId;
      })
      .addCase(fetchRoleMenus.rejected, (state, action) => {
        state.roleMenusLoading = false;
        state.roleMenus = [];
        state.roleMenusError =
          action.payload || "Failed to fetch role menus.";
      });

    Object.entries(loadingMap).forEach(([typePrefix, key]) => {
      builder
        .addMatcher(
          (action) => action.type === `${typePrefix}/pending`,
          (state) => {
            state.loading[key] = true;
            state.error = "";
            state.message = "";
          },
        )
        .addMatcher(
          (action) => action.type === `${typePrefix}/fulfilled`,
          (state) => {
            state.loading[key] = false;
            state.message = successMessageMap[typePrefix];
          },
        )
        .addMatcher(
          (action) => action.type === `${typePrefix}/rejected`,
          (state, action) => {
            state.loading[key] = false;
            state.error =
              action.payload || "Role assignment request failed.";
          },
        );
    });
  },
});

export const {
  clearRoleAssignmentFeedback,
  clearRolePermissionsList,
  clearRoleMenusList,
} = roleAssignmentSlice.actions;

export default roleAssignmentSlice.reducer;
