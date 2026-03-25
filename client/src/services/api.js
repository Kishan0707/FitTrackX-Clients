import axios from "axios";

const DEFAULT_LOCAL_API_URL = "http://localhost:5000/api";

const sanitizeApiUrl = (value) => {
  const trimmedValue = String(value || "").trim();

  if (!trimmedValue) return "";

  const malformedProtocolMatch = trimmedValue.match(
    /^(https?)=(https?:\/\/.+)$/i,
  );
  const normalizedValue = malformedProtocolMatch
    ? malformedProtocolMatch[2]
    : trimmedValue;

  return normalizedValue.replace(/\/+$/, "");
};

const isLocalHost = () => {
  if (typeof window === "undefined") {
    return import.meta.env.DEV;
  }

  return ["localhost", "127.0.0.1"].includes(window.location.hostname);
};

const resolveApiBaseUrl = () => {
  const localApiUrl = sanitizeApiUrl(import.meta.env.VITE_API_URL_LOCAL);
  const publicApiUrl = sanitizeApiUrl(import.meta.env.VITE_API_URL);

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
      console.warn("VITE_API_URL could not be parsed. Check your deployment env.");
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

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export default API;
