import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "../services/api";
import { API_URLS } from "../services/apiUrls";

const initialState = {
  items: [],
  total: 0,
  unread: 0,
  skip: 0,
  limit: 20,
  loading: false,
  error: "",
  mutationError: "",
};

const runRequest = async (request, fallback, rejectWithValue) => {
  try {
    const response = await request();
    const payload = response?.data || {};
    if (payload?.success === false) {
      return rejectWithValue(payload?.message || fallback);
    }
    return payload?.data ?? null;
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, fallback));
  }
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchList",
  (params = {}, { rejectWithValue }) =>
    runRequest(
      () =>
        api.get(API_URLS.notifications, {
          params: { skip: 0, limit: 20, ...params },
        }),
      "Failed to load notifications.",
      rejectWithValue,
    ),
);

export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  (_, { rejectWithValue }) =>
    runRequest(
      () => api.get(API_URLS.notificationsUnreadCount),
      "Failed to load unread count.",
      rejectWithValue,
    ),
);

export const markNotificationRead = createAsyncThunk(
  "notifications/markRead",
  (id, { rejectWithValue }) =>
    runRequest(
      () => api.patch(API_URLS.notificationRead(id)),
      "Failed to mark notification as read.",
      rejectWithValue,
    ),
);

export const dismissNotification = createAsyncThunk(
  "notifications/dismiss",
  (id, { rejectWithValue }) =>
    runRequest(
      () => api.patch(API_URLS.notificationDismiss(id)),
      "Failed to dismiss notification.",
      rejectWithValue,
    ),
);

export const snoozeNotification = createAsyncThunk(
  "notifications/snooze",
  ({ id, duration }, { rejectWithValue }) =>
    runRequest(
      () => api.patch(API_URLS.notificationSnooze(id), { duration }),
      "Failed to snooze notification.",
      rejectWithValue,
    ),
);

export const recordNotificationAction = createAsyncThunk(
  "notifications/recordAction",
  ({ id, action, payload }, { rejectWithValue }) =>
    runRequest(
      () =>
        api.patch(API_URLS.notificationAction(id), {
          action,
          ...(payload && { payload }),
        }),
      "Failed to record notification action.",
      rejectWithValue,
    ),
);

export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllRead",
  (_, { rejectWithValue }) =>
    runRequest(
      () => api.post(API_URLS.notificationsMarkAllRead),
      "Failed to mark all as read.",
      rejectWithValue,
    ),
);

export const clearAllNotifications = createAsyncThunk(
  "notifications/clearAll",
  (_, { rejectWithValue }) =>
    runRequest(
      () => api.delete(API_URLS.notifications),
      "Failed to clear notifications.",
      rejectWithValue,
    ),
);

const replaceItem = (state, item) => {
  if (!item || !item.id) return;
  const index = state.items.findIndex((existing) => existing.id === item.id);
  if (index >= 0) {
    state.items[index] = item;
  }
};

const removeItem = (state, id) => {
  if (!id) return;
  const index = state.items.findIndex((item) => item.id === id);
  if (index < 0) return;
  const wasUnread = !state.items[index].is_read;
  state.items.splice(index, 1);
  if (wasUnread) {
    state.unread = Math.max(0, state.unread - 1);
  }
  state.total = Math.max(0, state.total - 1);
};

const slice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearMutationError(state) {
      state.mutationError = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload || {};
        state.items = Array.isArray(data.items) ? data.items : [];
        state.total = Number(data.total) || 0;
        state.unread = Number(data.unread) || 0;
        state.skip = Number(data.skip) || 0;
        state.limit = Number(data.limit) || state.limit;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load notifications.";
      })

      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unread = Number(action.payload?.unread) || 0;
      })

      .addCase(markNotificationRead.pending, (state, action) => {
        const id = action.meta.arg;
        const item = state.items.find((entry) => entry.id === id);
        if (item && !item.is_read) {
          item.is_read = true;
          item.read_at = new Date().toISOString();
          state.unread = Math.max(0, state.unread - 1);
        }
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        replaceItem(state, action.payload);
      })
      .addCase(markNotificationRead.rejected, (state, action) => {
        state.mutationError =
          action.payload || "Failed to mark notification as read.";
      })

      .addCase(dismissNotification.pending, (state, action) => {
        removeItem(state, action.meta.arg);
      })
      .addCase(dismissNotification.rejected, (state, action) => {
        state.mutationError =
          action.payload || "Failed to dismiss notification.";
      })

      .addCase(snoozeNotification.pending, (state, action) => {
        removeItem(state, action.meta.arg?.id);
      })
      .addCase(snoozeNotification.fulfilled, (state, action) => {
        replaceItem(state, action.payload);
      })
      .addCase(snoozeNotification.rejected, (state, action) => {
        state.mutationError = action.payload || "Failed to snooze.";
      })

      .addCase(recordNotificationAction.pending, (state, action) => {
        const id = action.meta.arg?.id;
        const item = state.items.find((entry) => entry.id === id);
        if (item && !item.is_read) {
          item.is_read = true;
          item.read_at = new Date().toISOString();
          state.unread = Math.max(0, state.unread - 1);
        }
      })
      .addCase(recordNotificationAction.fulfilled, (state, action) => {
        replaceItem(state, action.payload);
      })
      .addCase(recordNotificationAction.rejected, (state, action) => {
        state.mutationError =
          action.payload || "Failed to record action.";
      })

      .addCase(markAllNotificationsRead.pending, (state) => {
        state.items = state.items.map((item) => ({
          ...item,
          is_read: true,
          read_at: item.read_at || new Date().toISOString(),
        }));
        state.unread = 0;
      })
      .addCase(markAllNotificationsRead.rejected, (state, action) => {
        state.mutationError =
          action.payload || "Failed to mark all as read.";
      })

      .addCase(clearAllNotifications.pending, (state) => {
        state.items = [];
        state.total = 0;
        state.unread = 0;
      })
      .addCase(clearAllNotifications.rejected, (state, action) => {
        state.mutationError =
          action.payload || "Failed to clear notifications.";
      });
  },
});

export const { clearMutationError } = slice.actions;

export default slice.reducer;
