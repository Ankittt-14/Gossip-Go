import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedUser } from '../../store/slice/message/message.slice';
import { getMessagesThunk } from '../../store/slice/message/message.thunk';

const User = ({ user }) => {
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((state) => state.messageReducer);
  const { onlineUsers } = useSelector((state) => state.socketReducer);
  const { typing } = useSelector((state) => state.socketReducer);

  const isOnline = onlineUsers?.includes(user._id);
  const isSelected = selectedUser?._id === user._id;
  const isTyping = typing[user._id];

  const handleSelectUser = () => {
    dispatch(setSelectedUser(user));
    dispatch(getMessagesThunk(user._id));
  };

  return (
    <div
      onClick={handleSelectUser}
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
        isSelected
          ? 'bg-blue-500 text-white'
          : 'bg-[#252836] text-gray-300 hover:bg-[#2d3142]'
      }`}
    >
      <div className="relative">
        <div className="avatar">
          <div className="w-12 rounded-full">
            <img src={user.avatar} alt={user.fullName} />
          </div>
        </div>
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#1a1d29] rounded-full"></span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-semibold truncate">{user.fullName}</p>
          <span className="text-xs opacity-75">12:45 PM</span>
        </div>
        <p className={`text-sm truncate ${isSelected ? 'opacity-90' : 'text-gray-400'}`}>
          {isTyping ? (
            <span className="italic">Typing...</span>
          ) : (
            `@${user.username}`
          )}
        </p>
      </div>
    </div>
  );
};

export default User;