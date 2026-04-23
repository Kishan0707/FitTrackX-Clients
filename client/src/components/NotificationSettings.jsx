/* eslint-disable no-unused-vars */
import { useState } from "react";
import {
  FaBell,
  FaBellSlash,
  FaCamera,
  FaMicrophone,
  FaClipboard,
  FaMobile,
} from "react-icons/fa";
import { MdNotificationAdd, MdVibration } from "react-icons/md";
import { useTheme } from "../context/themeContext";

const NOTIFICATION_CATEGORIES = [
  {
    key: "workout",
    label: "Workout Reminders",
    icon: "💪",
    description: "Daily workout plans and reminders",
  },
  {
    key: "diet",
    label: "Diet Reminders",
    icon: "🍏",
    description: "Meal logs and nutrition tips",
  },
  {
    key: "progress",
    label: "Progress Alerts",
    icon: "📈",
    description: "Weight, strength, and milestone updates",
  },
  {
    key: "coach",
    label: "Coach Messages",
    icon: "🎯",
    description: "Messages from your coach",
  },
  {
    key: "achievements",
    label: "Achievements",
    icon: "🏆",
    description: "Badges and accomplishments",
  },
  {
    key: "promotions",
    label: "Promotions",
    icon: "🛍️",
    description: "Product offers and deals",
  },
];

const PermissionBadge = ({ granted }) => (
  <span
    className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
      granted ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
    }`}>
    {granted ? "Granted" : "Denied"}
  </span>
);

const PermissionCard = ({
  icon,
  title,
  description,
  granted,
  onRequest,
  buttonText = "Enable",
}) => {
  return (
    <div className='flex items-start justify-between rounded-xl border border-slate-700 bg-slate-800/50 p-4 backdrop-blur overflow-y-auto'>
      <div className='flex items-start gap-4'>
        <div className='rounded-lg bg-orange-500/20 p-3 text-orange-400'>
          {icon}
        </div>
        <div>
          <h4 className='font-semibold text-slate-200'>{title}</h4>
          <p className='mt-1 text-sm text-slate-400'>{description}</p>
        </div>
      </div>
      <div className='flex flex-col items-end gap-2'>
        <PermissionBadge granted={granted} />
        {!granted && (
          <button
            onClick={onRequest}
            className='rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600'>
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
};

const NotificationSettings = ({ onClose }) => {
  const { theme } = useTheme();
  const [permissions, setPermissions] = useState({
    notifications: Notification.permission === "granted",
    location: localStorage.getItem("locationPermission") === "granted",
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("notificationPreferences");
    return saved ?
        JSON.parse(saved)
      : Object.fromEntries(
          NOTIFICATION_CATEGORIES.map((cat) => [cat.key, true]),
        );
  });

  const refreshPermissions = () => {
    setPermissions({
      notifications: Notification.permission === "granted",
      location: localStorage.getItem("locationPermission") === "granted",
    });
  };

  const toggleCategory = (key) => {
    setCategories((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem("notificationPreferences", JSON.stringify(updated));
      return updated;
    });
  };

  const bgClass =
    theme === "dark" ?
      "bg-slate-900/95 backdrop-blur-sm border border-slate-700"
    : "bg-white/95 backdrop-blur-sm border border-gray-200";

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 overflow-y-scroll min-h-screen w-full '>
      <div
        className={`w-full max-w-2xl rounded-2xl p-6 overflow-y-scroll min-h-screen mt-36 ${bgClass}`}>
        <div className='mb-6 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='rounded-lg bg-orange-500/20 p-2 text-orange-400'>
              <MdNotificationAdd size={24} />
            </div>
            <h3 className='text-xl font-bold'>Notification Permissions</h3>
          </div>
          <button
            onClick={onClose}
            className='text-2xl leading-none hover:text-orange-500 transition'>
            ×
          </button>
        </div>

        <p className='mb-6 text-sm opacity-70'>
          Enable these permissions for the best FitTrackX experience:
        </p>

        <div className='space-y-4 '>
          <PermissionCard
            icon={<FaBell size={20} />}
            title='Notifications'
            description='Receive workout reminders, progress alerts, and coach messages'
            granted={permissions.notifications}
            onRequest={async () => {
              const { requestPermission } =
                await import("../firebase/notification");
              const granted = await requestPermission();
              refreshPermissions();
            }}
            buttonText='Enable'
          />

          <PermissionCard
            icon={<MdVibration size={20} />}
            title='Vibration'
            description='Haptic feedback on notifications (requires hardware support)'
            granted={"vibrate" in navigator}
            buttonText='Check Device'
          />

          <PermissionCard
            icon={<FaMicrophone size={20} />}
            title='Voice Commands'
            description='Use voice to start workouts, log meals (coming soon)'
            granted={
              "speechRecognition" in window ||
              "webkitSpeechRecognition" in window
            }
            buttonText='Coming Soon'
          />

          <PermissionCard
            icon={<FaCamera size={20} />}
            title='Camera'
            description='Upload progress photos (requires user interaction)'
            granted={false}
            buttonText='Use Upload Button'
          />

          <PermissionCard
            icon={<FaClipboard size={20} />}
            title='Clipboard'
            description='Copy workout/diet plans to clipboard'
            granted={"clipboard" in navigator}
            buttonText='Built-in'
          />
        </div>

        <div className='mt-8 border-t border-slate-700 pt-4'>
          <h4 className='mb-3 font-semibold'>Notification Types</h4>
          <p className='mb-4 text-sm text-slate-400'>
            Choose which notifications you want to receive:
          </p>
          <div className='space-y-2'>
            {NOTIFICATION_CATEGORIES.map((cat) => (
              <label
                key={cat.key}
                className='flex cursor-pointer items-center justify-between rounded-lg border border-slate-700 bg-slate-800/30 p-3 transition hover:bg-slate-800/50'>
                <div className='flex items-center gap-3'>
                  <span className='text-xl'>{cat.icon}</span>
                  <div>
                    <p className='text-sm font-medium text-slate-200'>
                      {cat.label}
                    </p>
                    <p className='text-xs text-slate-400'>{cat.description}</p>
                  </div>
                </div>
                <input
                  type='checkbox'
                  checked={categories[cat.key] ?? true}
                  onChange={() => toggleCategory(cat.key)}
                  className='h-5 w-5 rounded border-gray-300 accent-orange-500'
                />
              </label>
            ))}
          </div>
        </div>

        <div className='mt-8 border-t border-slate-700 pt-4'>
          <h4 className='mb-3 font-semibold'>Geofencing</h4>
          <p className='mb-4 text-sm text-slate-400'>
            Get reminders when you arrive at your gym location.
          </p>
          <PermissionCard
            icon={<span className='text-xl'>📍</span>}
            title='Location Access'
            description='Required for gym arrival/departure detection'
            granted={permissions.location}
            onRequest={async () => {
              const { requestLocationPermission } =
                await import("../firebase/notification");
              const granted = await requestLocationPermission();
              refreshPermissions();
            }}
            buttonText='Enable'
          />
        </div>

        <button
          onClick={onClose}
          className='mt-6 w-full rounded-xl bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600 transition'>
          Done
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
