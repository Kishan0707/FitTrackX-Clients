import React, {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AuthContext } from "../context/authContext";
import API from "../services/api";
import { RiMenu2Fill } from "react-icons/ri";
import { FaBell, FaCog, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { useTheme } from "../context/themeContext";
import { useLocation, useNavigate } from "react-router-dom";

// eslint-disable-next-line no-unused-vars
const Navbar = ({ setMenuBtn, menuBtn }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    if (user?.role !== "coach") {
      setUnreadCount(0);
      return;
    }

    let isMounted = true;

    const fetchUnreadCount = async () => {
      try {
        const response = await API.get("/notifications");
        const notifications = response.data?.data || [];
        const nextUnreadCount = notifications.filter(
          (notification) => !notification.read,
        ).length;

        if (isMounted) {
          setUnreadCount(nextUnreadCount);
        }
      } catch (error) {
        console.error("Failed to fetch notification count:", error);
      }
    };

    const handleRefresh = () => {
      fetchUnreadCount();
    };

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
  }, [location.pathname, user?.role]);

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return undefined;
    }

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
    user?.role === "admin"
      ? "Admin"
      : user?.role === "coach"
        ? "Coach"
        : "Member";

  const initials = user?.name
    ? user.name
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
      onClick: () =>
        handleNavigate("/settings", {
          state: { tab: "account" },
        }),
    },
  ];

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning ☀️"
    : hour < 18 ? "Good Afternoon 🌤️"
    : "Good Evening 🌙";
  return (
    <div className='bg-slate-900 flex justify-between items-center md:p-4 px-4 py-2 border-b border-slate-700'>
      <div className='flex items-center justify-center gap-3'>
        <button
          className='p-2 rounded hover:bg-slate-800 transition block text-white'
          onClick={() => setMenuBtn((prev) => !prev)}
          aria-label='Toggle sidebar'>
          <RiMenu2Fill size={20} />
        </button>
        <h2 className='text-sm sm:text-base text-white'>
          {greeting} {user?.name}
        </h2>
      </div>
      <div className='flex items-center justify-center gap-3'>
        {user?.role === "coach" && (
          <button
            onClick={() => navigate("/coach/notifications")}
            className={`relative md:p-3 p-2 rounded-lg transition border-2 ${
              location.pathname === "/coach/notifications" ?
                "border-blue-500 bg-blue-500/10 text-blue-300"
              : "border-slate-600 bg-slate-800 text-white hover:bg-slate-700"
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
        )}

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className='md:p-3 p-1 md:flex hidden bg-slate-800 rounded-lg hover:bg-slate-700 transition border-2 border-slate-600'
          title='Toggle Dark/Light Mode'>
          {theme === "dark" ?
            <MdLightMode size={24} className='text-yellow-400' />
          : <MdDarkMode size={24} className='text-blue-400' />}
        </button>

        <div className='relative flex items-center gap-2' ref={profileMenuRef}>
          <button
            type='button'
            aria-expanded={isProfileMenuOpen}
            className='hidden items-center gap-3 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 to-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-[0_20px_35px_rgba(15,23,42,0.85)] transition hover:border-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 md:flex'
            onClick={() => setProfileMenuOpen((prev) => !prev)}>
            <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 via-rose-500 to-orange-400 text-base font-black tracking-widex text-white shadow-lg shadow-red-950/60'>
              {initials}
            </span>
            <span className='flex flex-col text-left font-semibold text-white'>
              <span className='text-sm'>{user?.name}</span>
              <span className='text-[11px] uppercase tracking-[0.2em] text-slate-400'>
                {roleLabel}
              </span>
            </span>
          </button>

          <button
            className='flex items-center rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm font-medium text-white transition hover:border-red-500 hover:bg-slate-800/80 md:hidden'
            type='button'
            onClick={() => setProfileMenuOpen((prev) => !prev)}
            aria-label='Open profile actions'>
            <span className='flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-red-500 via-rose-500 to-orange-400 text-sm font-black text-white shadow-lg shadow-red-950/60'>
              {initials}
            </span>
          </button>

          {isProfileMenuOpen && (
            <div className='absolute right-0 top-full z-50 mt-3 min-w-[18rem] overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/95 text-sm text-white shadow-[0_30px_50px_rgba(2,6,23,0.5)] backdrop-blur'>
              <div className='bg-gradient-to-br from-slate-950/80 via-slate-900 to-slate-950/80 p-4'>
                <div className='flex items-center gap-3'>
                  <span className='flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-orange-400 text-lg font-black text-white shadow-lg shadow-red-950/60'>
                    {initials}
                  </span>
                  <div className='truncate'>
                    <p className='text-base font-semibold leading-tight text-white'>
                      {user?.name}
                    </p>
                    <p className='text-[11px] uppercase tracking-[0.3em] text-slate-400'>
                      {roleLabel}
                    </p>
                    {user?.email && (
                      <p className='text-[11px] text-slate-400'>{user.email}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className='space-y-1 border-t border-slate-800 px-3 py-2'>
                {profileMenuLinks.map((item) => (
                  <button
                    key={item.key}
                    type='button'
                    onClick={item.onClick}
                    className='flex w-full items-center gap-3 rounded-2xl border border-transparent bg-slate-900/70 px-3 py-2 text-left text-slate-100 transition hover:border-slate-700 hover:bg-slate-900/90'>
                    <span className='text-slate-400'>{item.icon}</span>
                    <div>
                      <p className='text-sm font-semibold text-white'>
                        {item.label}
                      </p>
                      <p className='text-[11px] text-slate-400'>
                        {item.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <div className='border-t border-slate-800 px-3 py-3'>
                <button
                  type='button'
                  onClick={handleLogout}
                  className='flex w-full items-center justify-center gap-2 rounded-2xl border border-red-600 bg-red-500/80 px-3 py-2 text-white transition hover:bg-red-600'>
                  <FaSignOutAlt size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
