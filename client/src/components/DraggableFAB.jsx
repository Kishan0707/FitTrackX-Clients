import { motion, scale } from "framer-motion";
import { haptic } from "../utils/haptic";
import { useState } from "react";

const DraggableFAB = ({ fab, navigate }) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div
      drag
      dragConstraints={{ left: -150, right: 150, top: -200, bottom: 0 }}
      dragElastic={0.3}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(e, info) => {
        setTimeout(() => setIsDragging(false), 100);
        if (info.point.x > window.innerWidth / 2) {
          info.point.x > window.innerWidth / 2 + 100 && haptic("heavy");
        } else {
          info.point.x < window.innerWidth / 2 - 100 && haptic("heavy");
        }
      }}
      whileDrag={{
        scale: 0.85,
        y: -20,
        boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)",
      }}
      whileTap={{
        scale: 0.85,
        rotate: -5,
      }}
      animate={{
        boxShadow: [
          "0 0 10px rgba(255,100,0,0.3)",
          "0 0 25px rgba(255,100,0,0.6)",
          "0 0 10px rgba(255,100,0,0.3)",
        ],
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 30,
        duration: 2,
        repeat: Infinity,
      }}
      className={`fixed md:hidden bottom-16 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-full shadow-xl cursor-pointer ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}>
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => {
          if (!isDragging) {
            haptic("heavy");
            navigate(fab.path);
          }
        }}
        className='bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-full shadow-xl border border-orange-400/20 backdrop-blur hover:border-white transition-all duration-300'>
        {fab.icon}
      </motion.button>
    </motion.div>
  );
};

export default DraggableFAB;
