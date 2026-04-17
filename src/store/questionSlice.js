import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "../services/api";
import { API_URLS } from "../services/apiUrls";

const initialState = {
  items: [],
  total: 0,
  skip: 0,
  limit: 50,
  listLoading: false,
  detailLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  selectedQuestion: null,
  listError: "",
  detailError: "",
  createError: "",
  updateError: "",
  deleteError: "",
  createMessage: "",
  updateMessage: "",
  deleteMessage: "",
  uploadLoading: false,
  uploadStatus: null,
  uploadError: "",
  uploadResponseData: null,
};

const normalizeOption = (item, index = 0) => ({
  option_number: Number(item?.option_number ?? index + 1),
  option_text: item?.option_text || "",
  score: Number(item?.score ?? index + 1),
});

const normalizeQuestion = (item, index = 0) => ({
  id: String(item?.id || index),
  theme_key: String(item?.theme_key || ""),
  kpi_key: String(item?.kpi_key || ""),
  question_code: item?.question_code || "",
  question_text: item?.question_text || "",
  reverse_code: Boolean(item?.reverse_code),
  is_active: Boolean(item?.is_active),
  options: Array.isArray(item?.options)
    ? item.options.map(normalizeOption)
    : [],
});

export const fetchQuestions = createAsyncThunk(
  "question/fetchQuestions",
  async (
    { skip = 0, limit = 50, kpiKey = "", themeKey = "", search = "", isActive } = {},
    { rejectWithValue },
  ) => {
    try {
      const response = await api.get(API_URLS.questions, {
        params: {
          skip,
          limit,
          ...(kpiKey ? { kpi_key: kpiKey } : {}),
          ...(themeKey ? { theme_key: themeKey } : {}),
          ...(search ? { search } : {}),
          ...(typeof isActive === "boolean" ? { is_active: isActive } : {}),
        },
      });

      const payload = response?.data || {};
      if (!payload?.success) {
        return rejectWithValue(payload?.message || "Failed to fetch questions.");
      }

      const data = payload?.data || {};
      const items = Array.isArray(data?.items) ? data.items : [];

      return {
        items: items.map(normalizeQuestion),
        total: Number(data?.total) || items.length,
        skip: Number(data?.skip) || skip,
        limit: Number(data?.limit) || limit,
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to fetch questions due to server/network error.",
        ),
      );
    }
  },
);

export const fetchQuestionById = createAsyncThunk(
  "question/fetchQuestionById",
  async (questionId, { rejectWithValue }) => {
    try {
      const response = await api.get(API_URLS.questionById(questionId));
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(payload?.message || "Failed to fetch question.");
      }

      return normalizeQuestion(payload.data);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to fetch question due to server/network error.",
        ),
      );
    }
  },
);

export const createQuestion = createAsyncThunk(
  "question/createQuestion",
  async (question, { rejectWithValue }) => {
    try {
      const response = await api.post(API_URLS.questions, question);
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(payload?.message || "Failed to create question.");
      }

      return {
        item: normalizeQuestion(payload.data),
        message: payload?.message || "Question created successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to create question due to server/network error.",
        ),
      );
    }
  },
);

export const updateQuestion = createAsyncThunk(
  "question/updateQuestion",
  async ({ questionId, question }, { rejectWithValue }) => {
    try {
      const response = await api.put(API_URLS.questionById(questionId), question);
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(payload?.message || "Failed to update question.");
      }

      return {
        item: normalizeQuestion(payload.data),
        message: payload?.message || "Question updated successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to update question due to server/network error.",
        ),
      );
    }
  },
);

export const deleteQuestion = createAsyncThunk(
  "question/deleteQuestion",
  async (questionId, { rejectWithValue }) => {
    try {
      const response = await api.delete(API_URLS.questionById(questionId));
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(payload?.message || "Failed to delete question.");
      }

      return {
        item: normalizeQuestion(payload.data),
        message: payload?.message || "Question deleted successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to delete question due to server/network error.",
        ),
      );
    }
  },
);

