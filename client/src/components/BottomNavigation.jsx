import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaAppleAlt,
  FaRobot,
  FaEllipsisH,
  FaComments,
} from "react-icons/fa";
import { useContext, useState } from "react";
import { haptic } from "../utils/haptic";
import { getFabAction } from "../utils/fabLogic";
import { AuthContext } from "../context/authContext";

// 🔹 Menus (same as before)
const adminMenu = [
  { name: "Dashboard", path: "/dashboard", icon: <FaUser /> },
  { name: "Add-Diet", path: "/add-meal", icon: <FaAppleAlt /> },
  { name: "Chat", path: "/chat", icon: <FaComments /> },
  { name: "More", action: "more", icon: <FaEllipsisH /> },
];

// 🔥 AI ko bottom nav se hide karo

const coachMenu = [...adminMenu];
const userMenu = [...adminMenu];

const BottomNavigation = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);

  const userRole = user?.role;

  // 🔥 FAB dynamic
  const fab = getFabAction(user?.goal, location.pathname);

  // 🔹 role-based menu
  const menuSection =
    userRole === "admin" ? adminMenu
    : userRole === "coach" ? coachMenu
    : userMenu;

  // 🔥 INSERT FAB IN CENTER (index 2)
  const menuWithFab = [...menuSection];
  menuWithFab.splice(2, 0, {
    name: "FAB",
    isFab: true,
  });

  return (
    <>
      {/* Bottom Nav */}{" "}
      <div className='fixed bottom-0 left-0 right-0 z-50 md:hidden'>
        {" "}
        <div className='relative backdrop-blur-xl bg-white/5 border-t border-white/10 rounded-tl-full rounded-tr-full pr-4 '>
          <div className='grid grid-cols-5 place-content-center translate-x-3 pt-2'>
            {menuWithFab.map((item, index) => {
              const isActive =
                item.path ? location.pathname.startsWith(item.path) : false;

              // 🔥 FAB CENTER ITEM
              if (item.isFab && fab) {
                return (
                  <div
                    key='fab'
                    className='flex flex-col items-center relative'>
                    <div className='-translate-y-12'>
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => {
                          haptic("heavy");
                          navigate(fab?.path);
                        }}
                        className='h-24 w-24 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center justify-center shadow-2xl border-4 border-slate-900'>
                        {fab?.icon || "+"}
                      </motion.button>
                    </div>
                  </div>
                );
              }

              // 🔹 Normal items
              return (
                <div
                  className='flex items-center justify-center text-lg'
                  key={item.name}
                  onClick={() => {
                    if (item.action === "more") {
                      haptic("medium");
                      setShowMore(true);
                    }
                  }}>
                  {item.path ?
                    <NavLink
                      to={item.path}
                      onClick={() => haptic("light")}
                      className='flex flex-col items-center justify-center relative'>
                      {isActive && (
                        <motion.div
                          layoutId='glow'
                          className='absolute -top-2 w-10 h-10 bg-orange-500/20 blur-xl rounded-full'
                        />
                      )}

                      <motion.div
                        whileTap={{ scale: 0.7 }}
                        className={`text-lg ${
                          isActive ? "text-orange-500" : "text-slate-400"
                        }`}>
                        {item.icon}
                      </motion.div>

                      <span className='text-[10px]'>{item.name}</span>
                    </NavLink>
                  : <button className='flex flex-col items-center text-slate-400'>
                      {item.icon}
                      <span className='text-[10px]'>{item.name}</span>
                    </button>
                  }
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* 🔹 MORE SHEET */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className='fixed bottom-0 left-0 right-0 z-50 bg-slate-900 rounded-t-3xl p-6'>
            <div className='flex justify-between mb-4'>
              <h2 className='text-white font-bold'>More</h2>
              <button onClick={() => setShowMore(false)}>✕</button>
            </div>

            <div className='grid grid-cols-3 gap-4 text-center'>
              <button onClick={() => navigate("/settings")}>⚙️</button>
              <button onClick={() => navigate("/plans")}>💎</button>
              <button onClick={() => navigate("/notifications")}>🔔</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BottomNavigation;
