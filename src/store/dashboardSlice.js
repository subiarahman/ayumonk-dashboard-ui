import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "../services/api";
import { API_URLS } from "../services/apiUrls";

const initialState = {
  items: [],
  loading: false,
  error: "",
  actionLoadingById: {},
  actionErrorById: {},
  actionResultById: {},
  suggestions: {
    session_id: "",
    response_id: "",
    submitted_at: "",
    items: [],
  },
  suggestionsLoading: false,
  suggestionsError: "",
};

const normalizeSuggestionTrigger = (item = {}) => ({
  trigger_mode: item?.trigger_mode || "",
  risk_level: item?.risk_level || "",
  kpi_key: item?.kpi_key || "",
  kpi_display_name: item?.kpi_display_name || "",
  kpi_average_score: Number(item?.kpi_average_score) || 0,
  question_key: item?.question_key || "",
  question_text: item?.question_text || "",
  question_score: Number(item?.question_score) || 0,
  score_threshold_below: Number(item?.score_threshold_below) || 0,
  priority: Number(item?.priority) || 0,
});

const normalizeSuggestionItem = (item = {}, index) => ({
  suggestion_id: item?.suggestion_id || `suggestion-${index + 1}`,
  suggestion_type: item?.suggestion_type || "",
  title: item?.title || "Lifestyle Suggestion",
  description: item?.description || "",
  url: item?.url || "",
  dosha_type: item?.dosha_type || "",
  difficulty: item?.difficulty || "",
  duration_mins: Number(item?.duration_mins) || 0,
  triggers: Array.isArray(item?.triggers)
    ? item.triggers.map(normalizeSuggestionTrigger)
    : [],
});

export const fetchDashboardKpis = createAsyncThunk(
  "dashboard/fetchDashboardKpis",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_URLS.dashboardKpis);
      const payload = response?.data || {};

      if (!payload?.success) {
        return rejectWithValue(payload?.message || "Failed to fetch dashboard KPIs.");
      }

      return Array.isArray(payload?.data?.items) ? payload.data.items : [];
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch dashboard KPIs due to server/network error."),
      );
    }
  },
);

export const postDashboardChallengeAction = createAsyncThunk(
  "dashboard/postDashboardChallengeAction",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post(API_URLS.dashboardChallengeAction, payload);
      const responsePayload = response?.data || {};

      if (!responsePayload?.success) {
        return rejectWithValue({
          challengeId: payload.challenge_id,
          message: responsePayload?.message || "Failed to submit challenge action.",
        });
      }

      return {
        challengeId: payload.challenge_id,
        payload: responsePayload?.data || {},
      };
    } catch (error) {
      return rejectWithValue({
        challengeId: payload.challenge_id,
        message: getApiErrorMessage(
          error,
          "Failed to submit challenge action due to server/network error.",
        ),
      });
    }
  },
);

export const fetchSessionSuggestions = createAsyncThunk(
  "dashboard/fetchSessionSuggestions",
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await api.get(API_URLS.sessionSuggestions(sessionId));
      const payload = response?.data || {};

      if (!payload?.success) {
        return rejectWithValue(
          payload?.message || "Failed to fetch session suggestions.",
        );
      }

      const data = payload?.data || {};

      return {
        session_id: data?.session_id || sessionId || "",
        response_id: data?.response_id || "",
        submitted_at: data?.submitted_at || "",
        items: Array.isArray(data?.items)
          ? data.items.map(normalizeSuggestionItem)
          : [],
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to fetch session suggestions due to server/network error.",
        ),
      );
    }
  },
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardError(state) {
      state.error = "";
    },
    clearDashboardChallengeActionError(state, action) {
      if (action.payload) {
        delete state.actionErrorById[action.payload];
        return;
      }

      state.actionErrorById = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardKpis.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchDashboardKpis.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchDashboardKpis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch dashboard KPIs.";
      })
      .addCase(postDashboardChallengeAction.pending, (state, action) => {
        const challengeId = action.meta.arg?.challenge_id;
        if (!challengeId) return;

        state.actionLoadingById[challengeId] = true;
        delete state.actionErrorById[challengeId];
      })
      .addCase(postDashboardChallengeAction.fulfilled, (state, action) => {
        const { challengeId, payload } = action.payload;
        state.actionLoadingById[challengeId] = false;
        state.actionResultById[challengeId] = payload;
      })
      .addCase(postDashboardChallengeAction.rejected, (state, action) => {
        const challengeId = action.payload?.challengeId || action.meta.arg?.challenge_id;
        if (!challengeId) return;

        state.actionLoadingById[challengeId] = false;
        state.actionErrorById[challengeId] =
          action.payload?.message || "Failed to submit challenge action.";
      })
      .addCase(fetchSessionSuggestions.pending, (state) => {
        state.suggestionsLoading = true;
        state.suggestionsError = "";
      })
      .addCase(fetchSessionSuggestions.fulfilled, (state, action) => {
        state.suggestionsLoading = false;
        state.suggestions = action.payload;
      })
      .addCase(fetchSessionSuggestions.rejected, (state, action) => {
        state.suggestionsLoading = false;
        state.suggestionsError =
          action.payload || "Failed to fetch session suggestions.";
      });
  },
});

export const { clearDashboardError, clearDashboardChallengeActionError } =
  dashboardSlice.actions;

export default dashboardSlice.reducer;
