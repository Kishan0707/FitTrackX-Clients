import { createContext, useContext, useState, useCallback } from "react";

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showNotification = useCallback((message, type = "info", duration = 4000) => {
    setToast({ message, type });
    if (duration > 0) {
      setTimeout(() => setToast(null), duration);
    }
  }, []);

  const hideNotification = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification, toast }}>
      {children}
    </NotificationContext.Provider>
  );
};
