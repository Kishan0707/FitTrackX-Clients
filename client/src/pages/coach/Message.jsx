import { useContext, useEffect, useRef, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import socket, { connectSocket } from "../../socket/socket";
import { AuthContext } from "../../context/authContext";
import { FaArrowLeft, FaUser } from "react-icons/fa";

const Message = () => {
  const { user } = useContext(AuthContext);
  const [clients, setClients] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [text, setText] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [unread, setUnread] = useState({});
  const [showChat, setShowChat] = useState(false);
  const bottomRef = useRef();
  const typingTimeout = useRef();
  const inputRef = useRef();

  // Load clients + all messages for previews
  useEffect(() => {
    API.get("/coach/clients").then((res) => {
      const data = res.data.data;
      setClients(data);
      const savedId = localStorage.getItem("selectedChatUser");
      if (savedId) {
        const found = data.find((c) => c._id === savedId);
        if (found) {
          setSelectedUser(found);
          setShowChat(true);
        }
      }
    });
    API.get("/messages/all")
      .then((res) => setAllMessages(res.data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    connectSocket(user._id);
    const rejoin = () => socket.emit("join", user._id);
    socket.on("connect", rejoin);
    socket.on("onlineUsers", setOnlineUsers);
    socket.on("typing", (id) => setTypingUser(id));
    socket.on("stopTyping", () => setTypingUser(null));
    socket.on("receiveMessage", (msg) => {
      const senderId = msg.sender?._id || msg.sender;
      setAllMessages((prev) => [...prev, msg]);
      if (senderId === selectedUser?._id) {
        setMessages((prev) => [...prev, msg]);
      } else {
        setUnread((prev) => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1,
        }));
      }
    });
    socket.on("messagesSeen", ({ userId }) => {
      const update = (prev) =>
        prev.map((msg) => {
          const s = msg.sender?._id || msg.sender;
          return s === userId ? { ...msg, seen: true } : msg;
        });
      setMessages(update);
      setAllMessages(update);
    });
    return () => {
      socket.off("connect", rejoin);
      socket.off("onlineUsers");
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("receiveMessage");
      socket.off("messagesSeen");
    };
  }, [user, selectedUser]);

  useEffect(() => {
    if (!selectedUser) return;
    API.get(`/messages/${selectedUser._id}`).then((res) => {
      const msgs = res.data.data || [];
      setMessages(msgs);
      // merge into allMessages
      setAllMessages((prev) => {
        const others = prev.filter((m) => {
          const s = m.sender?._id || m.sender;
          const r = m.receiverId?._id || m.receiverId;
          return s !== selectedUser._id && r !== selectedUser._id;
        });
        return [...others, ...msgs];
      });
    });
  }, [selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [selectedUser]);

  const openChat = (client) => {
    setSelectedUser(client);
    setShowChat(true);
    localStorage.setItem("selectedChatUser", client._id);
    setUnread((prev) => ({ ...prev, [client._id]: 0 }));
    API.patch(`/messages/${client._id}/seen`).catch(() => {});
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    socket.emit("typing", { senderId: user._id, receiverId: selectedUser._id });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stopTyping", {
        senderId: user._id,
        receiverId: selectedUser._id,
      });
    }, 1000);
  };

  const sendMessage = async () => {
    if (!text.trim() || !selectedUser) return;
    setText("");
    const res = await API.post("/messages", {
      receiverId: selectedUser._id,
      message: text,
    });
    const newMsg = res.data.data;
    setMessages((prev) => [...prev, newMsg]);
    setAllMessages((prev) => [...prev, newMsg]);
  };

  const lastMsgByClient = (clientId) =>
    allMessages
      .filter((m) => {
        const s = m.sender?._id || m.sender;
        const r = m.receiverId?._id || m.receiverId;
        return s === clientId || r === clientId;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

  const ClientList = (
    <div className='w-full md:w-1/3 lg:w-1/4 bg-slate-900 border-r border-slate-700 flex flex-col'>
      <div className='p-4 border-b border-slate-700'>
        <h2 className='text-white font-semibold text-lg'>Clients</h2>
      </div>
      <div className='overflow-y-auto flex-1'>
        {clients.map((c) => {
          const lastMsg = lastMsgByClient(c._id);
          return (
            <div
              key={c._id}
              onClick={() => openChat(c)}
              className={`flex items-center gap-3 p-3 cursor-pointer border-b border-slate-800 ${
                selectedUser?._id === c._id ?
                  "bg-slate-700"
                : "hover:bg-slate-800"
              }`}>
              <div className='w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center shrink-0'>
                <FaUser className='text-slate-300 text-sm' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-white text-sm font-medium truncate'>
                  {c.name}
                </p>
                <p className='text-gray-400 text-xs truncate'>
                  {lastMsg?.message || "No messages yet"}
                </p>
                {onlineUsers.includes(c._id) && (
                  <span className='text-green-400 text-xs'>● Online</span>
                )}
              </div>
              {unread[c._id] > 0 && (
                <span className='bg-red-500 text-white text-xs px-2 py-0.5 rounded-full'>
                  {unread[c._id]}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const ChatWindow = (
    <div className='flex-1 flex flex-col min-w-0'>
      {selectedUser ?
        <>
          <div className='p-3 bg-slate-800 flex items-center gap-3 border-b border-slate-700'>
            <button
              className='md:hidden text-slate-400 hover:text-white'
              onClick={() => setShowChat(false)}>
              <FaArrowLeft />
            </button>
            <div className='w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center shrink-0'>
              <FaUser className='text-slate-300 text-xs' />
            </div>
            <div>
              <h2 className='text-white font-semibold text-sm'>
                {selectedUser.name}
              </h2>
              <span
                className={`text-xs ${onlineUsers.includes(selectedUser._id) ? "text-green-400" : "text-gray-400"}`}>
                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
              </span>
            </div>
          </div>

          <div className='flex-1 overflow-y-auto p-4 space-y-2'>
            {messages.map((m, i) => {
              const senderId = m.sender?._id || m.sender;
              const isMine = senderId === user._id;
              return (
                <div
                  key={i}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] px-3 py-2 rounded-2xl text-white text-sm break-words ${
                      isMine ?
                        "bg-blue-500 rounded-br-sm"
                      : "bg-slate-700 rounded-bl-sm"
                    }`}>
                    <p>{m.message}</p>
                    <div className='flex items-center justify-end gap-1 mt-1'>
                      <span className='text-[10px] text-gray-200 opacity-70'>
                        {m.createdAt ?
                          new Date(m.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                      </span>
                      {isMine && (
                        <span
                          className={`text-[10px] ${m.seen ? "text-green-400" : "text-gray-400"}`}>
                          {m.seen ? "✓✓" : "✓"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {typingUser === selectedUser._id && (
              <p className='text-xs text-gray-400 pl-1'>Typing...</p>
            )}
            <div ref={bottomRef} />
          </div>

          <div className='p-3 border-t border-slate-700 flex gap-2'>
            <input
              ref={inputRef}
              value={text}
              onChange={handleTyping}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder='Type a message...'
              className='flex-1 bg-slate-800 text-white rounded-full px-4 py-2 text-sm outline-none'
            />
            <button
              onClick={sendMessage}
              disabled={!text.trim()}
              className={`px-4 py-2 rounded-full text-sm text-white ${
                text.trim() ?
                  "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-600 cursor-not-allowed"
              }`}>
              Send
            </button>
          </div>
        </>
      : <div className='flex-1 flex items-center justify-center text-gray-500 text-sm'>
          Select a client to start chatting
        </div>
      }
    </div>
  );

  return (
    <DashboardLayout>
      <div className='flex md:h-[82vh] h-full bg-slate-900 border border-slate-700 rounded overflow-hidden'>
        <div className='flex w-full md:hidden'>
          {!showChat ? ClientList : ChatWindow}
        </div>
        <div className='hidden md:flex w-full'>
          {ClientList}
          {ChatWindow}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Message;
