import { useEffect, useState } from "react";

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        background: "red",
        color: "white",
        textAlign: "center",
        padding: "10px",
        zIndex: 9999,
      }}>
      ⚠️ You are offline
    </div>
  );
}
