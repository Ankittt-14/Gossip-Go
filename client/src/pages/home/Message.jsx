import React from 'react';
import { useSelector } from 'react-redux';
import { BsCheck, BsCheckAll } from "react-icons/bs";

const Message = ({ message }) => {
  const { userProfile } = useSelector((state) => state.userReducer);
  const { selectedUser } = useSelector((state) => state.messageReducer);

  const isMyMessage = message.senderId === userProfile?._id;
  const avatar = isMyMessage ? userProfile?.avatar : selectedUser?.avatar;

  const formatTime = (date) => {
    const messageDate = new Date(date);
    const hours = messageDate.getHours();
    const minutes = messageDate.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  if (message.isSystemMessage) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-gray-400 bg-[#2a2d3e] px-3 py-1 rounded-full opacity-80">
          {message.message}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-2 ${isMyMessage ? 'flex-row-reverse' : ''}`}>
      <div className="avatar">
        <div className="w-10 rounded-full">
          <img src={avatar} alt="avatar" />
        </div>
      </div>
      <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
        <div className={isMyMessage ? 'message-sent' : 'message-received'}>
          <p className="text-sm">{message.message}</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 mt-1">
            {formatTime(message.createdAt)}
          </span>
          {isMyMessage && (
            <span className={`text-lg ${message.status === 'seen' ? 'text-blue-400' : 'text-gray-500'}`}>
              {message.status === 'seen' ? <BsCheckAll /> : message.status === 'delivered' ? <BsCheckAll /> : <BsCheck />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;