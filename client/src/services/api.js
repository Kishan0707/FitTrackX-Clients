import axios from "axios";
import {
  getActiveToken,
  clearAllSessions,
  removeSession,
  getAllSessions,
  switchSession,
  getActiveSessionId,
} from "../utils/sessionStorage";

const DEFAULT_LOCAL_API_URL = "http://localhost:5000/api";

const sanitizeApiUrl = (value) => {
  const trimmedValue = String(value || "").trim();

  if (!trimmedValue) return "";

  const malformedProtocolMatch = trimmedValue.match(
    /^(https?)=(https?:\/\/.+)$/i,
  );
  const normalizedValue =
    malformedProtocolMatch ? malformedProtocolMatch[2] : trimmedValue;

  return normalizedValue.replace(/\/+$/, "");
};

const ensureApiPath = (value) => {
  if (!value) return "";

  // Support both:
  // 1. https://backend.example.com
  // 2. https://backend.example.com/api
  try {
    const parsedUrl = new URL(value);
    const normalizedPath = parsedUrl.pathname.replace(/\/+$/, "");

    if (!normalizedPath || normalizedPath === "/") {
      parsedUrl.pathname = "/api";
    } else if (!normalizedPath.endsWith("/api")) {
      parsedUrl.pathname = `${normalizedPath}/api`;
    }

    return parsedUrl.toString().replace(/\/+$/, "");
  } catch {
    return value;
  }
};

const isLocalHost = () => {
  if (typeof window === "undefined") {
    return import.meta.env.DEV;
  }

  return ["localhost", "127.0.0.1"].includes(window.location.hostname);
};

const resolveApiBaseUrl = () => {
  const localApiUrl = ensureApiPath(
    sanitizeApiUrl(import.meta.env.VITE_API_URL_LOCAL),
  );
  const publicApiUrl = ensureApiPath(
    sanitizeApiUrl(import.meta.env.VITE_API_URL),
  );

  if (isLocalHost()) {
    return localApiUrl || publicApiUrl || DEFAULT_LOCAL_API_URL;
  }

  if (publicApiUrl) {
    try {
      if (typeof window !== "undefined") {
        const apiOrigin = new URL(publicApiUrl).origin;
        if (apiOrigin === window.location.origin) {
          console.warn(
            "VITE_API_URL is pointing to the same origin as the frontend. If your API is hosted separately, update the deployment env var to the backend URL.",
          );
        }
      }
    } catch {
      console.warn(
        "VITE_API_URL could not be parsed. Check your deployment env.",
      );
    }

    return publicApiUrl;
  }

  console.error(
    "Missing VITE_API_URL for production. Falling back to /api on the current origin.",
  );
  return "/api";
};

const API = axios.create({
  baseURL: resolveApiBaseUrl(),
});

// Request interceptor - use active session token
API.interceptors.request.use((req) => {
  const token = getActiveToken();

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});
// 🔥 Session change listener (debug + future use)
window.addEventListener("session-changed", () => {
  console.log("✅ Session updated → new token applied");
});
// Response interceptor - handle 401 errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear active session on auth error
      const active = getActiveSessionId();
      if (active) {
        removeSession(active);
      }

      const remainingSessions = getAllSessions();
      if (remainingSessions.length > 0) {
        // Switch to another session if available
        switchSession(remainingSessions[0].id);
        window.location.href = "/";
      } else {
        // No sessions left, logout completely
        clearAllSessions();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default API;
