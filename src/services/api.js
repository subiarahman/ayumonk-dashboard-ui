import axios from "axios";
import { clearAuthSession, getToken } from "../utils/roleHelper";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const parts = token.split(".");
    if (parts.length < 2) return false;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    if (!payload?.exp) return false;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp <= nowInSeconds;
  } catch {
    return false;
  }
};

const redirectToLogin = () => {
  clearAuthSession();

  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
};

const isNgrokInterstitial = (payload, contentType) =>
  String(contentType || "").includes("text/html") &&
  typeof payload === "string" &&
  payload.includes("ERR_NGROK_6024");

const ngrokError = {
  response: {
    data: {
      message:
        "Ngrok browser warning intercepted the API request. Ensure 'ngrok-skip-browser-warning' header is sent.",
    },
  },
};

const collectMessages = (errors) =>
  Array.isArray(errors)
    ? errors
        .map((item) => {
          const path = Array.isArray(item?.loc) ? item.loc.slice(1).join(".") : "";
          const baseMessage = item?.msg || item?.message || "";
          return path ? `${path}: ${baseMessage}` : baseMessage;
        })
        .filter(Boolean)
    : [];

export const getApiErrorMessage = (error, fallback) => {
  const payload = error?.response?.data || {};
  const detail = payload?.detail;
  const detailObject =
    detail && typeof detail === "object" && !Array.isArray(detail) ? detail : null;

  const validationMessages = [
    ...collectMessages(payload?.errors),
    ...collectMessages(detailObject?.errors),
  ];

  if (validationMessages.length) {
    return validationMessages.join("\n");
  }

  return (
    payload?.message ||
    detailObject?.message ||
    (typeof detail === "string" ? detail : "") ||
    fallback
  );
};

api.interceptors.request.use((config) => {
  const token = getToken();

  config.headers.Accept = "application/json";
  config.headers["ngrok-skip-browser-warning"] = "true";

  if (token) {
    if (isTokenExpired(token)) {
      redirectToLogin();
      return Promise.reject({
        response: {
          data: {
            message: "Session expired. Please login again.",
          },
        },
      });
    }
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    const contentType = response?.headers?.["content-type"] || "";
    if (isNgrokInterstitial(response?.data, contentType)) {
      return Promise.reject(ngrokError);
    }
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      redirectToLogin();
    }

    const contentType = error?.response?.headers?.["content-type"] || "";
    if (isNgrokInterstitial(error?.response?.data, contentType)) {
      return Promise.reject(ngrokError);
    }

    return Promise.reject(error);
  },
);

export default api;