export const uploadQuestionFile = createAsyncThunk(
  "question/uploadQuestionFile",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post(API_URLS.questionUpload, formData);
      const payload = response?.data || {};

      if (!payload?.success) {
        return rejectWithValue(payload?.message || "Upload failed.");
      }

      return payload?.data || null;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Upload failed due to server/network error."),
      );
    }
  },
);

const replaceQuestion = (items, question) =>
  items.map((item) => (item.id === question.id ? question : item));

const questionSlice = createSlice({
  name: "question",
  initialState,
  reducers: {
    clearQuestionListError(state) {
      state.listError = "";
    },
    clearQuestionDetailState(state) {
      state.detailError = "";
      state.detailLoading = false;
      state.selectedQuestion = null;
    },
    clearQuestionCreateState(state) {
      state.createError = "";
      state.createMessage = "";
      state.createLoading = false;
    },
    clearQuestionUpdateState(state) {
      state.updateError = "";
      state.updateMessage = "";
      state.updateLoading = false;
    },
    clearQuestionDeleteState(state) {
      state.deleteError = "";
      state.deleteMessage = "";
      state.deleteLoading = false;
    },
    resetQuestionUpload(state) {
      state.uploadLoading = false;
      state.uploadStatus = null;
      state.uploadError = "";
      state.uploadResponseData = null;
    },
    clearQuestionUploadError(state) {
      state.uploadError = "";
      if (state.uploadStatus === "error") {
        state.uploadStatus = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.listLoading = true;
        state.listError = "";
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.listLoading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.skip = action.payload.skip;
        state.limit = action.payload.limit;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload || "Failed to fetch questions.";
      })
      .addCase(fetchQuestionById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = "";
        state.selectedQuestion = null;
      })
      .addCase(fetchQuestionById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedQuestion = action.payload;
      })
      .addCase(fetchQuestionById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload || "Failed to fetch question.";
      })
      .addCase(createQuestion.pending, (state) => {
        state.createLoading = true;
        state.createError = "";
        state.createMessage = "";
      })
      .addCase(createQuestion.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createMessage = action.payload.message;
      })
      .addCase(createQuestion.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload || "Failed to create question.";
      })
      .addCase(updateQuestion.pending, (state) => {
        state.updateLoading = true;
        state.updateError = "";
        state.updateMessage = "";
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateMessage = action.payload.message;
        state.selectedQuestion = action.payload.item;
        state.items = replaceQuestion(state.items, action.payload.item);
      })
      .addCase(updateQuestion.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload || "Failed to update question.";
      })
      .addCase(deleteQuestion.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = "";
        state.deleteMessage = "";
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteMessage = action.payload.message;
        state.items = state.items.filter((item) => item.id !== action.payload.item.id);
        if (state.selectedQuestion?.id === action.payload.item.id) {
          state.selectedQuestion = null;
        }
      })
      .addCase(deleteQuestion.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload || "Failed to delete question.";
      })
      .addCase(uploadQuestionFile.pending, (state) => {
        state.uploadLoading = true;
        state.uploadStatus = null;
        state.uploadError = "";
        state.uploadResponseData = null;
      })
      .addCase(uploadQuestionFile.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.uploadStatus = "success";
        state.uploadResponseData = action.payload;
      })
      .addCase(uploadQuestionFile.rejected, (state, action) => {
        state.uploadLoading = false;
        state.uploadStatus = "error";
        state.uploadError = action.payload || "Upload failed.";
      });
  },
});

export const {
  clearQuestionListError,
  clearQuestionDetailState,
  clearQuestionCreateState,
  clearQuestionUpdateState,
  clearQuestionDeleteState,
  resetQuestionUpload,
  clearQuestionUploadError,
} = questionSlice.actions;

export default questionSlice.reducer;
