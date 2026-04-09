import { io } from "socket.io-client";

const normalizeSocketUrl = () => {
  const raw = import.meta.env.VITE_API_URL_LOCAL;
  if (!raw) {
    return "http://localhost:5000";
  }

  try {
    const parsed = new URL(raw);
    if (parsed.pathname.endsWith("/api")) {
      parsed.pathname = parsed.pathname.replace(/\/api$/, "");
    }
    return parsed.origin + parsed.pathname.replace(/\/$/, "");
  } catch {
    return raw.endsWith("/api") ? raw.replace(/\/api$/, "") : raw;
  }
};

const socket = io(normalizeSocketUrl(), {
  autoConnect: false,
});

export const connectSocket = (userId) => {
  if (!socket.connected) {
    socket.connect();
    socket.emit("join", userId);
  }
};

export default socket;
