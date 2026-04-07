import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaAppleAlt,
  FaRobot,
  FaEllipsisH,
  FaPlus,
  FaComments,
} from "react-icons/fa";
import { useContext, useState } from "react";
import { haptic } from "../utils/haptic";
import { getFabAction } from "../utils/fabLogic";
import { AuthContext } from "../context/authContext";
import ProgressRing from "./ProgressRing";

const items = [
  { name: "Body", path: "/dashboard", icon: <FaUser /> },
  { name: "Intake", path: "/add-meal", icon: <FaAppleAlt /> },
  { name: "Chat", path: "/coach/chat", icon: <FaComments />, badge: 3 },
  { name: "AI", path: "/ai", icon: <FaRobot /> },
  { name: "More", action: "more", icon: <FaEllipsisH /> },
];

const BottomNavigation = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);

  const fab = getFabAction(user?.goal, location.pathname);

  return (
    <>
      {/* Bottom Nav */}
      <div className='fixed bottom-0 left-0 right-0 z-50 md:hidden'>
        <div className='relative backdrop-blur-xl bg-white/5 border-t border-white/10'>
          <div className='flex justify-around items-center py-2'>
            {items.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <div
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
                      className='flex flex-col items-center relative'>
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
                        {item.name === "Body" ?
                          <ProgressRing progress={70} />
                        : item.icon}
                      </motion.div>

                      {item.badge && (
                        <span className='absolute top-0 right-2 text-[8px] bg-red-500 px-1 rounded-full'>
                          {item.badge}
                        </span>
                      )}

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

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={() => {
          haptic("heavy");
          navigate(fab.path);
        }}
        className='fixed bottom-16 left-1/2 -translate-x-1/2 z-50 
        bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-full shadow-xl'>
        {fab.icon}
      </motion.button>

      {/* More Sheet */}
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
