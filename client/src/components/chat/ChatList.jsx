import React from "react";

const ChatList = ({ users, onSelectUser }) => {
  return (
    <div className='w-1/4 bg-slate-800 p-4'>
      <h2 className='text-lg font-bold mb-4'>Users</h2>
      <ul>
        {users.map((user) => (
          <li
            key={user.id}
            className='cursor-pointer p-2 hover:bg-slate-600'
            onClick={() => onSelectUser(user)}>
            {user.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;
