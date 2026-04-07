import React from "react";

const ChatWindow = ({
  selectedUser,
  messages,
  text,
  setText,
  handleSend,
  user,
}) => {
  return (
    <div className='flex flex-1 flex-col '>
      {messages.map((msg) => {
        const isMine = (msg.sender?._id || msg.sender) === user._id;
        return (
          <div
            key={msg._id}
            className={`flex${
              isMine ?
                "bg-blue-500 text-white justify-end"
              : "bg-slate-700 text-white justify-start"
            }`}>
            {msg.message}
          </div>
        );
      })}
      {/* Input */}
      <div className='p-4 border-t border-slate-700 flex items-center gap-3'>
        <input
          type='text'
          placeholder='Type a message...'
          value={text}
          onChange={(e) => setText(e.target.value)}
          className='bg-slate-700 text-white placeholder:text-slate-500 border border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
        <button
          onClick={handleSend}
          className='bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
