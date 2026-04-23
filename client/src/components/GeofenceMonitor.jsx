import { useEffect } from "react";
import { useNotification } from "../context/notificationContext";
import { startGeofenceMonitoring, stopGeofenceMonitoring } from "../utils/geofence";

const API_URL = import.meta.env.VITE_API_URL || "";

const GeofenceMonitor = () => {
  const { showNotification } = useNotification();

  useEffect(() => {
    const hasLocationPermission = localStorage.getItem("locationPermission") === "granted";
    if (!hasLocationPermission) return;

    const handleEnter = (gym) => {
      showNotification(`Welcome to ${gym.name}! 🏋️ Ready to train?`, "info");
      
      fetch(`${API_URL}/api/gym-visit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gymId: gym.id, enteredAt: Date.now() }),
      }).catch(() => {});
    };

    const handleExit = (gym) => {
      showNotification(`See you next time! 💪`, "info");
      fetch(`${API_URL}/api/gym-exit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gymId: gym.id, exitedAt: Date.now() }),
      }).catch(() => {});
    };

    startGeofenceMonitoring(handleEnter, handleExit);

    return () => stopGeofenceMonitoring();
  }, [showNotification]);

  return null;
};

export default GeofenceMonitor;
