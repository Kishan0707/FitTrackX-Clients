import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/authContext";
import API from "../../services/api";
import socket from "../../socket/socket";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";

const ChatLayout = ({ users, isCoach }) => {
  const { user } = useContext(AuthContext);

  const [selectedUser, setSelectedUser] = useState(isCoach ? null : users?.[0]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const bottomRef = useRef();

  // ✅ LOAD CHAT (COMMON)
  useEffect(() => {
    if (!selectedUser) return;

    API.get(`/messages/${selectedUser._id}`).then((res) => {
      setMessages(res.data.data || []);
    });
  }, [selectedUser]);

  // ✅ SOCKET RECEIVE (FIXED)
  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("receiveMessage");
  }, []);

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
