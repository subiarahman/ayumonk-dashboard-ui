import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "../services/api";
import { API_URLS } from "../services/apiUrls";

const initialState = {
  items: [],
  selectedMenu: null,
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

const normalizeMenu = (item, index = 0) => {
  const rawId = item?.id ?? item?.menu_id ?? index;
  const rawParentId = item?.parent_id;
  return {
    id: String(rawId),
    raw_id: rawId,
    name: item?.name || item?.menu_name || "",
    slug: item?.slug || "",
    path: item?.path || "",
    parent_id:
      rawParentId === null || rawParentId === undefined || rawParentId === ""
        ? ""
        : String(rawParentId),
    icon: item?.icon || "",
    order_no:
      item?.order_no === null || item?.order_no === undefined
        ? 0
        : Number(item.order_no),
    is_active: item?.is_active ?? true,
  };
};

export const fetchMenus = createAsyncThunk(
  "menuMaster/fetchMenus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_URLS.menusMasterAll);
      const list = pickList(response?.data);
      return list.map(normalizeMenu);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to fetch menus due to server/network error.",
        ),
      );
    }
  },
);

export const fetchMenuById = createAsyncThunk(
  "menuMaster/fetchMenuById",
  async (menuId, { rejectWithValue }) => {
    try {
      const response = await api.get(API_URLS.menuMasterById(menuId));
      const item = pickItem(response?.data);
      if (!item) {
        return rejectWithValue("Failed to fetch menu.");
      }
      return normalizeMenu(item);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to fetch menu due to server/network error.",
        ),
      );
    }
  },
);

export const createMenu = createAsyncThunk(
  "menuMaster/createMenu",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post(API_URLS.menusMaster, payload);
      const item = pickItem(response?.data);
      if (!item) {
        return rejectWithValue("Failed to create menu.");
      }
      return {
        item: normalizeMenu(item),
        message: "Menu created successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to create menu due to server/network error.",
        ),
      );
    }
  },
);

export const updateMenu = createAsyncThunk(
  "menuMaster/updateMenu",
  async ({ menuId, payload }, { rejectWithValue }) => {
    try {
      const response = await api.put(API_URLS.menuMasterById(menuId), payload);
      const item = pickItem(response?.data);
      if (!item) {
        return rejectWithValue("Failed to update menu.");
      }
      return {
        item: normalizeMenu(item),
        message: "Menu updated successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to update menu due to server/network error.",
        ),
      );
    }
  },
);

export const deleteMenu = createAsyncThunk(
  "menuMaster/deleteMenu",
  async (menuId, { rejectWithValue }) => {
    try {
      await api.delete(API_URLS.menuMasterById(menuId));
      return {
        id: String(menuId),
        message: "Menu deleted successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to delete menu due to server/network error.",
        ),
      );
    }
  },
);

const menuMasterSlice = createSlice({
  name: "menuMaster",
  initialState,
  reducers: {
    selectMenuById(state, action) {
      const id = String(action.payload || "");
      state.selectedMenu = state.items.find((item) => item.id === id) || null;
    },
    clearMenuMasterListState(state) {
      state.listError = "";
      state.createError = "";
      state.createMessage = "";
      state.updateError = "";
      state.updateMessage = "";
      state.deleteError = "";
      state.deleteMessage = "";
    },
    clearMenuMasterCreateState(state) {
      state.createLoading = false;
      state.createError = "";
      state.createMessage = "";
    },
    clearMenuMasterUpdateState(state) {
      state.updateLoading = false;
      state.updateError = "";
      state.updateMessage = "";
    },
    clearMenuMasterDeleteState(state) {
      state.deleteLoading = false;
      state.deleteError = "";
      state.deleteMessage = "";
    },
    clearMenuMasterDetailState(state) {
      state.detailLoading = false;
      state.detailError = "";
    },
    clearSelectedMenuMaster(state) {
      state.selectedMenu = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenus.pending, (state) => {
        state.listLoading = true;
        state.listError = "";
      })
      .addCase(fetchMenus.fulfilled, (state, action) => {
        state.listLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchMenus.rejected, (state, action) => {
        state.listLoading = false;
        state.items = [];
        state.listError = action.payload || "Failed to fetch menus.";
      })
      .addCase(fetchMenuById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = "";
      })
      .addCase(fetchMenuById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedMenu = action.payload;
      })
      .addCase(fetchMenuById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload || "Failed to fetch menu.";
      })
      .addCase(createMenu.pending, (state) => {
        state.createLoading = true;
        state.createError = "";
        state.createMessage = "";
      })
      .addCase(createMenu.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createMessage = action.payload.message;
        state.items = [action.payload.item, ...state.items];
      })
      .addCase(createMenu.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload || "Failed to create menu.";
      })
      .addCase(updateMenu.pending, (state) => {
        state.updateLoading = true;
        state.updateError = "";
        state.updateMessage = "";
      })
      .addCase(updateMenu.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateMessage = action.payload.message;
        state.selectedMenu = action.payload.item;
        state.items = state.items.map((item) =>
          item.id === action.payload.item.id ? action.payload.item : item,
        );
      })
      .addCase(updateMenu.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload || "Failed to update menu.";
      })
      .addCase(deleteMenu.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = "";
        state.deleteMessage = "";
      })
      .addCase(deleteMenu.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteMessage = action.payload.message;
        state.items = state.items.filter(
          (item) => item.id !== action.payload.id,
        );
        if (state.selectedMenu?.id === action.payload.id) {
          state.selectedMenu = null;
        }
      })
      .addCase(deleteMenu.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload || "Failed to delete menu.";
      });
  },
});

export const {
  selectMenuById,
  clearMenuMasterListState,
  clearMenuMasterCreateState,
  clearMenuMasterUpdateState,
  clearMenuMasterDeleteState,
  clearMenuMasterDetailState,
  clearSelectedMenuMaster,
} = menuMasterSlice.actions;

export default menuMasterSlice.reducer;
