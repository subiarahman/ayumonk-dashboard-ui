import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "../services/api";
import { API_URLS } from "../services/apiUrls";
import {
  clearAuthSession,
  getCompanyId,
  getRole,
  getToken,
  getUserProfile,
  isAuthenticated,
  normalizeRole,
  setAuthSession,
  setCompanyId,
  updateStoredProfile,
} from "../utils/roleHelper";

const initialState = {
  isAuthenticated: isAuthenticated(),
  role: getRole(),
  token: getToken(),
  user: getUserProfile(),
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await api.post(API_URLS.authLogin, {
        username,
        password,
      });

      const { access_token: accessToken, user } = response.data || {};
      if (!accessToken || !user) {
        return rejectWithValue("Login response is invalid.");
      }

      const normalizedRole = normalizeRole(user.role);
      const payload = {
        token: accessToken,
        role: normalizedRole,
        user: {
          id: user.id,
          name: user.username,
          email: user.email,
          role: normalizedRole,
          company_id: user.company_id || getCompanyId() || "",
        },
      };

      setAuthSession({
        token: payload.token,
        role: payload.role,
        name: payload.user.name,
        email: payload.user.email,
        id: payload.user.id,
        companyId: payload.user.company_id,
      });
      setCompanyId(payload.user.company_id);

      return payload;
    } catch (requestError) {
      return rejectWithValue(
        getApiErrorMessage(
          requestError,
          "Invalid credentials or server unavailable.",
        ),
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      clearAuthSession();
      state.isAuthenticated = false;
      state.role = null;
      state.token = null;
      state.user = null;
      state.loading = false;
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
    setAuthError(state, action) {
      state.error = action.payload;
    },
    updateProfile(state, action) {
      const { name, email, companyId } = action.payload;
      if (!state.user) return;

      state.user = {
        ...state.user,
        name,
        email,
        ...(companyId !== undefined ? { company_id: companyId } : {}),
      };
      updateStoredProfile({
        name,
        email,
        companyId,
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.isAuthenticated = true;
        state.role = action.payload.role;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed.";
      });
  },
});

export const { logout, clearAuthError, setAuthError, updateProfile } = authSlice.actions;
export default authSlice.reducer;
