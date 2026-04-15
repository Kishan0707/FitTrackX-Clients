import { NavLink } from "react-router-dom";
import {
  FaChartLine,
  FaDumbbell,
  FaAppleAlt,
  FaChartBar,
  FaRobot,
  FaCrown,
  FaBell,
  FaCog,
  FaFileAlt,
  FaClipboardList,
  FaHistory,
  FaChartPie,
  FaUserTie,
  FaUsers,
  FaComments,
  FaWalking,
  FaChevronDown,
  FaShoppingBag,
  FaHeartbeat,
} from "react-icons/fa";
import { GrSchedule } from "react-icons/gr";
import { MdManageAccounts } from "react-icons/md";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/authContext";
import { RiMenu2Fill } from "react-icons/ri";

export const adminMenuSections = [
  {
    title: "Overview",
    items: [{ name: "Dashboard", path: "/admin", icon: <FaChartLine /> }],
  },
  {
    title: "Management",
    items: [
      {
        name: "User Management",
        path: "/admin/users",
        icon: <MdManageAccounts />,
      },
      {
        name: "Coach Management",
        path: "/admin/coaches",
        icon: <FaUserTie />,
      },
    ],
  },
  {
    title: "Content",
    items: [
      {
        name: "Workouts Management",
        path: "/admin/workouts",
        icon: <FaDumbbell />,
      },
      {
        name: "Diet Management",
        path: "/admin/diet",
        icon: <FaAppleAlt />,
      },
      {
        name: "Product Requests",
        path: "/admin/products",
        icon: <FaShoppingBag />,
      },
    ],
  },
  {
    title: "Insights",
    items: [
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
    ],
  },
  {
    title: "Account",
    items: [{ name: "Settings", path: "/settings", icon: <FaCog /> }],
  },
];

export const coachMenuSections = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", path: "/coachDashboard", icon: <FaChartLine /> },
    ],
  },
  {
    title: "Clients",
    items: [
      { name: "Clients", path: "/coach/clients", icon: <MdManageAccounts /> },
      { name: "Members", path: "/coach/members", icon: <FaUsers /> },
    ],
  },
  {
    title: "Training",
    items: [
      { name: "Workouts", path: "/coach/workouts", icon: <FaDumbbell /> },
      { name: "Diet Plans", path: "/coach/diet", icon: <FaAppleAlt /> },
      { name: "Sessions", path: "/coach/sessions", icon: <GrSchedule /> },
    ],
  },
  {
    title: "Tracking",
    items: [
      { name: "Progress", path: "/coach/progress", icon: <FaChartBar /> },
      { name: "Steps", path: "/coach/steps", icon: <FaWalking /> },
    ],
  },
  {
    title: "Communication",
    items: [
      { name: "Chat", path: "/coach/chat", icon: <FaComments /> },
      {
        name: "Notifications",
        path: "/notifications",
        icon: <FaBell />,
      },
    ],
  },
  {
    title: "Tools",
    items: [
      { name: "AI Trainer", path: "/coach/ai", icon: <FaRobot /> },
      { name: "Reports", path: "/coach/reports", icon: <FaFileAlt /> },
      { name: "Products", path: "/products", icon: <FaShoppingBag /> },
    ],
  },
  {
    title: "Business",
    items: [{ name: "Plans", path: "/coach/plans", icon: <FaCrown /> }],
  },
  {
    title: "Account",
    items: [{ name: "Profile", path: "/settings", icon: <FaUserTie /> }],
  },
];

