import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "../services/api";
import { API_URLS } from "../services/apiUrls";

const initialState = {
  createdSession: null,
  addedQuestions: [],
  sessionQuestions: [],
  sessions: [],
  mySubmissions: [],
  myLinks: [],
  sessionDetails: null,
  sessionPreview: null,
  sessionForm: null,
  createLoading: false,
  addLoading: false,
  questionsLoading: false,
  setLoading: false,
  removeLoading: false,
  reorderLoading: false,
  updateLoading: false,
  deleteLoading: false,
  listLoading: false,
  mySubmissionsLoading: false,
  myLinksLoading: false,
  detailLoading: false,
  previewLoading: false,
  publishLoading: false,
  formLoading: false,
  submitLoading: false,
  createMessage: "",
  addMessage: "",
  questionsMessage: "",
  setMessage: "",
  removeMessage: "",
  reorderMessage: "",
  updateMessage: "",
  deleteMessage: "",
  listMessage: "",
  mySubmissionsMessage: "",
  myLinksMessage: "",
  detailMessage: "",
  previewMessage: "",
  publishMessage: "",
  submitMessage: "",
  error: null,
  questionsError: null,
  setError: null,
  removeError: null,
  reorderError: null,
  updateError: null,
  deleteError: null,
  listError: null,
  mySubmissionsError: null,
  myLinksError: null,
  detailError: null,
  previewError: null,
  publishError: null,
  formError: null,
  submitError: null,
  submittedResponseId: null,
};

const normalizeSessionQuestion = (item, index) => ({
  question_id: String(item?.question_id || item?.id || index),
  question_code: item?.question_code || "",
  question_text: item?.question_text || item?.text || item?.name || "Untitled Question",
  reverse_code: Boolean(item?.reverse_code),
  display_order: item?.display_order ?? index + 1,
});

const extractSessionQuestions = (payload) => {
  const source = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
      ? payload
      : [];

  return source.map(normalizeSessionQuestion);
};

const normalizeSubmissionQuestion = (item, index) => ({
  question_code: item?.question_code || `question-${index + 1}`,
  question_text: item?.question_text || "Untitled Question",
  selected_option: item?.selected_option || "-",
  score: Number(item?.score) || 0,
});

const normalizeKpiScore = (item, index) => ({
  kpi_key: item?.kpi_key || `kpi-${index + 1}`,
  kpi_name: item?.kpi_name || "Untitled KPI",
  total_score: Number(item?.total_score) || 0,
  question_count: Number(item?.question_count) || 0,
  average_score: Number(item?.average_score) || 0,
});

const normalizeSessionSubmission = (item, index) => ({
  response_id: item?.response_id || `response-${index + 1}`,
  employee_email: item?.employee_email || "",
  submitted_at: item?.submitted_at || "",
  total_score: Number(item?.total_score) || 0,
  weighted_index: Number(item?.weighted_index) || 0,
  questions: Array.isArray(item?.questions)
    ? item.questions.map(normalizeSubmissionQuestion)
    : [],
  kpi_scores: Array.isArray(item?.kpi_scores)
    ? item.kpi_scores.map(normalizeKpiScore)
    : [],
});

const normalizeSubmissionSession = (item, index) => ({
  session_id: item?.session_id || `session-${index + 1}`,
  company_id: item?.company_id || "",
  title: item?.title || "Untitled Session",
  description: item?.description || "",
  responses: Array.isArray(item?.responses)
    ? [...item.responses]
        .map(normalizeSessionSubmission)
        .sort(
          (left, right) =>
            new Date(right.submitted_at || 0).getTime() -
            new Date(left.submitted_at || 0).getTime(),
        )
    : [],
});

const normalizeMyLink = (item, index) => ({
  session_id: item?.session_id || `session-${index + 1}`,
  title: item?.title || "Untitled Session",
  description: item?.description || "",
  published_at: item?.published_at || "",
  form_url: item?.form_url || "",
});

export const createSession = createAsyncThunk(
  "session/createSession",
  async ({ title, description, companyId }, { rejectWithValue }) => {
    try {
      const response = await api.post(API_URLS.sessions, {
        title,
        description,
        company_id: String(companyId),
      });

      const payload = response?.data || {};
      if (!payload?.success || !payload?.data?.id) {
        return rejectWithValue(payload?.message || "Session creation failed.");
      }

      return {
        session: payload.data,
        message: payload.message || "Session created successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Session creation failed due to server/network error.",
        ),
      );
    }
  },
);

