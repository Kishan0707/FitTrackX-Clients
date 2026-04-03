import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/authContext";
import API from "../services/api";
import { RiMenu2Fill } from "react-icons/ri";
import { FaBell } from "react-icons/fa";
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
          Welcome, {user?.name}
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
          className='md:p-3 p-1 bg-slate-800 rounded-lg hover:bg-slate-700 transition border-2 border-slate-600'
          title='Toggle Dark/Light Mode'>
          {theme === "dark" ?
            <MdLightMode size={24} className='text-yellow-400' />
          : <MdDarkMode size={24} className='text-blue-400' />}
        </button>

        <button
          className='bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition text-white font-medium'
          onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
