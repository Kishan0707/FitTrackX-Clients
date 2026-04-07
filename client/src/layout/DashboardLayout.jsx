import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useRef, useState } from "react";
import BottomNavigation from "../components/BottomNavigation";
// import { useNavigate } from "react-router-dom";

const DashboardLayout = ({ children }) => {
  const [menuBtn, setMenuBtn] = useState(true);
  // const navigate = useNavigate();
  // const startX = useRef(0);
  // const handleTouchStart = (e) => {
  //   startX.current = e.touches[0].clientX;
  // };
  // const handleTouchEnd = (e) => {
  //   const endX = e.changedTouches[0].clientX;
  //   const deltaX = endX - startX.current;
  //   if (deltaX > 0) {
  //     setMenuBtn(true);
  //   } else {
  //     setMenuBtn(false);
  //   }
  // };

  return (
    <div
      className='flex bg-slate-950 text-white min-h-screen'
      // onTouchStart={handleTouchStart}
      // onTouchEnd={handleTouchEnd}
    >
      <Sidebar setMenuBtn={setMenuBtn} menuBtn={menuBtn} />
      <BottomNavigation className='' />

      <div className='flex-1 flex flex-col min-w-0 overflow-x-hidden'>
        <Navbar setMenuBtn={setMenuBtn} menuBtn={menuBtn} />

        <main className='p-6 w-full flex-1 overflow-x-hidden min-w-0 pb-24 md:pb-6'>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
