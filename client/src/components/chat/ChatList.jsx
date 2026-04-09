import React from "react";

const ChatList = ({ users, onSelectUser }) => {
  return (
    <div className='w-1/4 bg-slate-800 p-4'>
      <h2 className='text-lg font-bold mb-4'>Users</h2>
      <ul>
        {users.map((user) => {
          const avatar =
            user.profilePicture ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1d1f2c&color=ffffff`;

          return (
            <li
              key={user._id || user.id}
              className='flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-800'
              onClick={() => onSelectUser(user)}>
              <img
                src={avatar}
                alt={user.name}
                className='h-8 w-8 rounded-full object-cover'
              />
              <span className='text-sm text-white'>{user.name}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ChatList;
