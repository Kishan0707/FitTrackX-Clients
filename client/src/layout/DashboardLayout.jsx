import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useRef, useState } from "react";
import BottomNavigation from "../components/BottomNavigation";

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
      className='flex min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white'
      // onTouchStart={handleTouchStart}
      // onTouchEnd={handleTouchEnd}
    >
      <Sidebar setMenuBtn={setMenuBtn} menuBtn={menuBtn} />
      <BottomNavigation className='' />

      <div className='flex-1 flex flex-col min-w-0 overflow-x-hidden'>
        <Navbar setMenuBtn={setMenuBtn} menuBtn={menuBtn} />

        <main className='w-full flex-1 min-w-0 overflow-x-hidden p-6  md:pb-6 pb-36'>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
