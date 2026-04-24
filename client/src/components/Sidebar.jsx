/* eslint-disable react-hooks/set-state-in-effect */
import { NavLink } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { RiMenu2Fill } from "react-icons/ri";
import { AuthContext } from "../context/authContext";
import { SIDEBAR } from "../config/sidebarConfig";
import { ROLES } from "../constants/roles";
import { FaChevronDown } from "react-icons/fa";

const Sidebar = ({ menuBtn, setMenuBtn }) => {
  const { user } = useContext(AuthContext);
  const userRole = user?.role || ROLES.USER;
  const isSidebarOpen = !menuBtn;
  const [openSections, setOpenSections] = useState({});

  // Filter items by role and group by section
  const menuSections = SIDEBAR.filter((item) =>
    item.roles.includes(userRole),
  ).reduce((acc, item) => {
    const sec = item.section || "Other";
    if (!acc[sec]) acc[sec] = { title: sec, items: [] };
    acc[sec].items.push(item);
    return acc;
  }, {});
  const sectionsArray = Object.values(menuSections);

  const workspaceLabel =
    userRole === "admin" ? "Admin Console"
    : userRole === "coach" ? "Coach Workspace"
    : userRole === "doctor" ? "Doctor Workspace"
    : "Member Workspace";

  // Mobile body lock
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

  // Open all sections on role change
  useEffect(() => {
    setOpenSections((prev) => {
      const next = {};
      sectionsArray.forEach((section) => {
        if (section.title) next[section.title] = true;
      });
      return { ...prev, ...next };
    });
  }, [userRole]);

  if (!user) return null;

  // Helper to create icon element from icon name string

  return (
    <div
      className={`pb-18 md:h-auto h-auto flex flex-col border-r border-slate-200 bg-gradient-to-b from-white via-slate-50 to-white p-4 transition-all duration-300 overscroll-contain dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950
        ${
          menuBtn ?
            "w-20 -translate-x-full fixed inset-y-0 left-0 z-40 overflow-hidden md:w-20 md:translate-x-0 md:static"
          : "w-72 translate-x-0 fixed inset-y-0 left-0 z-90 overflow-y-auto md:w-64 md:static"
        }`}>
      {/* Logo Card */}
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
            {!menuBtn && (
              <div className='min-w-0'>
                <p className='text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400'>
                  Workspace
                </p>
                <h1 className='truncate text-lg font-semibold text-slate-900 dark:text-white'>
                  FitTrackX
                </h1>
              </div>
            )}
          </div>
        </div>
        {!menuBtn && (
          <div className='mt-3 w-full flex items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 px-14 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-200'>
            {workspaceLabel}
          </div>
        )}
        <button
          className='mt-3 md:hidden flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 text-slate-900 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-white dark:hover:bg-slate-800'
          onClick={() => setMenuBtn((prev) => !prev)}
          aria-label='Toggle sidebar'>
          <RiMenu2Fill size={20} />
        </button>
      </div>

      {/* Menu */}
      <nav className='flex flex-col gap-3 md:text-sm text-xs'>
        {sectionsArray.map((section, sectionIndex) => (
          <div
            key={section.title || `section-${sectionIndex}`}
            className={`flex flex-col gap-2 ${
              !menuBtn && section.title ?
                "rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800/80 dark:bg-slate-950/60 dark:shadow-[0_12px_30px_rgba(2,6,23,0.28)]"
              : ""
            }`}>
            {(() => {
              const isOpen =
                section.title ? (openSections[section.title] ?? true) : true;

              return (
                <>
                  {menuBtn && sectionIndex > 0 && (
                    <div className='mx-2 border-t border-slate-800/80' />
                  )}

                  {!menuBtn && section.title && (
                    <button
                      type='button'
                      aria-expanded={isOpen}
                      onClick={() =>
                        setOpenSections((prev) => ({
                          ...prev,
                          [section.title]: !isOpen,
                        }))
                      }
                      className='flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-left transition-colors hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800/70 dark:bg-slate-900/70 dark:hover:border-slate-700 dark:hover:bg-slate-800/80'>
                      <div className='flex min-w-0 flex-1 items-center justify-center gap-2'>
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
                            isOpen ? "rotate-0" : "-rotate-90"
                          }`}
                        />
                      </span>
                    </button>
                  )}

                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                      menuBtn || isOpen ?
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
                              `group relative flex items-center rounded-2xl border p-3 py-2 transition-all duration-300 overflow-hidden ${
                                menuBtn ? "justify-center" : "gap-3"
                              } ${
                                isActive ?
                                  "border-red-500/20 bg-gradient-to-r from-red-500/20 via-red-500/10 to-transparent text-white shadow-lg shadow-red-950/30"
                                : "border-transparent text-slate-300 hover:border-purple-500/30 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-transparent hover:shadow-lg hover:shadow-purple-500/10"
                              }`
                            }>
                            {({ isActive }) => (
                              <>
                                {/* 🔥 ICON */}
                                <span
                                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-lg transition-all duration-300 ${
                                    isActive ?
                                      "border-red-400/20 bg-red-500/15 text-white"
                                    : "border-slate-800 bg-slate-900/90 text-slate-400 group-hover:border-purple-400 group-hover:text-purple-300 group-hover:scale-110"
                                  }`}>
                                  {(() => {
                                    const Icon = item.icon;
                                    return Icon ? <Icon /> : null;
                                  })()}
                                </span>

                                {/* 🔥 TEXT */}
                                {!menuBtn && (
                                  <span className='flex min-w-0 flex-1 items-center justify-between gap-3 truncate'>
                                    <span className='truncate text-sm font-medium transition-all duration-300 group-hover:text-purple-300 group-hover:translate-x-1'>
                                      {item.name}
                                    </span>

                                    {/* 🔥 ACTIVE DOT */}
                                    {isActive && (
                                      <span className='h-2 w-2 rounded-full bg-red-300 shadow-[0_0_0_4px_rgba(248,113,113,0.12)]' />
                                    )}
                                  </span>
                                )}
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