export const userMenuSections = [
  {
    title: "Overview",
    items: [{ name: "Dashboard", path: "/dashboard", icon: <FaChartLine /> }],
  },
  {
    title: "Workouts",
    items: [
      { name: "Add Workouts", path: "/workouts", icon: <FaDumbbell /> },
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
    ],
  },
  {
    title: "Nutrition",
    items: [{ name: "Add-Diet", path: "/add-meal", icon: <FaAppleAlt /> }],
  },
  {
    title: "Communication",
    items: [
      { name: "Chat", path: "/chat", icon: <FaComments /> },
      {
        name: "Notifications",
        path: "/coach/notifications",
        icon: <FaBell />,
      },
    ],
  },
  {
    title: "Tracking",
    items: [
      { name: "Progress", path: "/progress", icon: <FaChartBar /> },
      { name: "Steps", path: "/steps", icon: <FaWalking /> },
    ],
  },
  {
    title: "Tools",
    items: [
      { name: "AI Trainer", path: "/ai", icon: <FaRobot /> },
      { name: "Products", path: "/products", icon: <FaShoppingBag /> },
    ],
  },
  {
    title: "Wellness",
    items: [
      { name: "Health Tips", path: "/health-tips", icon: <FaHeartbeat /> },
    ],
  },
  {
    title: "Membership",
    items: [{ name: "Plans", path: "/plans", icon: <FaCrown /> }],
  },
  {
    title: "Account",
    items: [{ name: "Settings", path: "/settings", icon: <FaCog /> }],
  },
];

const getInitialOpenSections = (sections) =>
  sections.reduce((acc, section) => {
    if (section.title) {
      acc[section.title] = true;
    }

    return acc;
  }, {});

const getWorkspaceLabel = (role) => {
  if (role === "admin") return "Admin Console";
  if (role === "coach") return "Coach Workspace";
  return "Member Workspace";
};

