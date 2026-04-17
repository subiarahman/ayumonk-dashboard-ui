import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "../services/api";
import { API_URLS } from "../services/apiUrls";

const initialState = {
  items: [],
  loading: false,
  error: "",
};

export const fetchQuestionHierarchy = createAsyncThunk(
  "questionHierarchy/fetchQuestionHierarchy",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_URLS.questionHierarchy);
      const payload = response?.data || {};

      if (!payload?.success) {
        return rejectWithValue(payload?.message || "Failed to fetch question hierarchy.");
      }

      const items = Array.isArray(payload?.data) ? payload.data : [];
      return items.map((theme, themeIndex) => ({
        theme_key: theme?.theme_key || `theme-${themeIndex + 1}`,
        theme_display_name:
          theme?.theme_display_name || theme?.display_name || "Untitled Theme",
        description: theme?.description || "",
        kpis: Array.isArray(theme?.kpis)
          ? theme.kpis.map((kpi, kpiIndex) => ({
              kpi_key: kpi?.kpi_key || `kpi-${themeIndex + 1}-${kpiIndex + 1}`,
              display_name: kpi?.display_name || "Untitled KPI",
              description: kpi?.description || "",
              questions: Array.isArray(kpi?.questions) ? kpi.questions : [],
            }))
          : [],
      }));
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to fetch question hierarchy due to server/network error.",
        ),
      );
    }
  },
);

const questionHierarchySlice = createSlice({
  name: "questionHierarchy",
  initialState,
  reducers: {
    clearQuestionHierarchyError(state) {
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestionHierarchy.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchQuestionHierarchy.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchQuestionHierarchy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch question hierarchy.";
      });
  },
});

export const { clearQuestionHierarchyError } = questionHierarchySlice.actions;
export default questionHierarchySlice.reducer;
