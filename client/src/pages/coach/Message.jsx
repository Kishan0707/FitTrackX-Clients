import { useContext, useEffect, useRef, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import socket, { connectSocket } from "../../socket/socket";
import { AuthContext } from "../../context/authContext";
import { FaArrowLeft, FaPaperPlane, FaSearch, FaUser } from "react-icons/fa";

const formatTime = (value) => {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getPreviewText = (message) => {
  if (!message) {
    return "No messages yet";
  }

  if (message.length <= 48) {
    return message;
  }

  return `${message.slice(0, 48)}...`;
};

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
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const bottomRef = useRef();
  const typingTimeout = useRef();
  const inputRef = useRef();

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);

      try {
        const [clientsRes, allMessagesRes] = await Promise.all([
          API.get("/coach/clients"),
          API.get("/messages/all").catch(() => ({ data: { data: [] } })),
        ]);

        if (!isMounted) {
          return;
        }

        const clientsData = clientsRes.data?.data || [];
        setClients(clientsData);
        setAllMessages(allMessagesRes.data?.data || []);
        setError("");

        const savedId = localStorage.getItem("selectedChatUser");
        if (savedId) {
          const found = clientsData.find((client) => client._id === savedId);

          if (found) {
            setSelectedUser(found);
            setShowChat(true);
          } else {
            localStorage.removeItem("selectedChatUser");
          }
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError("Failed to load chat clients.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    connectSocket(user._id);

    const rejoin = () => socket.emit("join", user._id);
    const handleTyping = (id) => setTypingUser(id);
    const handleStopTyping = () => setTypingUser(null);
    const handleReceiveMessage = (message) => {
      const senderId = message.sender?._id || message.sender;

      setAllMessages((prev) => [...prev, message]);

      if (senderId === selectedUser?._id) {
        setMessages((prev) => [...prev, message]);
      } else {
        setUnread((prev) => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1,
        }));
      }
    };
    const handleMessagesSeen = ({ userId }) => {
      const updateMessages = (prev) =>
        prev.map((message) => {
          const senderId = message.sender?._id || message.sender;
          return senderId === userId ? { ...message, seen: true } : message;
        });

      setMessages(updateMessages);
      setAllMessages(updateMessages);
    };

    socket.on("connect", rejoin);
    socket.on("onlineUsers", setOnlineUsers);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messagesSeen", handleMessagesSeen);

    return () => {
      socket.off("connect", rejoin);
      socket.off("onlineUsers", setOnlineUsers);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messagesSeen", handleMessagesSeen);
    };
  }, [selectedUser, user]);

  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
      return;
    }

    let isMounted = true;

    API.get(`/messages/${selectedUser._id}`)
      .then((res) => {
        if (!isMounted) {
          return;
        }

        const nextMessages = res.data?.data || [];
        setMessages(nextMessages);
        setAllMessages((prev) => {
          const otherMessages = prev.filter((message) => {
            const senderId = message.sender?._id || message.sender;
            const receiverId = message.receiverId?._id || message.receiverId;
            return (
              senderId !== selectedUser._id && receiverId !== selectedUser._id
            );
          });

          return [...otherMessages, ...nextMessages];
        });
        setError("");
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) {
          setError("Failed to load chat history.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [selectedUser]);

  useEffect(() => {
    return () => {
      clearTimeout(typingTimeout.current);
    };
  }, []);

  const openChat = (client) => {
    setSelectedUser(client);
    setShowChat(true);
    localStorage.setItem("selectedChatUser", client._id);
    setUnread((prev) => ({ ...prev, [client._id]: 0 }));
    API.patch(`/messages/${client._id}/seen`).catch(() => {});
  };

  const handleTyping = (event) => {
    const nextValue = event.target.value;
    setText(nextValue);

    if (!selectedUser || !user) {
      return;
    }

    socket.emit("typing", {
      senderId: user._id,
      receiverId: selectedUser._id,
    });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stopTyping", {
        senderId: user._id,
        receiverId: selectedUser._id,
      });
    }, 1000);
  };

  const sendMessage = async () => {
    const messageText = text.trim();
    if (!messageText || !selectedUser || sending) {
      return;
    }

    try {
      setSending(true);
      setText("");
      const res = await API.post("/messages", {
        receiverId: selectedUser._id,
        message: messageText,
      });
      const newMessage = res.data?.data;

      if (newMessage) {
        setMessages((prev) => [...prev, newMessage]);
        setAllMessages((prev) => [...prev, newMessage]);
      }
      setError("");
    } catch (err) {
      console.error(err);
      setText(messageText);
      setError("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const lastMsgByClient = (clientId) =>
    allMessages
      .filter((message) => {
        const senderId = message.sender?._id || message.sender;
        const receiverId = message.receiverId?._id || message.receiverId;
        return senderId === clientId || receiverId === clientId;
      })
      .sort(
        (left, right) => new Date(right.createdAt) - new Date(left.createdAt),
      )[0];

  const filteredClients = clients.filter((client) =>
    client.name?.toLowerCase().includes(search.toLowerCase().trim()),
  );

  const ClientList = (
    <div className='flex h-full min-h-0 w-full flex-col border-r border-slate-700 bg-slate-900 md:w-1/3 lg:w-1/4'>
      <div className='border-b border-slate-700 p-4'>
        <h1 className='text-lg font-semibold text-white'>Coach Chat</h1>
        <p className='mt-1 text-sm text-slate-400'>
          Clients ke saath direct conversation yahin manage karo.
        </p>

        <div className='relative mt-4'>
          <FaSearch className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500' />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder='Search clients'
            className='w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-blue-500'
          />
        </div>
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto'>
        {loading ?
          <div className='flex h-40 items-center justify-center text-sm text-slate-400'>
            Loading chats...
          </div>
        : filteredClients.length === 0 ?
          <div className='p-6 text-center text-sm text-slate-400'>
            {clients.length === 0 ?
              "No clients available for chat yet."
            : "No client matched your search."}
          </div>
        : filteredClients.map((client) => {
            const lastMessage = lastMsgByClient(client._id);
            const isSelected = selectedUser?._id === client._id;
            const isOnline = onlineUsers.includes(client._id);

            return (
              <button
                key={client._id}
                type='button'
                onClick={() => openChat(client)}
                className={`flex w-full items-start gap-3 border-b border-slate-800 p-4 text-left transition-colors ${
                  isSelected ? "bg-slate-800" : "hover:bg-slate-800/70"
                }`}>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-700'>
                  <FaUser className='text-sm text-slate-300' />
                </div>

                <div className='min-w-0 flex-1'>
                  <div className='flex items-center justify-between gap-2'>
                    <p className='truncate text-sm font-medium text-white'>
                      {client.name}
                    </p>
                    {lastMessage?.createdAt && (
                      <span className='shrink-0 text-[11px] text-slate-500'>
                        {formatTime(lastMessage.createdAt)}
                      </span>
                    )}
                  </div>

                  <p className='mt-1 truncate text-xs text-slate-400'>
                    {getPreviewText(lastMessage?.message)}
                  </p>

                  <div className='mt-2 flex items-center gap-2'>
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isOnline ? "bg-green-400" : "bg-slate-500"
                      }`}
                    />
                    <span
                      className={`text-[11px] ${
                        isOnline ? "text-green-400" : "text-slate-500"
                      }`}>
                      {isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>

                {unread[client._id] > 0 && (
                  <span className='rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white'>
                    {unread[client._id]}
                  </span>
                )}
              </button>
            );
          })
        }
      </div>
    </div>
  );

  const ChatWindow = (
    <div className='flex h-full min-h-0 min-w-0 flex-1 flex-col'>
      {selectedUser ?
        <>
          <div className='shrink-0 border-b border-slate-700 bg-slate-800 p-4'>
            <div className='flex items-center gap-3'>
              <button
                type='button'
                className='text-slate-400 transition-colors hover:text-white md:hidden'
                onClick={() => setShowChat(false)}
                aria-label='Back to client list'>
                <FaArrowLeft />
              </button>

              <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-700'>
                <FaUser className='text-xs text-slate-300' />
              </div>

              <div className='min-w-0'>
                <h2 className='truncate text-sm font-semibold text-white'>
                  {selectedUser.name}
                </h2>
                <p
                  className={`text-xs ${
                    onlineUsers.includes(selectedUser._id) ? "text-green-400"
                    : "text-slate-400"
                  }`}>
                  {onlineUsers.includes(selectedUser._id) ?
                    "Online now"
                  : "Currently offline"}
                </p>
              </div>
            </div>
          </div>

          <div className='min-h-0 flex-1 overflow-y-auto bg-slate-950/30 p-4'>
            {messages.length === 0 ?
              <div className='flex h-full items-center justify-center text-center text-sm text-slate-400'>
                <div>
                  <p className='font-medium text-slate-300'>No messages yet</p>
                  <p className='mt-1'>
                    Conversation start karne ke liye neeche se message bhejo.
                  </p>
                </div>
              </div>
            : <div className='space-y-3'>
                {messages.map((message, index) => {
                  const senderId = message.sender?._id || message.sender;
                  const isMine = senderId === user?._id;

                  return (
                    <div
                      key={message._id || `${message.createdAt}-${index}`}
                      className={`flex ${
                        isMine ? "justify-end" : "justify-start"
                      }`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm text-white shadow-sm ${
                          isMine ?
                            "rounded-br-sm bg-blue-500"
                          : "rounded-bl-sm bg-slate-700"
                        }`}>
                        <p className='break-words leading-6'>
                          {message.message}
                        </p>
                        <div className='mt-2 flex items-center justify-end gap-2 text-[10px] uppercase tracking-wide text-slate-200/80'>
                          <span>{formatTime(message.createdAt)}</span>
                          {isMine && (
                            <span>{message.seen ? "Seen" : "Sent"}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            }

            {typingUser === selectedUser._id && (
              <div className='mt-3 inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300'>
                {selectedUser.name} is typing...
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className='shrink-0 border-t border-slate-700 bg-slate-900 p-3'>
            <div className='flex gap-2'>
              <input
                ref={inputRef}
                value={text}
                onChange={handleTyping}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={`Message ${selectedUser.name}`}
                className='flex-1 rounded-full bg-slate-800 px-4 py-2 text-sm text-white outline-none ring-1 ring-slate-700 focus:ring-blue-500'
              />
              <button
                type='button'
                onClick={sendMessage}
                disabled={!text.trim() || sending}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
                  !text.trim() || sending ?
                    "cursor-not-allowed bg-slate-700 text-slate-400"
                  : "bg-blue-500 text-white hover:bg-blue-600"
                }`}>
                <FaPaperPlane />
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </>
      : <div className='flex flex-1 items-center justify-center bg-slate-950/20 p-6 text-center text-sm text-slate-400'>
          <div>
            <p className='font-medium text-slate-300'>
              Select a client to start chatting
            </p>
            <p className='mt-1'>
              Conversation history aur live messages yahin show honge.
            </p>
          </div>
        </div>
      }
    </div>
  );

  return (
    <DashboardLayout>
      <div className='flex flex-col gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-white'>Chat</h1>
          <p className='mt-1 text-sm text-slate-400'>
            Coach aur clients ke beech live messaging panel.
          </p>
        </div>

        {error && (
          <div className='rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200'>
            {error}
          </div>
        )}

        <div className='h-[calc(100dvh-10rem)] min-h-128 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 md:h-[calc(100vh-10rem)]'>
          <div className='flex h-full min-h-0 w-full md:hidden'>
            {!showChat ? ClientList : ChatWindow}
          </div>
          <div className='hidden h-full min-h-0 w-full md:flex'>
            {ClientList}
            {ChatWindow}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Message;