export const addQuestionsToSession = createAsyncThunk(
  "session/addQuestionsToSession",
  async ({ sessionId, questionIds }, { rejectWithValue }) => {
    try {
      const response = await api.post(API_URLS.sessionQuestions(sessionId), {
        question_ids: questionIds,
      });

      const payload = response?.data || {};
      if (!payload?.success) {
        return rejectWithValue(payload?.message || "Failed to add questions.");
      }

      return {
        questions: extractSessionQuestions(payload),
        message: payload?.message || "Questions added to session successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to add questions due to server/network error.",
        ),
      );
    }
  },
);

export const fetchSessionQuestions = createAsyncThunk(
  "session/fetchSessionQuestions",
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await api.get(API_URLS.sessionQuestions(sessionId));
      const payload = response?.data || {};

      if (!payload?.success) {
        return rejectWithValue(
          payload?.message || "Failed to fetch session questions.",
        );
      }

      return {
        questions: extractSessionQuestions(payload),
        message: payload?.message || "Session questions fetched successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to fetch session questions due to server/network error.",
        ),
      );
    }
  },
);

export const setSessionQuestions = createAsyncThunk(
  "session/setSessionQuestions",
  async ({ sessionId, questionIds }, { rejectWithValue }) => {
    try {
      const response = await api.put(API_URLS.sessionQuestions(sessionId), {
        question_ids: questionIds,
      });
      const payload = response?.data || {};

      if (!payload?.success) {
        return rejectWithValue(payload?.message || "Failed to set session questions.");
      }

      return {
        questions: extractSessionQuestions(payload),
        message: payload?.message || "Session questions updated successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to set session questions due to server/network error.",
        ),
      );
    }
  },
);

export const removeSessionQuestions = createAsyncThunk(
  "session/removeSessionQuestions",
  async ({ sessionId, questionIds }, { rejectWithValue }) => {
    try {
      const response = await api.delete(API_URLS.sessionQuestions(sessionId), {
        data: {
          question_ids: questionIds,
        },
      });
      const payload = response?.data || {};

      if (!payload?.success) {
        return rejectWithValue(
          payload?.message || "Failed to remove session questions.",
        );
      }

      return {
        questions: extractSessionQuestions(payload),
        removedIds: questionIds.map(String),
        message: payload?.message || "Questions removed successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to remove session questions due to server/network error.",
        ),
      );
    }
  },
);

export const removeSingleSessionQuestion = createAsyncThunk(
  "session/removeSingleSessionQuestion",
  async ({ sessionId, questionId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        API_URLS.sessionQuestionById(sessionId, questionId),
      );
      const payload = response?.data || {};

      if (!payload?.success) {
        return rejectWithValue(payload?.message || "Failed to remove question.");
      }

      return {
        questions: extractSessionQuestions(payload),
        questionId: String(questionId),
        message: payload?.message || "Question removed successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to remove question due to server/network error.",
        ),
      );
    }
  },
);

export const reorderSessionQuestions = createAsyncThunk(
  "session/reorderSessionQuestions",
  async ({ sessionId, items }, { rejectWithValue }) => {
    try {
      const response = await api.put(API_URLS.sessionQuestionsOrder(sessionId), {
        items,
      });
      const payload = response?.data || {};

      if (!payload?.success) {
        return rejectWithValue(
          payload?.message || "Failed to reorder session questions.",
        );
      }

      return {
        questions: extractSessionQuestions(payload),
        items,
        message: payload?.message || "Question order updated successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to reorder session questions due to server/network error.",
        ),
      );
    }
  },
);

export const updateSession = createAsyncThunk(
  "session/updateSession",
  async ({ sessionId, title, description, companyId }, { rejectWithValue }) => {
    try {
      const response = await api.patch(API_URLS.sessionById(sessionId), {
        title,
        description,
        company_id: companyId ? String(companyId) : null,
      });
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(payload?.message || "Failed to update session.");
      }

      return {
        session: payload.data,
        message: payload?.message || "Session updated successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to update session due to server/network error.",
        ),
      );
    }
  },
);

