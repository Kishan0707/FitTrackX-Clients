import { createContext, useState, useEffect, useCallback } from "react";
import API from "../services/api";
import {
  getActiveToken,
  getActiveUser,
  addSession,
  getAllSessions,
  switchSession,
  removeSession,
  clearAllSessions,
  generateSessionId,
} from "../utils/sessionStorage";

export const AuthContext = createContext();

const getStoredOnboardingFlag = () =>
  localStorage.getItem("onboardingComplete") === "true";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(
    getStoredOnboardingFlag(),
  );
  const [sessions, setSessions] = useState([]);

  const applyOnboardingFlag = useCallback((userData) => {
    if (!userData) {
      setOnboardingComplete(getStoredOnboardingFlag());
      return;
    }

    const storedFlag = getStoredOnboardingFlag();
    const derived =
      typeof userData.onboardingComplete === "boolean" ?
        userData.onboardingComplete
      : storedFlag;

    if (derived) {
      localStorage.setItem("onboardingComplete", "true");
    }

    setOnboardingComplete(derived);
    setUser({
      ...userData,
      onboardingComplete: derived,
    });
  }, []);

  const login = async (data) => {
    const res = await API.post("/auth/login", data);
    const token = res.data.token;

    // First get user profile
    const profileRes = await API.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Then add session to storage
    addSession(profileRes.data.data, token);

    applyOnboardingFlag(profileRes.data.data);

    // Refresh sessions list
    setSessions(getAllSessions());

    return {
      ...profileRes.data.data,
      role: profileRes.data.data.role,
    };
  };

  const register = async (data) => {
    await API.post("/auth/register", data);
  };

  const logout = (sessionId = null) => {
    if (sessionId) {
      // Logout specific session
      removeSession(sessionId);
      setSessions(getAllSessions());

      // If we removed the active session, clear user state
      const activeSession = getActiveUser();
      if (!activeSession) {
        setUser(null);
        setOnboardingComplete(false);
      }
    } else {
      // Logout all sessions
      clearAllSessions();
      setUser(null);
      setOnboardingComplete(false);
      setSessions([]);
    }
  };

  const switchToSession = (sessionId) => {
    try {
      const session = switchSession(sessionId);

      setUser(session.user);

      // 🔥 force axios to use new token
      window.dispatchEvent(new Event("session-changed"));

      setSessions(getAllSessions());

      return session;
    } catch (error) {
      console.error("Failed to switch session:", error);
    }
  };
  const refreshSessions = () => {
    setSessions(getAllSessions());
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = getActiveToken();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await API.get("/auth/me");
        applyOnboardingFlag(res.data.data);
      } catch (err) {
        console.log(err);
        clearAllSessions();
        setUser(null);
        setOnboardingComplete(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    setSessions(getAllSessions());
  }, [applyOnboardingFlag]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        onboardingComplete,
        completeOnboarding: async (payload) => {
          try {
            await API.post("/onboarding/complete", payload);
          } catch (error) {
            console.error("Failed to complete onboarding:", error);
          }

          localStorage.setItem("onboardingComplete", "true");
          setOnboardingComplete(true);
          setUser((prev) =>
            prev ? { ...prev, onboardingComplete: true } : prev,
          );
        },
        sessions,
        switchToSession,
        refreshSessions,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
