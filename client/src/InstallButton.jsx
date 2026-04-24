import { useEffect, useState } from "react";
import { requestPermission } from "./firebase/notification";

export default function InstallButton() {
  const [prompt, setPrompt] = useState(null);
  const [notifEnabled, setNotifEnabled] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Check if notifications already granted
    if (Notification.permission === "granted") {
      setNotifEnabled(true);
    }

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
    if (Notification.permission === "granted") {
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
            background: "#f97316",
            color: "white",
            borderRadius: "10px",
            border: "none",
          }}>
          📲 Install App
        </button>
      )}
      {!notifEnabled && (
        <button
          onClick={enableNotifications}
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
          }}>
          🔔 Enable Notifications
        </button>
      )}
    </>
  );
}
