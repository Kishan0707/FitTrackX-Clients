import { useEffect, useState } from "react";
import { requestPermission } from "./firebase/notification";
import { useTheme } from "./context/themeContext";

export default function InstallButton() {
  const { theme } = useTheme();
  const [prompt, setPrompt] = useState(null);
  const [notifEnabled, setNotifEnabled] = useState(() => {
    return "Notification" in window && Notification.permission === "granted";
  });
  const [showNotifPrompt, setShowNotifPrompt] = useState(true);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installApp = async () => {
    if (!prompt) return;
    prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  };

  const enableNotifications = async () => {
    await requestPermission();
    if ("Notification" in window && Notification.permission === "granted") {
      setNotifEnabled(true);
    }
  };

  return (
    <>
      {prompt && (
        <button
          onClick={installApp}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            padding: "12px 18px",
            background: theme === "dark" ? "#f97316" : "#ea580c",
            color: "white",
            borderRadius: "10px",
            border: "none",
            boxShadow:
              theme === "dark" ?
                "0 4px 12px rgba(249, 115, 22, 0.3)"
              : "0 4px 12px rgba(234, 88, 12, 0.3)",
            transition: "all 0.3s ease",
          }}>
          📲 Install App
        </button>
      )}
      {!notifEnabled && showNotifPrompt && (
        <div
          style={{
            position: "fixed",
            bottom: prompt ? 80 : 20,
            right: 20,
            padding: "12px 18px",
            background: "#3b82f6",
            color: "white",
            borderRadius: "10px",
            border: "none",
            zIndex: "100",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}>
          <button
            onClick={enableNotifications}
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontSize: "16px",
              padding: "0",
            }}>
            🔔 Enable Notifications
          </button>
          <button
            onClick={() => setShowNotifPrompt(false)}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              color: "white",
              cursor: "pointer",
              borderRadius: "5px",
              padding: "4px 8px",
              fontSize: "14px",
              fontWeight: "bold",
            }}>
            ✕
          </button>
        </div>
      )}
    </>
  );
}
