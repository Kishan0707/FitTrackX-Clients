import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/authContext";
import API from "../../services/api";
import socket, { connectSocket } from "../../socket/socket";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";

const ChatLayout = ({ users, isCoach }) => {
  const { user } = useContext(AuthContext);

  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const bottomRef = useRef();

  // ✅ LOAD CHAT (COMMON)
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;
      const res = await API.get(`/messages/${selectedUser._id}`);
      setMessages(res.data.data || []);
    };

    fetchMessages();
  }, [selectedUser]);

  // ✅ SOCKET RECEIVE (FIXED)
  useEffect(() => {
    connectSocket(user._id);
    const handleReceive = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("receiveMessage", handleReceive);

    return () => {
      socket.off("receiveMessage", handleReceive);
    };
  }, [user._id]);

  useEffect(() => {
    if (!users?.length) return;
    if (isCoach) {
      setSelectedUser((prev) => prev || users[0]);
    } else {
      setSelectedUser(users[0]);
    }
  }, [users, isCoach]);

  // ✅ AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ SEND MESSAGE (FIXED)
  const handleSend = async () => {
    if (!text.trim() || !selectedUser) return;

    const res = await API.post("/messages", {
      receiverId: selectedUser._id,
      message: text,
    });
    setMessages((prev) => [...prev, res.data.data]);
    setText("");
  };

  return (
    <div className='flex h-[80vh] bg-slate-900 rounded-xl border border-slate-700'>
      {/* Coach sidebar */}
      {isCoach && <ChatList users={users} onSelectUser={setSelectedUser} />}

      {/* Chat window */}
      <ChatWindow
        selectedUser={selectedUser}
        messages={messages}
        text={text}
        setText={setText}
        handleSend={handleSend}
        user={user}
        bottomRef={bottomRef}
      />
    </div>
  );
};

export default ChatLayout;
