import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import {
  FaArrowRight,
  FaBell,
  FaCheck,
  FaInbox,
  FaTrash,
  FaUserMd,
} from "react-icons/fa";

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const typeStyles = {
  workout: "bg-orange-500/15 text-orange-300 border-orange-500/20",
  diet: "bg-green-500/15 text-green-300 border-green-500/20",
  goal: "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
  subscription: "bg-yellow-500/15 text-yellow-300 border-yellow-500/20",
  coach: "bg-blue-500/15 text-blue-300 border-blue-500/20",
  system: "bg-slate-500/15 text-slate-300 border-slate-500/20",
  appointment: "bg-purple-500/15 text-purple-300 border-purple-500/20",
  prescription: "bg-red-500/15 text-red-300 border-red-500/20",
  report: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  patient: "bg-indigo-500/15 text-indigo-300 border-indigo-500/20",
};

const DoctorsNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState("");
  const [markingAll, setMarkingAll] = useState(false);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  const unreadCount = notifications.filter((item) => !item.read).length;

  const showMessage = (message, type = "success") => {
    if (type === "error") {
      setError(message);
      setTimeout(() => setError(""), 3000);
      return;
    }
    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await API.get("/notifications");
      setNotifications(response.data?.data || []);
      setError("");
    } catch (err) {
      console.error(err);
      showMessage("Failed to load notifications.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id, options = {}) => {
    try {
      setBusyId(id);
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((item) => (item._id === id ? { ...item, read: true } : item)),
      );
      if (!options.silent) {
        showMessage("Notification marked as read.");
      }
    } catch (err) {
      console.error(err);
      if (!options.silent) {
        showMessage("Failed to update notification.", "error");
      }
      throw err;
    } finally {
      setBusyId("");
    }
  };

  const markAllAsRead = async () => {
    try {
      setMarkingAll(true);
      await API.put("/notifications/read-all");
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, read: true })),
      );
      showMessage("All notifications marked as read.");
    } catch (err) {
      console.error(err);
      showMessage("Failed to mark all notifications.", "error");
    } finally {
      setMarkingAll(false);
    }
  };

  const deleteNotification = async (id) => {
    try {
      setBusyId(id);
      await API.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((item) => item._id !== id));
      showMessage("Notification deleted.");
    } catch (err) {
      console.error(err);
      showMessage("Failed to delete notification.", "error");
    } finally {
      setBusyId("");
    }
  };

  const handleOpenLink = async (notification) => {
    try {
      if (!notification.read) {
        await markAsRead(notification._id, { silent: true });
      }
    } catch {
      // Keep navigation usable even if the read request fails.
    }

    if (!notification.link) {
      return;
    }

    if (notification.link.startsWith("http")) {
      window.open(notification.link, "_blank", "noopener,noreferrer");
      return;
    }

    navigate(notification.link);
  };

  const filteredNotifications =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.type === filter);

  const uniqueTypes = ["all", ...new Set(notifications.map((n) => n.type))];

  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex min-h-[60vh] items-center justify-center'>
          <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500' />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-6xl space-y-6 p-4 md:p-0'>
        <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3'>
              <FaUserMd className='text-blue-600 dark:text-blue-400' />
              Doctor Notifications
            </h1>
            <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>
              Patient alerts, appointment reminders, prescription updates, and system updates.
            </p>
          </div>
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0 || markingAll}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              unreadCount === 0 || markingAll
                ? "cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}>
            <FaCheck />
            {markingAll ? "Updating..." : "Mark All Read"}
          </button>
        </div>

        {error && (
          <div className='rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-200'>
            {error}
          </div>
        )}
        {success && (
          <div className='rounded-lg border border-green-500/40 bg-green-500/10 p-4 text-green-200'>
            {success}
          </div>
        )}

        {/* Stats */}
        <div className='grid gap-4 md:grid-cols-4'>
          <div className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900'>
            <p className='text-sm text-slate-600 dark:text-slate-400'>Total</p>
            <p className='mt-2 text-3xl font-bold text-slate-900 dark:text-white'>{notifications.length}</p>
          </div>
          <div className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900'>
            <p className='text-sm text-slate-600 dark:text-slate-400'>Unread</p>
            <p className='mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400'>{unreadCount}</p>
          </div>
          <div className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900'>
            <p className='text-sm text-slate-600 dark:text-slate-400'>Read</p>
            <p className='mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400'>{notifications.length - unreadCount}</p>
          </div>
          <div className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900'>
            <p className='text-sm text-slate-600 dark:text-slate-400'>High Priority</p>
            <p className='mt-2 text-3xl font-bold text-red-600 dark:text-red-400'>
              {notifications.filter(n => n.type === "prescription" || n.type === "appointment" || n.type === "report").length}
            </p>
          </div>
        </div>

        {/* Filters */}
        {notifications.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            {uniqueTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  filter === type
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                }`}>
                {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
                {type !== "all" && (
                  <span className='ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs dark:bg-slate-700'>
                    {notifications.filter(n => n.type === type).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {notifications.length === 0 ? (
          <div className='rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900'>
            <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-slate-800 dark:text-blue-400'>
              <FaInbox size={22} />
            </div>
            <h2 className='mt-4 text-xl font-semibold text-slate-900 dark:text-white'>No notifications yet</h2>
            <p className='mt-2 text-sm text-slate-600 dark:text-slate-400'>
              Patient updates, appointment reminders, and system alerts will appear here.
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`rounded-xl border p-5 transition-colors ${
                  notification.read
                    ? "border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
                    : "border-blue-500/30 bg-blue-50 dark:bg-blue-500/10"
                }`}>
                <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                  <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${
                          typeStyles[notification.type] || typeStyles.system
                        }`}>
                        {notification.type}
                      </span>
                      {!notification.read && (
                        <span className='rounded-full bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400'>
                          New
                        </span>
                      )}
                    </div>

                    <div className='mt-3 flex items-start gap-3'>
                      <div className='rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-slate-800 dark:text-blue-400'>
                        <FaBell />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <h2 className='text-lg font-semibold text-slate-900 dark:text-white'>
                          {notification.title}
                        </h2>
                        <p className='mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300'>
                          {notification.message}
                        </p>
                        <p className='mt-3 text-xs text-slate-500'>
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='flex flex-wrap gap-2 lg:justify-end'>
                    {notification.link && (
                      <button
                        onClick={() => handleOpenLink(notification)}
                        className='inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:border-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:bg-transparent dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-800'>
                        Open <FaArrowRight />
                      </button>
                    )}
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        disabled={busyId === notification._id}
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                          busyId === notification._id
                            ? "cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}>
                        <FaCheck /> Read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      disabled={busyId === notification._id}
                      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        busyId === notification._id
                          ? "cursor-not-allowed bg-slate-700 text-slate-400"
                          : "bg-red-500/10 text-red-300 hover:bg-red-500/20"
                      }`}>
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorsNotification;