export const deleteSession = createAsyncThunk(
  "session/deleteSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await api.delete(API_URLS.sessionById(sessionId));
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(payload?.message || "Failed to delete session.");
      }

      return {
        session: payload.data,
        message: payload?.message || "Session deleted successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to delete session due to server/network error.",
        ),
      );
    }
  },
);

export const fetchSessions = createAsyncThunk(
  "session/fetchSessions",
  async ({ companyId } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get(API_URLS.sessions, {
        params: {
          ...(companyId ? { company_id: companyId } : {}),
        },
      });
      const payload = response?.data || {};

      if (!payload?.success) {
        return rejectWithValue(payload?.message || "Failed to fetch sessions.");
      }

      return {
        sessions: Array.isArray(payload?.data) ? payload.data : [],
        message: payload?.message || "Sessions fetched successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to fetch sessions due to server/network error.",
        ),
      );
    }
  },
);

export const fetchMySubmissions = createAsyncThunk(
  "session/fetchMySubmissions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_URLS.sessionMySubmissions);
      const payload = response?.data || {};

      if (!payload?.success) {
        return rejectWithValue(
          payload?.message || "Failed to fetch submitted sessions.",
        );
      }

      const sessions = Array.isArray(payload?.data)
        ? payload.data.map(normalizeSubmissionSession)
        : [];

      return {
        sessions: sessions.sort((left, right) => {
          const leftLatest = left.responses[0]?.submitted_at || "";
          const rightLatest = right.responses[0]?.submitted_at || "";
          return new Date(rightLatest || 0).getTime() - new Date(leftLatest || 0).getTime();
        }),
        message: payload?.message || "Submitted sessions fetched successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to fetch submitted sessions due to server/network error.",
        ),
      );
    }
  },
);

export const fetchMyLinks = createAsyncThunk(
  "session/fetchMyLinks",
  async ({ skip = 0, limit = 50 } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get(API_URLS.sessionMyLinks, {
        params: { skip, limit },
      });
      const payload = response?.data || {};

      if (!payload?.success) {
        return rejectWithValue(
          payload?.message || "Failed to fetch session links.",
        );
      }

      const items = Array.isArray(payload?.data?.items)
        ? payload.data.items.map(normalizeMyLink)
        : [];

      return {
        items,
        message: payload?.message || "Session links fetched successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to fetch session links due to server/network error.",
        ),
      );
    }
  },
);

export const fetchSessionById = createAsyncThunk(
  "session/fetchSessionById",
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await api.get(API_URLS.sessionById(sessionId));
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(
          payload?.message || "Failed to fetch session details.",
        );
      }

      return {
        sessionDetails: payload.data,
        message: payload?.message || "Session details fetched successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to fetch session details due to server/network error.",
        ),
      );
    }
  },
);

export const fetchSessionPreview = createAsyncThunk(
  "session/fetchSessionPreview",
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await api.get(API_URLS.sessionPreview(sessionId));
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(
          payload?.message || "Failed to fetch session preview.",
        );
      }

      return {
        sessionPreview: payload.data,
        message: payload?.message || "Session preview fetched successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to fetch session preview due to server/network error.",
        ),
      );
    }
  },
);

export const publishSession = createAsyncThunk(
  "session/publishSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await api.post(API_URLS.sessionPublish(sessionId));
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(payload?.message || "Failed to publish session.");
      }

      return {
        sessionPreview: payload.data,
        message: payload?.message || "Session form published successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to publish session due to server/network error.",
        ),
      );
    }
  },
);

export const fetchSessionForm = createAsyncThunk(
  "session/fetchSessionForm",
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await api.get(API_URLS.sessionForm(sessionId));
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(payload?.message || "Failed to fetch session form.");
      }

      return {
        sessionForm: payload.data,
        message: payload?.message || "Session form fetched successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to fetch session form due to server/network error.",
        ),
      );
    }
  },
);

