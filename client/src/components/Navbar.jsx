import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RiMenu2Fill } from "react-icons/ri";
import { FaBell, FaCog, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { MdDarkMode, MdLightMode } from "react-icons/md";

import API from "../services/api";
import { AuthContext } from "../context/authContext";
import { useTheme } from "../context/themeContext";
import NotificationSettings from "./NotificationSettings";

const Navbar = ({ setMenuBtn }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showNotifSettings, setShowNotifSettings] = useState(false);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) return undefined;

    let isMounted = true;

    const fetchUnreadCount = async () => {
      try {
        const response = await API.get("/notifications");
        const notifications = response.data?.data || [];
        const nextUnreadCount = notifications.filter((n) => !n.read).length;
        if (isMounted) setUnreadCount(nextUnreadCount);
      } catch (error) {
        // Keep navbar usable even if notifications are unavailable for a role.
        if (isMounted) setUnreadCount(0);
        console.error("Failed to fetch notification count:", error);
      }
    };

    const handleRefresh = () => fetchUnreadCount();

    fetchUnreadCount();
    const intervalId = window.setInterval(fetchUnreadCount, 15000);
    window.addEventListener("focus", handleRefresh);
    window.addEventListener("notifications-updated", handleRefresh);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener("notifications-updated", handleRefresh);
    };
  }, [user]);

  useEffect(() => {
    if (!isProfileMenuOpen) return undefined;

    const handleOutsideClick = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isProfileMenuOpen]);

  const handleNavigate = (path, options) => {
    setProfileMenuOpen(false);
    navigate(path, options);
  };

  const handleLogout = () => {
    setProfileMenuOpen(false);
    logout();
  };

  const roleLabel =
    user?.role === "admin" ? "Admin"
    : user?.role === "coach" ? "Coach"
    : "Member";

  const initials =
    user?.name ?
      user.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "FX";

  const profileMenuLinks = [
    {
      key: "profile",
      label: "Profile Hub",
      description: "View your bio, stats and contact",
      icon: <FaUserCircle size={16} />,
      onClick: () => handleNavigate("/settings"),
    },
    {
      key: "account",
      label: "Account Settings",
      description: "Control security & notification hooks",
      icon: <FaCog size={16} />,
      onClick: () => handleNavigate("/settings", { state: { tab: "account" } }),
    },
  ];

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? `Good Morning ${"\u2600\uFE0F"}`
    : hour < 18 ? `Good Afternoon ${"\u{1F324}\uFE0F"}`
    : `Good Evening ${"\u{1F319}"}`;

  const notificationsPath =
    user?.role === "coach" ? "/coach/notifications" : "/notifications";
  const isOnNotifications =
    location.pathname === "/coach/notifications" ||
    location.pathname === "/notifications";

  return (
    <div className='flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 transition-colors dark:border-slate-700 dark:bg-slate-900 md:p-4'>
      <div className='flex items-center justify-center gap-3'>
        <button
          className='block rounded p-2 text-slate-900 transition hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800'
          onClick={() => setMenuBtn((prev) => !prev)}
          aria-label='Toggle sidebar'>
          <RiMenu2Fill size={20} />
        </button>
        <h2 className='text-sm text-slate-900 dark:text-white sm:text-base'>
          {greeting} {user?.name}
        </h2>
      </div>

      <div className='flex items-center justify-center gap-3'>
        {user && (
          <>
            <button
              onClick={() => setShowNotifSettings(true)}
              className='rounded-lg border-2 border-slate-200 bg-white p-2 text-slate-900 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 md:p-3'
              title='Notification Settings'
              aria-label='Notification Settings'>
              <FaCog size={18} />
            </button>
            <button
              onClick={() => navigate(notificationsPath)}
              className={`relative rounded-lg border-2 p-2 transition md:p-3 ${
                isOnNotifications ?
                  "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-300"
                : "border-slate-200 bg-white text-slate-900 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
              }`}
              title='Open notifications'
              aria-label='Open notifications'>
              <FaBell size={20} />
              {unreadCount > 0 && (
                <span className='absolute -right-1 -top-1 min-w-[1.25rem] rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-slate-950'>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          </>
        )}

        <button
          onClick={toggleTheme}
          className='hidden rounded-lg border-2 border-slate-200 bg-white p-1 text-slate-900 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 md:flex md:p-3'
          title='Toggle Dark/Light Mode'>
          {theme === "dark" ?
            <MdLightMode size={24} className='text-yellow-400' />
          : <MdDarkMode size={24} className='text-blue-400' />}
        </button>

        <div className='relative flex items-center gap-2' ref={profileMenuRef}>
          <button
            type='button'
            aria-expanded={isProfileMenuOpen}
            className='hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 dark:border-slate-800 dark:bg-gradient-to-br dark:from-slate-950 dark:to-slate-900 dark:text-white dark:shadow-[0_20px_35px_rgba(15,23,42,0.85)] md:flex'
            onClick={() => setProfileMenuOpen((prev) => !prev)}>
            <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 via-rose-500 to-orange-400 text-base font-black tracking-widest text-white shadow-lg shadow-red-950/60'>
              {initials}
            </span>
            <span className='flex flex-col text-left font-semibold'>
              <span className='text-sm'>{user?.name}</span>
              <span className='text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400'>
                {roleLabel}
              </span>
            </span>
          </button>

          <button
            className='flex items-center rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-medium text-slate-900 transition hover:border-red-500 hover:bg-white dark:border-slate-800 dark:bg-slate-900/70 dark:text-white dark:hover:bg-slate-800/80 md:hidden'
            type='button'
            onClick={() => setProfileMenuOpen((prev) => !prev)}
            aria-label='Open profile actions'>
            <span className='flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-red-500 via-rose-500 to-orange-400 text-sm font-black text-white shadow-lg shadow-red-950/60'>
              {initials}
            </span>
          </button>

          {isProfileMenuOpen && (
            <div className='absolute right-0 top-full z-50 mt-3 min-w-[18rem] overflow-hidden rounded-3xl border border-slate-200 bg-white text-sm text-slate-900 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 dark:text-white dark:shadow-[0_30px_50px_rgba(2,6,23,0.5)]'>
              <div className='bg-slate-50 p-4 dark:bg-gradient-to-br dark:from-slate-950/80 dark:via-slate-900 dark:to-slate-950/80'>
                <div className='flex items-center gap-3'>
                  <span className='flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-orange-400 text-lg font-black text-white shadow-lg shadow-red-950/60'>
                    {initials}
                  </span>
                  <div className='truncate'>
                    <p className='text-base font-semibold leading-tight'>
                      {user?.name}
                    </p>
                    <p className='text-[11px] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400'>
                      {roleLabel}
                    </p>
                    {user?.email && (
                      <p className='text-[11px] text-slate-500 dark:text-slate-400'>
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className='space-y-1 border-t border-slate-200 px-3 py-2 dark:border-slate-800'>
                {profileMenuLinks.map((item) => (
                  <button
                    key={item.key}
                    type='button'
                    onClick={item.onClick}
                    className='flex w-full items-center gap-3 rounded-2xl border border-transparent bg-slate-50 px-3 py-2 text-left text-slate-900 transition hover:border-slate-200 hover:bg-slate-100 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-slate-700 dark:hover:bg-slate-900/90'>
                    <span className='text-slate-500 dark:text-slate-400'>
                      {item.icon}
                    </span>
                    <div>
                      <p className='text-sm font-semibold'>{item.label}</p>
                      <p className='text-[11px] text-slate-500 dark:text-slate-400'>
                        {item.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <div className='border-t border-slate-200 px-3 py-3 dark:border-slate-800'>
                <button
                  type='button'
                  onClick={handleLogout}
                  className='flex w-full items-center justify-center gap-2 rounded-2xl border border-red-600 bg-red-500/90 px-3 py-2 text-white transition hover:bg-red-600'>
                  <FaSignOutAlt size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {showNotifSettings && (
        <NotificationSettings onClose={() => setShowNotifSettings(false)} />
      )}
    </div>
  );
};

export default Navbar;
