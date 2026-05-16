import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "../services/api";
import { API_URLS } from "../services/apiUrls";

const initialState = {
  items: [],
  total: 0,
  skip: 0,
  limit: 500,
  listLoading: false,
  listError: "",
};

const normalizeLocation = (item, index = 0) => ({
  id: String(item?.id ?? index),
  name: item?.name || "",
  name_normalized: item?.name_normalized || "",
  is_active: item?.is_active ?? true,
  created_at: item?.created_at || "",
  updated_at: item?.updated_at || "",
});

export const fetchLocations = createAsyncThunk(
  "location/fetchLocations",
  async (
    { search = "", isActive = true, skip = 0, limit = 500 } = {},
    { rejectWithValue },
  ) => {
    try {
      const params = { skip, limit };
      if (typeof isActive === "boolean") params.is_active = isActive;
      const trimmedSearch = (search || "").trim();
      if (trimmedSearch) params.search = trimmedSearch;

      const response = await api.get(API_URLS.locations, { params });
      const payload = response?.data || {};

      if (payload?.success === false) {
        return rejectWithValue(payload?.message || "Failed to fetch locations.");
      }

      const data = payload?.data || {};
      const rawItems = Array.isArray(data?.items) ? data.items : [];

      return {
        items: rawItems.map(normalizeLocation),
        total: Number(data?.total ?? rawItems.length) || 0,
        skip: Number(data?.skip ?? skip) || 0,
        limit: Number(data?.limit ?? limit) || limit,
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to fetch locations due to server/network error.",
        ),
      );
    }
  },
);

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    resetLocations(state) {
      state.items = [];
      state.total = 0;
      state.skip = 0;
      state.listLoading = false;
      state.listError = "";
    },
    clearLocationListError(state) {
      state.listError = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocations.pending, (state) => {
        state.listLoading = true;
        state.listError = "";
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.listLoading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.skip = action.payload.skip;
        state.limit = action.payload.limit;
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.listLoading = false;
        state.items = [];
        state.listError = action.payload || "Failed to fetch locations.";
      });
  },
});

export const { resetLocations, clearLocationListError } = locationSlice.actions;

export default locationSlice.reducer;