const Sidebar = ({ menuBtn, setMenuBtn }) => {
  const { user } = useContext(AuthContext);
  const userRole = user?.role;
  const isSidebarOpen = !menuBtn;
  const [openSections, setOpenSections] = useState({});
  const workspaceLabel = getWorkspaceLabel(userRole);
  let menuSections = [];
  if (userRole === "admin") {
    menuSections = adminMenuSections;
  } else if (userRole === "coach") {
    menuSections = coachMenuSections;
  } else {
    menuSections = userMenuSections;
  }
  useEffect(() => {
    const syncBodyOverflow = () => {
      const shouldLockBody = isSidebarOpen && window.innerWidth < 768;
      document.body.style.overflow = shouldLockBody ? "hidden" : "auto";
    };

    syncBodyOverflow();
    window.addEventListener("resize", syncBodyOverflow);

    return () => {
      window.removeEventListener("resize", syncBodyOverflow);
      document.body.style.overflow = "auto";
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    setOpenSections((prev) => {
      const defaultState = getInitialOpenSections(menuSections);
      const nextState = {};

      Object.keys(defaultState).forEach((title) => {
        nextState[title] = prev[title] ?? true;
      });

      return nextState;
    });
  }, [userRole]);

  if (!user) return null;

  return (
    <div
      className={`pb-18 md:h-auto h-auto flex flex-col border-r border-slate-200 bg-gradient-to-b from-white via-slate-50 to-white p-4 transition-all duration-300 overscroll-contain dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950
  ${
    menuBtn ?
      "w-20 -translate-x-full fixed inset-y-0 left-0 z-40 overflow-hidden md:w-20 md:translate-x-0 md:static "
    : "w-72 translate-x-0 fixed inset-y-0 left-0 z-90 overflow-y-auto md:w-64 md:static"
  }`}>
      <div
        className={`mb-6 rounded-3xl border border-slate-200 bg-white shadow-sm backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/70 dark:shadow-[0_20px_45px_rgba(2,6,23,0.45)] ${
          menuBtn ? "p-2" : "p-4"
        }`}>
        <div className='flex items-start justify-between gap-3'>
          <div
            className={`flex min-w-0 flex-1 ${
              menuBtn ? "items-center justify-center" : "items-start gap-3"
            }`}>
            <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-orange-400 text-sm font-black tracking-[0.18em] text-white shadow-lg shadow-red-950/50'>
              FX
            </div>
            {!menuBtn ?
              <div className='min-w-0'>
                <p className='text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400'>
                  Workspace
                </p>
                <h1 className='truncate text-lg font-semibold text-slate-900 dark:text-white'>
                  FitTrackX
                </h1>
                {/*  */}
              </div>
            : null}
          </div>
        </div>
        {/*  */}
        {!menuBtn ?
          <div className='mt-3 w-full flex items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 px-14 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-200'>
            {workspaceLabel}
          </div>
        : null}
        <button
          className='mt-3 md:hidden flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 text-slate-900 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-white dark:hover:bg-slate-800'
          onClick={() => setMenuBtn((prev) => !prev)}
          aria-label='Toggle sidebar'>
          <RiMenu2Fill size={20} />
        </button>
      </div>

      <nav className='flex flex-col  gap-3 md:text-sm text-xs'>
        {menuSections.map((section, sectionIndex) => (
          <div
            key={section.title || `section-${sectionIndex}`}
            className={`flex flex-col gap-2 ${
              !menuBtn && section.title ?
                "rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800/80 dark:bg-slate-950/60 dark:shadow-[0_12px_30px_rgba(2,6,23,0.28)]"
              : ""
            }`}>
            {(() => {
              const isSectionOpen =
                section.title ? (openSections[section.title] ?? true) : true;

              return (
                <>
                  {menuBtn && sectionIndex > 0 ?
                    <div className='mx-2 border-t border-slate-800/80' />
                  : null}

                  {!menuBtn && section.title ?
                    <button
                      type='button'
                      aria-expanded={isSectionOpen}
                      onClick={() =>
                        setOpenSections((prev) => ({
                          ...prev,
                          [section.title]: !isSectionOpen,
                        }))
                      }
                      className='flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-left transition-colors hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800/70 dark:bg-slate-900/70 dark:hover:border-slate-700 dark:hover:bg-slate-800/80'>
                      <div className='flex  min-w-0 flex-1 items-center justify-center gap-2'>
                        <span className='truncate text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400'>
                          {section.title}
                        </span>
                        <span className='rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-950'>
                          {section.items.length}
                        </span>
                      </div>
                      <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 dark:bg-slate-950 dark:text-slate-400'>
                        <FaChevronDown
                          className={`text-[10px] transition-transform duration-200 ${
                            isSectionOpen ? "rotate-0" : "-rotate-90"
                          }`}
                        />
                      </span>
                    </button>
                  : null}

                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                      menuBtn || isSectionOpen ?
                        "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-70"
                    }`}>
                    <div className='overflow-hidden'>
                      <div
                        className={`flex flex-col ${
                          menuBtn ? "gap-2" : "gap-1 pt-1"
                        }`}>
                        {section.items.map((item) => (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            end
                            title={item.name}
                            onClick={() => {
                              if (window.innerWidth < 768) {
                                setMenuBtn(true);
                              }
                            }}
                            className={({ isActive }) =>
                              `group flex items-center rounded-2xl border p-3 py-1 transition-all duration-200 ${
                                menuBtn ? "justify-center gap-0 p-3" : "gap-3"
                              } ${
                                isActive ?
                                  "border-red-500/20 bg-gradient-to-r from-red-500/20 via-red-500/10 to-transparent text-white shadow-lg shadow-red-950/30"
                                : "border-transparent text-slate-300 hover:border-slate-800 hover:bg-slate-800/70 hover:text-white"
                              }`
                            }>
                            {({ isActive }) => (
                              <>
                                <span
                                  className={`flex h-10 w-10 leading-10 shrink-0 duration-200 items-center justify-center rounded-xl border text-lg transition-colors ${
                                    isActive ?
                                      "border-red-400/20 bg-red-500/15 text-white"
                                    : "border-slate-800 bg-slate-900/90 text-slate-400 group-hover:border-slate-700 group-hover:text-slate-200"
                                  }`}>
                                  {item.icon}
                                </span>
                                {!menuBtn ?
                                  <span className='flex min-w-0 flex-1 items-center justify-between gap-3 truncate transition-opacity duration-300 opacity-100'>
                                    <span className='truncate text-sm font-medium'>
                                      {item.name}
                                    </span>
                                    {isActive ?
                                      <span className='h-2 w-2 rounded-full bg-red-300 shadow-[0_0_0_4px_rgba(248,113,113,0.12)]' />
                                    : null}
                                  </span>
                                : null}
                              </>
                            )}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
