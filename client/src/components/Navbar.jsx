import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RiMenu2Fill } from "react-icons/ri";
import { FaBell, FaCog, FaSignOutAlt, FaUserCircle, FaChevronDown, FaExchangeAlt, FaPlus, FaUserMd, FaUserTie, FaUser as FaUserIcon, FaCog as FaAdminCog, FaCheck } from "react-icons/fa";
import { MdDarkMode, MdLightMode } from "react-icons/md";

import API from "../services/api";
import { AuthContext } from "../context/authContext";
import { useTheme } from "../context/themeContext";
import NotificationSettings from "./NotificationSettings";

const roleIcons = {
  doctor: FaUserMd,
  coach: FaUserTie,
  user: FaUserIcon,
  admin: FaAdminCog,
  seller: FaUserIcon,
  affiliate: FaUserIcon,
};

const roleColors = {
  doctor: "from-blue-500 to-cyan-500",
  coach: "from-green-500 to-emerald-500",
  user: "from-orange-500 to-red-500",
  admin: "from-purple-500 to-pink-500",
  seller: "from-yellow-500 to-orange-500",
  affiliate: "from-teal-500 to-cyan-500",
};

const Navbar = ({ setMenuBtn }) => {
  const { user, logout, sessions, switchToSession, refreshSessions } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showNotifSettings, setShowNotifSettings] = useState(false);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);

  const profileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    const fetchUnreadCount = async () => {
      try {
        const response = await API.get("/notifications");
        const notifications = response.data?.data || [];
        const nextUnreadCount = notifications.filter((n) => !n.read).length;
        if (isMounted) setUnreadCount(nextUnreadCount);
      } catch (error) {
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
    if (showNotifSettings) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showNotifSettings]);

  useEffect(() => {
    if (!isProfileMenuOpen) return;

    const handleOutsideClick = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
        setShowAccountSwitcher(false);
        setShowAddAccount(false);
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

  const activeSession = sessions.find((s) => s.isActive);

  const handleSwitch = (sessionId) => {
    const session = switchToSession(sessionId);
    setProfileMenuOpen(false);
    setShowAccountSwitcher(false);

    if (session?.user?.role === "admin") {
      navigate("/admin");
    } else if (session?.user?.role === "coach") {
      navigate("/coach/dashboard");
    } else if (session?.user?.role === "doctor") {
      navigate("/doctor");
    } else {
      navigate("/dashboard");
    }
  };

  const handleLogoutSession = (sessionId, e) => {
    e.stopPropagation();
    logout(sessionId);
    refreshSessions();
  };

  const handleAddAccount = () => {
    setProfileMenuOpen(false);
    localStorage.setItem("addAccountMode", "true");
    window.location.href = "/login";
  };

  const roleLabel =
    user?.role === "admin" ? "Admin"
    : user?.role === "coach" ? "Coach"
    : user?.role === "doctor" ? "Doctor"
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

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? `Good Morning ${"\u2600\uFE0F"}`
    : hour < 18 ? `Good Afternoon ${"\u{1F324}\uFE0F"}`
    : `Good Evening ${"\u{1F319}"}`;

  const notificationsPath =
    user?.role === "coach" ? "/coach/notifications"
    : user?.role === "doctor" ? "/doctor/notifications"
    : "/notifications";
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
            {/* Notification Settings & Bell */}
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

            {/* Profile Button with Dropdown */}
            <div className='relative' ref={profileMenuRef}>
              <button
                onClick={() => {
                  setProfileMenuOpen(!isProfileMenuOpen);
                  setShowAccountSwitcher(false);
                }}
                className='hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 dark:border-slate-800 dark:bg-gradient-to-br dark:from-slate-950 dark:to-slate-900 dark:text-white dark:shadow-[0_20px_35px_rgba(15,23,42,0.85)] md:flex'
                aria-expanded={isProfileMenuOpen}>
                <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 via-rose-500 to-orange-400 text-base font-black tracking-widest text-white shadow-lg shadow-red-950/60'>
                  {initials}
                </span>
                <span className='flex flex-col text-left font-semibold'>
                  <span className='text-sm'>{user?.name}</span>
                  <span className='text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400'>
                    {roleLabel}
                  </span>
                </span>
                <FaChevronDown className={`text-xs transition-transform ${isProfileMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Mobile profile button */}
              <button
                className='flex items-center rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-medium text-slate-900 transition hover:border-red-500 hover:bg-white dark:border-slate-800 dark:bg-slate-900/70 dark:text-white dark:hover:bg-slate-800/80 md:hidden'
                type='button'
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                aria-label='Open profile actions'>
                <span className='flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-red-500 via-rose-500 to-orange-400 text-sm font-black text-white shadow-lg shadow-red-950/60'>
                  {initials}
                </span>
                <FaChevronDown className={`ml-2 text-xs transition-transform ${isProfileMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className='absolute right-0 top-full z-50 mt-3 min-w-[18rem] overflow-hidden rounded-3xl border border-slate-200 bg-white text-sm text-slate-900 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 dark:text-white dark:shadow-[0_30px_50px_rgba(2,6,23,0.5)]'>
                  {/* Header */}
                  <div className='bg-slate-50 p-4 dark:bg-gradient-to-br dark:from-slate-950/80 dark:via-slate-900 dark:to-slate-950/80'>
                    <div className='flex items-center gap-3'>
                      <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 via-rose-500 to-orange-400 text-base font-black tracking-widest text-white shadow-lg shadow-red-950/60'>
                        {initials}
                      </span>
                      <div className='flex flex-col text-left font-semibold'>
                        <span className='text-sm'>{user?.name}</span>
                        <span className='text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400'>
                          {roleLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Account Switcher Section */}
                  {sessions.length >= 1 && (
                    <div className='border-b border-slate-200 dark:border-slate-800'>
                      <button
                        type='button'
                        onClick={() => {
                          setShowAccountSwitcher(!showAccountSwitcher);
                          setShowAddAccount(false);
                        }}
                        className='flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-900/50'>
                        <div className='flex items-center gap-2'>
                          <FaExchangeAlt size={14} className='text-slate-500' />
                          <span className='font-medium'>Switch Account</span>
                        </div>
                        <FaChevronDown className={`text-xs text-slate-400 transition-transform ${showAccountSwitcher ? "rotate-180" : ""}`} />
                      </button>

                      {showAccountSwitcher && (
                        <div className='max-h-48 overflow-y-auto border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/30'>
                          {sessions.map((session) => {
                            const Icon = roleIcons[session.role] || FaUserIcon;
                            const gradient = roleColors[session.role] || "from-slate-500 to-slate-600";
                            return (
                              <div
                                key={session.id}
                                onClick={() => {
                                  if (!session.isActive) {
                                    handleSwitch(session.id);
                                  }
                                }}
                                className={`flex items-center justify-between border-b border-slate-100 px-3 py-2 last:border-0 transition cursor-pointer dark:border-slate-700 ${
                                  session.isActive ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                                }`}>
                                <div className='flex items-center gap-2 min-w-0'>
                                  <div className={`rounded-lg bg-gradient-to-br p-1.5 text-white ${gradient}`}>
                                    <Icon size={12} />
                                  </div>
                                  <div className='min-w-0'>
                                    <p className='truncate text-sm font-medium text-slate-900 dark:text-white'>
                                      {session.user?.name || "Unknown"}
                                    </p>
                                    <p className='truncate text-[11px] text-slate-500 dark:text-slate-400 capitalize'>
                                      {session.role} • {session.user?.email?.split("@")[0] || ""}
                                    </p>
                                  </div>
                                </div>
                                <div className='flex items-center gap-1 shrink-0'>
                                  {session.isActive ? (
                                    <span className='rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-medium text-green-600 dark:text-green-400 flex items-center gap-1'>
                                      <FaCheck size={8} />
                                      Active
                                    </span>
                                  ) : (
                                    <>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSwitch(session.id);
                                        }}
                                        className='rounded-md bg-orange-500/20 px-2 py-1 text-[10px] font-semibold text-orange-600 dark:text-orange-400 hover:bg-orange-500/30'>
                                        Switch
                                      </button>
                                      <button
                                        onClick={(e) => handleLogoutSession(session.id, e)}
                                        className='rounded-md p-1 text-slate-400 hover:bg-red-500/20 hover:text-red-500 transition'
                                        title='Remove account'>
                                        <FaSignOutAlt size={10} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Add Account */}
                      <div className='border-t border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50'>
                        {sessions.length > 0 && (
                          <>
                            <button
                              onClick={() => {
                                setShowAddAccount(!showAddAccount);
                              }}
                              className='mb-2 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-200 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'>
                              <FaPlus size={10} />
                              Add Another Account
                            </button>
                            {showAddAccount && (
                              <div className='rounded-lg bg-slate-100 p-2.5 text-center dark:bg-slate-800'>
                                <p className='mb-2 text-[11px] text-slate-500 dark:text-slate-400'>
                                  You'll be redirected to login. Your current session stays active.
                                </p>
                                <button
                                  onClick={handleAddAccount}
                                  className='w-full rounded-md bg-gradient-to-r from-green-500 to-emerald-600 py-1.5 text-xs font-semibold text-white hover:from-green-600 hover:to-emerald-700'>
                                  Continue to Login
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Profile Links */}
                  <div className='space-y-1 px-3 py-2'>
                    <button
                      type='button'
                      onClick={() => handleNavigate("/settings")}
                      className='flex w-full flex-col items-start rounded-lg px-3 py-2 text-left text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/50'>
                      <div className='flex items-center gap-2'>
                        <FaUserCircle size={16} className='text-slate-500' />
                        <span className='text-sm font-semibold'>Profile Hub</span>
                      </div>
                      <span className='mt-0.5 text-xs text-slate-500 dark:text-slate-400'>View your bio, stats and contact</span>
                    </button>
                    <button
                      type='button'
                      onClick={() => handleNavigate("/settings", { state: { tab: "account" } })}
                      className='flex w-full flex-col items-start rounded-lg px-3 py-2 text-left text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/50'>
                      <div className='flex items-center gap-2'>
                        <FaCog size={16} className='text-slate-500' />
                        <span className='text-sm font-semibold'>Account Settings</span>
                      </div>
                      <span className='mt-0.5 text-xs text-slate-500 dark:text-slate-400'>Control security & notification hooks</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className='border-t border-slate-200 px-3 py-2.5 dark:border-slate-800'>
                    <button
                      type='button'
                      onClick={handleLogout}
                      className='flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-500/20 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/30'>
                      <FaSignOutAlt size={14} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className='hidden rounded-lg border-2 border-slate-200 bg-white p-1 text-slate-900 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 md:flex md:p-3'
          title='Toggle Dark/Light Mode'>
          {theme === "dark" ?
            <MdLightMode size={24} className='text-yellow-400' />
          : <MdDarkMode size={24} className='text-blue-400' />}
        </button>
      </div>
      {showNotifSettings && (
        <NotificationSettings onClose={() => setShowNotifSettings(false)} />
      )}
    </div>
  );
};

export default Navbar;
