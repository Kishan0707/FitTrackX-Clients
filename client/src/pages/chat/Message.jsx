// import React, { useEffect, useRef, useState } from "react";
// import DashboardLayout from "../../layout/DashboardLayout";
// import { FaUser } from "react-icons/fa";
// import API from "../../services/api";

// const Message = () => {
//   const [messages, setMessages] = useState([]);
//   const [coach, setCoach] = useState(null);
//   const [text, setText] = useState("");
//   const bottomRef = useRef(null);
//   useEffect(() => {
//     const fetchMessages = async () => {
//       try {
//         const res = await API.get("/messages/all");
//         console.log(res);
//         setCoach(res.data.data);
//       } catch (error) {
//         console.error("Failed to fetch messages:", error);
//       }
//     };
//     fetchMessages();
//   }, []);
//   return (
//     <DashboardLayout>
//       <div className='flex flex-col h-[80vh] bg-slate-900 rounded-xl border border-slate-700'>
//         {/* Header */}
//         <div className='p-4 border-b border-slate-700 flex items-center gap-3'>
//           <div className='w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white'>
//             <FaUser size={20} className='text-white' />
//           </div>
//           <h2>Your coach</h2>
//         </div>
//         {/* message */}
//         <div className='flex-1 overflow-y-auto p-4 space-y-3'>{}</div>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default Message;
import DashboardLayout from "../../layout/DashboardLayout";
import { useEffect, useState, useContext } from "react";
import API from "../../services/api";
import { AuthContext } from "../../context/authContext";
import ChatLayout from "../../components/chat/ChatLayout";

const Message = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoach = async () => {
      try {
        setLoading(true);
        const res = await API.get("/users/me");
        const assignedCoach = res.data.data?.assignedCoach;
        if (assignedCoach) {
          setUsers([assignedCoach]);
        } else {
          console.warn("No assigned coach found");
          setUsers([]);
        }
      } catch (error) {
        console.error("Failed to fetch coach:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCoach();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center h-64'>
          <p>Loading chat...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ChatLayout users={users} isCoach={false} />
    </DashboardLayout>
  );
};

export default Message;