export const submitSessionForm = createAsyncThunk(
  "session/submitSessionForm",
  async ({ sessionId, email, answers }, { rejectWithValue }) => {
    try {
      const response = await api.post(API_URLS.sessionFormSubmit(sessionId), {
        email,
        answers,
      });
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data?.response_id) {
        return rejectWithValue(payload?.message || "Failed to submit session form.");
      }

      return {
        responseId: payload.data.response_id,
        message: payload?.message || "Session form submitted successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to submit session form due to server/network error.",
        ),
      );
    }
  },
);

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    clearSessionError(state) {
      state.error = null;
      state.questionsError = null;
      state.setError = null;
      state.removeError = null;
      state.reorderError = null;
      state.updateError = null;
      state.deleteError = null;
    },
    clearSessionListError(state) {
      state.listError = null;
    },
    clearMySubmissionsState(state) {
      state.mySubmissions = [];
      state.mySubmissionsLoading = false;
      state.mySubmissionsError = null;
      state.mySubmissionsMessage = "";
    },
    clearMyLinksState(state) {
      state.myLinks = [];
      state.myLinksLoading = false;
      state.myLinksError = null;
      state.myLinksMessage = "";
    },
    clearSessionDetailError(state) {
      state.detailError = null;
    },
    clearSessionDetails(state) {
      state.sessionDetails = null;
      state.detailMessage = "";
      state.detailError = null;
      state.detailLoading = false;
    },
    clearSessionPreview(state) {
      state.sessionPreview = null;
      state.previewMessage = "";
      state.publishMessage = "";
      state.previewError = null;
      state.publishError = null;
      state.previewLoading = false;
      state.publishLoading = false;
    },
    clearSessionForm(state) {
      state.sessionForm = null;
      state.formError = null;
      state.submitError = null;
      state.submitMessage = "";
      state.submittedResponseId = null;
      state.formLoading = false;
      state.submitLoading = false;
    },
    clearSessionQuestions(state) {
      state.sessionQuestions = [];
      state.questionsMessage = "";
      state.questionsError = null;
      state.setMessage = "";
      state.setError = null;
      state.removeMessage = "";
      state.removeError = null;
      state.reorderMessage = "";
      state.reorderError = null;
    },
    clearSessionMessages(state) {
      state.createMessage = "";
      state.addMessage = "";
      state.questionsMessage = "";
      state.setMessage = "";
      state.removeMessage = "";
      state.reorderMessage = "";
      state.updateMessage = "";
      state.deleteMessage = "";
    },
    resetSessionFlow(state) {
      state.createdSession = null;
      state.addedQuestions = [];
      state.sessionQuestions = [];
      state.createLoading = false;
      state.addLoading = false;
      state.questionsLoading = false;
      state.setLoading = false;
      state.removeLoading = false;
      state.reorderLoading = false;
      state.updateLoading = false;
      state.deleteLoading = false;
      state.createMessage = "";
      state.addMessage = "";
      state.questionsMessage = "";
      state.setMessage = "";
      state.removeMessage = "";
      state.reorderMessage = "";
      state.updateMessage = "";
      state.deleteMessage = "";
      state.error = null;
      state.questionsError = null;
      state.setError = null;
      state.removeError = null;
      state.reorderError = null;
      state.updateError = null;
      state.deleteError = null;
      state.previewMessage = "";
      state.publishMessage = "";
      state.previewError = null;
      state.publishError = null;
      state.formError = null;
      state.submitError = null;
      state.submitMessage = "";
      state.submittedResponseId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSession.pending, (state) => {
        state.createLoading = true;
        state.error = null;
        state.createMessage = "";
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createdSession = action.payload.session;
        state.addedQuestions = [];
        state.sessionQuestions = [];
        state.createMessage = action.payload.message;
      })
      .addCase(createSession.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload || "Session creation failed.";
      })
      .addCase(addQuestionsToSession.pending, (state) => {
        state.addLoading = true;
        state.error = null;
        state.addMessage = "";
      })
      .addCase(addQuestionsToSession.fulfilled, (state, action) => {
        state.addLoading = false;
        state.addedQuestions = action.payload.questions;
        state.sessionQuestions = action.payload.questions;
        state.addMessage = action.payload.message;
      })
      .addCase(addQuestionsToSession.rejected, (state, action) => {
        state.addLoading = false;
        state.error = action.payload || "Failed to add questions.";
      })
      .addCase(fetchSessionQuestions.pending, (state) => {
        state.questionsLoading = true;
        state.questionsError = null;
        state.questionsMessage = "";
      })
      .addCase(fetchSessionQuestions.fulfilled, (state, action) => {
        state.questionsLoading = false;
        state.sessionQuestions = action.payload.questions;
        state.addedQuestions = action.payload.questions;
        state.questionsMessage = action.payload.message;
      })
      .addCase(fetchSessionQuestions.rejected, (state, action) => {
        state.questionsLoading = false;
        state.questionsError = action.payload || "Failed to fetch session questions.";
      })
      .addCase(setSessionQuestions.pending, (state) => {
        state.setLoading = true;
        state.setError = null;
        state.setMessage = "";
      })
      .addCase(setSessionQuestions.fulfilled, (state, action) => {
        state.setLoading = false;
        state.sessionQuestions = action.payload.questions;
        state.addedQuestions = action.payload.questions;
        state.setMessage = action.payload.message;
      })
      .addCase(setSessionQuestions.rejected, (state, action) => {
        state.setLoading = false;
        state.setError = action.payload || "Failed to set session questions.";
      })
      .addCase(removeSessionQuestions.pending, (state) => {
        state.removeLoading = true;
        state.removeError = null;
        state.removeMessage = "";
      })
      .addCase(removeSessionQuestions.fulfilled, (state, action) => {
        state.removeLoading = false;
        state.sessionQuestions = action.payload.questions.length
          ? action.payload.questions
          : state.sessionQuestions.filter(
              (question) => !action.payload.removedIds.includes(question.question_id),
            );
        state.addedQuestions = state.sessionQuestions;
        state.removeMessage = action.payload.message;
      })
      .addCase(removeSessionQuestions.rejected, (state, action) => {
        state.removeLoading = false;
        state.removeError = action.payload || "Failed to remove session questions.";
      })
      .addCase(removeSingleSessionQuestion.pending, (state) => {
        state.removeLoading = true;
        state.removeError = null;
        state.removeMessage = "";
      })
      .addCase(removeSingleSessionQuestion.fulfilled, (state, action) => {
        state.removeLoading = false;
        state.sessionQuestions = action.payload.questions.length
          ? action.payload.questions
          : state.sessionQuestions.filter(
              (question) => question.question_id !== action.payload.questionId,
            );
        state.addedQuestions = state.sessionQuestions;
        state.removeMessage = action.payload.message;
      })
      .addCase(removeSingleSessionQuestion.rejected, (state, action) => {
        state.removeLoading = false;
        state.removeError = action.payload || "Failed to remove question.";
      })
      .addCase(reorderSessionQuestions.pending, (state) => {
        state.reorderLoading = true;
        state.reorderError = null;
        state.reorderMessage = "";
      })
      .addCase(reorderSessionQuestions.fulfilled, (state, action) => {
        state.reorderLoading = false;
        state.sessionQuestions = action.payload.questions.length
          ? action.payload.questions
          : action.payload.items.map((item, index) => {
              const existing = state.sessionQuestions.find(
                (question) => question.question_id === item.question_id,
              );
              return {
                ...(existing || {}),
                question_id: item.question_id,
                display_order: item.display_order ?? index + 1,
              };
            });
        state.addedQuestions = state.sessionQuestions;
        state.reorderMessage = action.payload.message;
      })
      .addCase(reorderSessionQuestions.rejected, (state, action) => {
        state.reorderLoading = false;
        state.reorderError = action.payload || "Failed to reorder session questions.";
      })
      .addCase(updateSession.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateMessage = "";
      })
      .addCase(updateSession.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateMessage = action.payload.message;
        state.sessions = state.sessions.map((session) =>
          session.id === action.payload.session.id ? action.payload.session : session,
        );
        if (state.createdSession?.id === action.payload.session.id) {
          state.createdSession = action.payload.session;
        }
        if (state.sessionDetails?.id === action.payload.session.id) {
          state.sessionDetails = {
            ...state.sessionDetails,
            ...action.payload.session,
          };
        }
      })
      .addCase(updateSession.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload || "Failed to update session.";
      })
      .addCase(deleteSession.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.deleteMessage = "";
      })
      .addCase(deleteSession.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteMessage = action.payload.message;
        state.sessions = state.sessions.filter(
          (session) => session.id !== action.payload.session.id,
        );
        if (state.createdSession?.id === action.payload.session.id) {
          state.createdSession = null;
          state.addedQuestions = [];
          state.sessionQuestions = [];
        }
        if (state.sessionDetails?.id === action.payload.session.id) {
          state.sessionDetails = null;
        }
      })
      .addCase(deleteSession.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload || "Failed to delete session.";
      })
      .addCase(fetchSessions.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.listLoading = false;
        state.sessions = action.payload.sessions;
        state.listMessage = action.payload.message;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload || "Failed to fetch sessions.";
      })
      .addCase(fetchMySubmissions.pending, (state) => {
        state.mySubmissionsLoading = true;
        state.mySubmissionsError = null;
        state.mySubmissionsMessage = "";
      })
      .addCase(fetchMySubmissions.fulfilled, (state, action) => {
        state.mySubmissionsLoading = false;
        state.mySubmissions = action.payload.sessions;
        state.mySubmissionsMessage = action.payload.message;
      })
      .addCase(fetchMySubmissions.rejected, (state, action) => {
        state.mySubmissionsLoading = false;
        state.mySubmissionsError =
          action.payload || "Failed to fetch submitted sessions.";
      })
      .addCase(fetchMyLinks.pending, (state) => {
        state.myLinksLoading = true;
        state.myLinksError = null;
        state.myLinksMessage = "";
      })
      .addCase(fetchMyLinks.fulfilled, (state, action) => {
        state.myLinksLoading = false;
        state.myLinks = action.payload.items;
        state.myLinksMessage = action.payload.message;
      })
      .addCase(fetchMyLinks.rejected, (state, action) => {
        state.myLinksLoading = false;
        state.myLinksError =
          action.payload || "Failed to fetch session links.";
      })
      .addCase(fetchSessionById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
        state.detailMessage = "";
      })
      .addCase(fetchSessionById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.sessionDetails = action.payload.sessionDetails;
        state.detailMessage = action.payload.message;
      })
      .addCase(fetchSessionById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload || "Failed to fetch session details.";
      })
      .addCase(fetchSessionPreview.pending, (state) => {
        state.previewLoading = true;
        state.previewError = null;
        state.previewMessage = "";
        state.publishMessage = "";
        state.publishError = null;
      })
      .addCase(fetchSessionPreview.fulfilled, (state, action) => {
        state.previewLoading = false;
        state.sessionPreview = action.payload.sessionPreview;
        state.previewMessage = action.payload.message;
      })
      .addCase(fetchSessionPreview.rejected, (state, action) => {
        state.previewLoading = false;
        state.previewError = action.payload || "Failed to fetch session preview.";
      })
      .addCase(publishSession.pending, (state) => {
        state.publishLoading = true;
        state.publishError = null;
        state.publishMessage = "";
      })
      .addCase(publishSession.fulfilled, (state, action) => {
        state.publishLoading = false;
        state.sessionPreview = action.payload.sessionPreview;
        state.publishMessage = action.payload.message;
        state.sessions = state.sessions.map((session) =>
          session.id === action.payload.sessionPreview.session_id
            ? {
                ...session,
                is_published: action.payload.sessionPreview.is_published,
                published_at: action.payload.sessionPreview.published_at,
                final_url: action.payload.sessionPreview.final_url,
              }
            : session,
        );
      })
      .addCase(publishSession.rejected, (state, action) => {
        state.publishLoading = false;
        state.publishError = action.payload || "Failed to publish session.";
      })
      .addCase(fetchSessionForm.pending, (state) => {
        state.formLoading = true;
        state.formError = null;
      })
      .addCase(fetchSessionForm.fulfilled, (state, action) => {
        state.formLoading = false;
        state.sessionForm = action.payload.sessionForm;
      })
      .addCase(fetchSessionForm.rejected, (state, action) => {
        state.formLoading = false;
        state.formError = action.payload || "Failed to fetch session form.";
      })
      .addCase(submitSessionForm.pending, (state) => {
        state.submitLoading = true;
        state.submitError = null;
        state.submitMessage = "";
        state.submittedResponseId = null;
      })
      .addCase(submitSessionForm.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.submitMessage = action.payload.message;
        state.submittedResponseId = action.payload.responseId;
      })
      .addCase(submitSessionForm.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload || "Failed to submit session form.";
      });
  },
});

export const {
  clearSessionError,
  clearSessionListError,
  clearMySubmissionsState,
  clearMyLinksState,
  clearSessionDetailError,
  clearSessionDetails,
  clearSessionPreview,
  clearSessionForm,
  clearSessionQuestions,
  clearSessionMessages,
  resetSessionFlow,
} = sessionSlice.actions;
export default sessionSlice.reducer;
