import { createContext, useState, useEffect, useCallback } from "react";
import API from "../services/api";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

const getStoredOnboardingFlag = () =>
  localStorage.getItem("onboardingComplete") === "true";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(
    getStoredOnboardingFlag(),
  );

  const applyOnboardingFlag = useCallback((userData) => {
    if (!userData) {
      setOnboardingComplete(getStoredOnboardingFlag());
      return;
    }

    const storedFlag = getStoredOnboardingFlag();
    const derived =
      typeof userData.onboardingComplete === "boolean"
        ? userData.onboardingComplete
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

    localStorage.setItem("token", res.data.token);
    const profileRes = await API.get("/auth/me");
    applyOnboardingFlag(profileRes.data.data);
    return profileRes.data.data;
  };

  const register = async (data) => {
    await API.post("/auth/register", data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("onboardingComplete");
    setOnboardingComplete(false);
    setUser(null);
  };

  const completeOnboarding = async (payload) => {
    try {
      await API.post("/onboarding/complete", payload);
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    }

    localStorage.setItem("onboardingComplete", "true");
    setOnboardingComplete(true);
    setUser((prev) => (prev ? { ...prev, onboardingComplete: true } : prev));
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await API.get("/auth/me");
        applyOnboardingFlag(res.data.data);
      } catch (err) {
        console.log(err);
        localStorage.removeItem("token");
        localStorage.removeItem("onboardingComplete");
        setUser(null);
        setOnboardingComplete(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
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
        completeOnboarding,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
