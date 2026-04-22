import { motion } from "framer-motion";
import { useLottie } from "lottie-react";

const RoleCard = ({ title, price, animation, onClick }) => {
  const animData = animation.default || animation;
  const { View } = useLottie({ animationData: animData });

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -6 }}
      whileTap={{ scale: 0.95 }}
      className='
      group relative
      bg-white/5 backdrop-blur-xl
      border border-white/10
      rounded-2xl p-6 text-center cursor-pointer
      shadow-[0_0_40px_rgba(0,0,0,0.5)]
      hover:shadow-purple-500/20
      transition-all duration-300
      '
      onClick={onClick}>
      {/* Glow */}
      <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-xl rounded-2xl'></div>

      <div className='relative z-10'>
        {/* Animation */}
        <div className='h-40 flex justify-center '>{View}</div>

        <div className='flex items-center justify-center gap-5'>
          {/* Icon */}
          {/* <div className='text-2xl text-purple-300 mt-2'>{icon}</div> */}
          {/* Title */}
          <h2 className='text-xl md:text-2xl font-semibold mt-2'>{title}</h2>
        </div>

        {/* Price */}
        <p className='text-purple-400 mt-2 font-medium'>{price}</p>
      </div>
    </motion.div>
  );
};

export default RoleCard;
