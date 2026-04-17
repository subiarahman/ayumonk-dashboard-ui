const AUTH_KEY = "isAuthenticated";
const ROLE_KEY = "role";
const TOKEN_KEY = "token";
const USER_KEY = "userProfile";

export const normalizeRole = (role) =>
  String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, "");

export const getRole = () => localStorage.getItem(ROLE_KEY);

export const isAuthenticated = () => localStorage.getItem(AUTH_KEY) === "true";

export const setAuthSession = ({ role, name, email, token, id }) => {
  const normalizedRole = normalizeRole(role);
  const accessToken = token || `fake-jwt-${normalizedRole}-${Date.now()}`;
  localStorage.setItem(AUTH_KEY, "true");
  localStorage.setItem(ROLE_KEY, normalizedRole);
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      id,
      name,
      email,
      role: normalizedRole,
      token: accessToken,
    }),
  );
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getUserProfile = () => {
  const profile = localStorage.getItem(USER_KEY);
  if (!profile) return null;

  try {
    return JSON.parse(profile);
  } catch {
    return null;
  }
};

export const updateStoredProfile = ({ name, email }) => {
  const profile = getUserProfile();
  if (!profile) return;

  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      ...profile,
      name,
      email,
    }),
  );
};
