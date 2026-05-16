const AUTH_KEY = "isAuthenticated";
const ROLE_KEY = "role";
const TOKEN_KEY = "token";
const USER_KEY = "userProfile";
const COMPANY_ID_KEY = "companyId";
const PLATFORM_ADMIN_KEY = "isPlatformAdmin";

const USER_ROLE_NAMES = new Set(["user", "employee"]);
const SUPER_ADMIN_ROLE_NAMES = new Set(["superadmin", "ayumonkadmin"]);

export const normalizeRole = (role) => {
  const cleaned = String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, "");
  if (!cleaned) return "";
  if (USER_ROLE_NAMES.has(cleaned)) return "user";
  if (SUPER_ADMIN_ROLE_NAMES.has(cleaned)) return "superadmin";
  return "admin";
};

export const getRole = () => localStorage.getItem(ROLE_KEY);

export const decodeJwtPayload = (token) => {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded =
      base64 + "===".slice((base64.length + 3) % 4).slice(0, 0);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

export const getIsPlatformAdmin = () =>
  localStorage.getItem(PLATFORM_ADMIN_KEY) === "true";

export const setIsPlatformAdmin = (value) => {
  if (value === true) {
    localStorage.setItem(PLATFORM_ADMIN_KEY, "true");
  } else {
    localStorage.removeItem(PLATFORM_ADMIN_KEY);
  }
};

export const getHomePath = ({ isPlatformAdmin, role } = {}) => {
  if (isPlatformAdmin) return "/super-admin/dashboard";
  if (role === "user") return "/user/dashboard";
  return "/admin/hr-dashboard";
};

// Back-compat shim used by older callers; prefer getHomePath above.
export const getHomePathForRole = (role) =>
  getHomePath({ isPlatformAdmin: role === "superadmin", role });

export const isAuthenticated = () => localStorage.getItem(AUTH_KEY) === "true";

export const setAuthSession = ({ role, name, email, token, id, companyId }) => {
  const normalizedRole = normalizeRole(role);
  const accessToken = token || `fake-jwt-${normalizedRole}-${Date.now()}`;
  localStorage.setItem(AUTH_KEY, "true");
  localStorage.setItem(ROLE_KEY, normalizedRole);
  localStorage.setItem(TOKEN_KEY, accessToken);

  if (companyId !== undefined && companyId !== null && companyId !== "") {
    localStorage.setItem(COMPANY_ID_KEY, String(companyId));
  }

  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      id,
      name,
      email,
      role: normalizedRole,
      token: accessToken,
      company_id:
        companyId !== undefined && companyId !== null && companyId !== ""
          ? String(companyId)
          : undefined,
    }),
  );
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(COMPANY_ID_KEY);
  localStorage.removeItem(PLATFORM_ADMIN_KEY);
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getCompanyId = () =>
  localStorage.getItem(COMPANY_ID_KEY) || getUserProfile()?.company_id || "";

export const setCompanyId = (companyId) => {
  if (companyId === undefined || companyId === null || companyId === "") {
    localStorage.removeItem(COMPANY_ID_KEY);
    return;
  }

  localStorage.setItem(COMPANY_ID_KEY, String(companyId));

  const profile = getUserProfile();
  if (!profile) return;

  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      ...profile,
      company_id: String(companyId),
    }),
  );
};

export const getUserProfile = () => {
  const profile = localStorage.getItem(USER_KEY);
  if (!profile) return null;

  try {
    return JSON.parse(profile);
  } catch {
    return null;
  }
};

export const updateStoredProfile = ({ name, email, companyId }) => {
  const profile = getUserProfile();
  if (!profile) return;

  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      ...profile,
      name,
      email,
      ...(companyId !== undefined ? { company_id: String(companyId) } : {}),
    }),
  );

  if (companyId !== undefined) {
    setCompanyId(companyId);
  }
};
