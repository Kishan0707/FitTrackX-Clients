import { NavLink } from "react-router-dom";
import {
  FaChartLine,
  FaDumbbell,
  FaAppleAlt,
  FaChartBar,
  FaRobot,
  FaCrown,
  FaCog,
  FaFileAlt,
  FaClipboardList,
  FaHistory,
  FaChartPie,
  FaUserTie,
  FaComments,
} from "react-icons/fa";
import { GrSchedule } from "react-icons/gr";
import { MdManageAccounts } from "react-icons/md";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/authContext";
import { RiMenu2Fill } from "react-icons/ri";

const Sidebar = ({ menuBtn, setMenuBtn }) => {
  const { user } = useContext(AuthContext);
  let menu = [];
  if (!user) return null;
  if (user.role === "admin") {
    menu = [
      { name: "Dashboard", path: "/admin", icon: <FaChartLine /> },
      {
        name: "User Management",
        path: "/admin/users",
        icon: <MdManageAccounts />,
      },
      {
        name: "Workouts Management",
        path: "/admin/workouts",
        icon: <FaDumbbell />,
      },
      { name: "Diet Management", path: "/admin/diet", icon: <FaAppleAlt /> },
      {
        name: "Coach Management",
        path: "/admin/coaches",
        icon: <FaUserTie />,
      },
      {
        name: "Reports",
        path: "/admin/reports",
        icon: <FaFileAlt />,
      },
      {
        name: "Audit Logs",
        path: "/admin/audit-logs",
        icon: <FaClipboardList />,
      },
      { name: "Settings", path: "/settings", icon: <FaCog /> },
    ];
  } else if (user.role === "coach") {
    menu = [
      { name: "Dashboard", path: "/coachDashboard", icon: <FaChartLine /> },

      { name: "Clients", path: "/coach/clients", icon: <MdManageAccounts /> },

      { name: "Sessions", path: "/coach/sessions", icon: <GrSchedule /> },

      { name: "Workouts", path: "/coach/workouts", icon: <FaDumbbell /> },

      { name: "Diet Plans", path: "/coach/diet", icon: <FaAppleAlt /> },

      { name: "Progress", path: "/coach/progress", icon: <FaChartBar /> },

      { name: "Chat", path: "/coach/chat", icon: <FaComments /> },

      { name: "Reports", path: "/coach/reports", icon: <FaFileAlt /> },

      { name: "AI Trainer", path: "/ai", icon: <FaRobot /> },

      { name: "Plans", path: "/plans", icon: <FaCrown /> },

      { name: "Profile", path: "/coach/profile", icon: <FaUserTie /> },
    ];
  } else {
    menu = [
      { name: "Dashboard", path: "/dashboard", icon: <FaChartLine /> },
      { name: "Add Workouts", path: "/add-workout", icon: <FaDumbbell /> },
      {
        name: "Workout Analytics",
        path: "/workout-analytics",
        icon: <FaChartPie />,
      },
      {
        name: "Workout History",
        path: "/workout-history",
        icon: <FaHistory />,
      },
      { name: "Add-Diet", path: "/add-meal", icon: <FaAppleAlt /> },
      { name: "Progress", path: "/progress", icon: <FaChartBar /> },
      { name: "AI Trainer", path: "/ai", icon: <FaRobot /> },
      { name: "Plans", path: "/plans", icon: <FaCrown /> },
      { name: "Settings", path: "/settings", icon: <FaCog /> },
    ];
  }
  // const menu = [
  //   { name: "Dashboard", path: "/dashboard", icon: <FaChartLine /> },
  //   { name: "Workouts", path: "/workouts", icon: <FaDumbbell /> },
  //   { name: "Add Workouts", path: "/add-workout", icon: <FaDumbbell /> },
  //   { name: "Diet", path: "/diet", icon: <FaAppleAlt /> },
  //   { name: "Add-Diet", path: "/add-meal", icon: <FaAppleAlt /> },
  //   { name: "Progress", path: "/progress", icon: <FaChartBar /> },
  //   { name: "AI Trainer", path: "/ai", icon: <FaRobot /> },
  //   { name: "Plans", path: "/plans", icon: <FaCrown /> },
  // ];
  useEffect(() => {
    if (!menuBtn) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuBtn]);
  return (
    <div
      className={`h-auto overflow-y-auto flex flex-col bg-slate-900 border-r border-slate-700 p-5 transition-all duration-300 
  ${
    menuBtn ?
      "w-20 md:w-20 -translate-x-full md:translate-x-0 fixed top-0 left-0 z-10 md:static"
    : "md:w-64 translate-x-0 absolute z-99 md:static overflow-hidden"
  }`}>
      <div className='flex items-center justify-between mt-5 mb-10'>
        <h1
          className={`text-xl font-bold text-red-500 transition-opacity duration-300 ${
            menuBtn ? " pointer-events-none" : "opacity-100"
          }`}>
          {menuBtn ? "FitX" : "FitTrackX"}
        </h1>
        <button
          className='md:hidden flex p-2 rounded hover:bg-slate-800 transition block text-white'
          onClick={() => setMenuBtn((prev) => !prev)}
          aria-label='Toggle sidebar'>
          <RiMenu2Fill size={20} />
        </button>
      </div>

      <nav className='flex flex-col gap-2 md:text-sm text-xs'>
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            title={item.name}
            className={({ isActive }) =>
              `group flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 ${
                isActive ?
                  "bg-red-500 lg shadow-red-500/30 shadow-lg  text-white"
                : "text-slate-200 hover:bg-slate-800"
              }`
            }>
            <span className='text-lg'>{item.icon}</span>
            <span
              className={`truncate transition-opacity duration-300 ${
                menuBtn ? "opacity-0 w-0" : "opacity-100 w-full"
              }`}>
              {item.name}
            </span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
