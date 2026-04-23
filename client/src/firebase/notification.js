import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase";

const API_URL = import.meta.env.VITE_API_URL || "";
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "";
const SOUND_URL = "/sounds/notification.mp3";

// Play notification sound
export const playSound = () => {
  try {
    const audio = new Audio(SOUND_URL);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch {
    // Audio not supported or blocked
  }
};

// Vibrate on notification
export const vibrate = (pattern = [200, 100, 200]) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

// Speech synthesis
export const speakNotification = (text) => {
  if (!('speechSynthesis' in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.volume = 1;
  utterance.rate = 1;
  utterance.pitch = 1;
  speechSynthesis.speak(utterance);
};

// App badge management
export const setAppBadge = async (count) => {
  try {
    if ('setAppBadge' in navigator) {
      await navigator.setAppBadge(count);
    } else if ('setAppBadge' in navigator.serviceWorker) {
      const registration = await navigator.serviceWorker.ready;
      await registration.setAppBadge(count);
    }
  } catch {
    console.log('Badge not supported');
  }
};

export const clearAppBadge = async () => {
  try {
    if ('clearAppBadge' in navigator) {
      await navigator.clearAppBadge();
    } else if ('setAppBadge' in navigator.serviceWorker) {
      const registration = await navigator.serviceWorker.ready;
      await registration.clearAppBadge();
    }
  } catch {
    console.log('Clear badge not supported');
  }
};

// Request notification permission
export const requestPermission = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission denied");
      return false;
    }

    if (!VAPID_KEY) {
      console.warn("VAPID_KEY not configured");
      return false;
    }

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });

    if (!token) return false;

    console.log("🔥 FCM TOKEN:", token);

    await fetch(`${API_URL}/api/save-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    return true;
  } catch (err) {
    console.error("FCM Error:", err);
    return false;
  }
};

// Location permission (for geofencing)
export const requestLocationPermission = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      () => resolve(true),
      () => resolve(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
};

// Show notification via service worker
const showNotificationViaSW = async (title, options = {}) => {
  try {
    if (!('serviceWorker' in navigator)) return;
    const registration = await navigator.serviceWorker.ready;
    
    const defaultOptions = {
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      vibrate: [200, 100, 200],
      requireInteraction: true,
      actions: [
        { action: "view", title: "View" },
        { action: "dismiss", title: "Dismiss" }
      ],
    };
    
    registration.showNotification(title, { ...defaultOptions, ...options });
  } catch (err) {
    console.error("SW notification error:", err);
  }
};

// Foreground message listener
export const listenNotifications = (showNotification) => {
  if (!messaging) {
    console.warn("Messaging not initialized");
    return;
  }

  onMessage(messaging, (payload) => {
    console.log("Foreground notification:", payload);
    
    const { title, body, image } = payload.notification || {};
    const data = payload.data || {};
    
    if (title) {
      showNotificationViaSW(title, {
        body,
        icon: image,
        data,
        tag: data.tag || title
      });
      
      playSound();
      vibrate();
      speakNotification(`${title}. ${body || ''}`);
      
      if (showNotification) {
        showNotification(body || title, "success");
      }
      
      setAppBadge(1).catch(() => {});
    }
  });
};

// Background sync registration
export const registerBackgroundSync = async () => {
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if ('sync' in registration) {
        await registration.sync.register('sync-offline-actions');
        console.log("Background sync registered");
        return true;
      }
    }
  } catch (err) {
    console.error("Background sync error:", err);
  }
  return false;
};

// Periodic sync registration
export const registerPeriodicSync = async (interval = 24 * 60 * 60 * 1000) => {
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if ('periodicSync' in registration) {
        await registration.periodicSync.register('sync-progress', {
          minInterval: interval
        });
        console.log("Periodic sync registered");
        return true;
      }
    }
  } catch (err) {
    console.error("Periodic sync error:", err);
  }
  return false;
};

