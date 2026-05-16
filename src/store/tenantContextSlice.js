import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "activeTenantId";

const readStoredTenantId = () => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEY) || "";
};

const initialState = {
  // For platform admins: the tenant they're currently viewing (companies UUID).
  // For tenant users: ignored; their effective tenant comes from the JWT.
  activeTenantId: readStoredTenantId(),
};

const tenantContextSlice = createSlice({
  name: "tenantContext",
  initialState,
  reducers: {
    setActiveTenantId(state, action) {
      const value = action.payload || "";
      state.activeTenantId = value;
      if (typeof window !== "undefined") {
        if (value) {
          localStorage.setItem(STORAGE_KEY, value);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    },
    clearActiveTenantId(state) {
      state.activeTenantId = "";
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }
    },
  },
});

export const { setActiveTenantId, clearActiveTenantId } =
  tenantContextSlice.actions;

export default tenantContextSlice.reducer;
