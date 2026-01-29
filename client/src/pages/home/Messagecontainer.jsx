import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Message from './Message';
import SendMessage from './SendMessage';
import { FaPhone, FaVideo, FaInfoCircle, FaArrowLeft, FaTrash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { getUserThunk } from '../../store/slice/user/user.thunk';


import { BsChatSquareTextFill } from 'react-icons/bs';
import { useDispatch } from 'react-redux';
import { setSelectedUser, setMessagesSeen } from '../../store/slice/message/message.slice';
import axiosInstance from '../../components/axiosInstance';

const Messagecontainer = () => {
  const dispatch = useDispatch();
  const { selectedUser, messages, loading } = useSelector((state) => state.messageReducer);
  const { onlineUsers, typing, socket } = useSelector((state) => state.socketReducer);
  const { userProfile } = useSelector((state) => state.userReducer);
  const scrollRef = useRef();

  const isOnline = selectedUser && onlineUsers?.includes(selectedUser._id);
  const isTyping = selectedUser && typing[selectedUser._id];

  const formatDateDivider = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (selectedUser && socket && userProfile) {
      // Tell backend we saw the messages
      const markSeen = async () => {
        try {
          await axiosInstance.post(`/api/v1/message/seen/${selectedUser._id}`);
          // Also notify via socket for real-time update
          socket.emit("markMessagesAsSeen", {
            senderId: selectedUser._id, // User who sent (Target to notify)
            seenBy: userProfile._id // User who saw (Me)
          });
        } catch (error) {
          console.error("Error marking seen", error);
        }
      }
      markSeen();
    }
  }, [selectedUser, socket, userProfile, messages.length]);

  const handleRemoveFriend = async () => {
    if (!window.confirm("Are you sure you want to remove this friend?")) return;

    try {
      const response = await axiosInstance.put(`/api/v1/user/remove-friend/${selectedUser._id}`);
      if (response.data.success) {
        toast.success('Friend removed successfully');
        dispatch(getUserThunk()); // Refresh friends list
        dispatch(setSelectedUser(null)); // Close chat
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove friend');
    }
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center" style={{ backgroundColor: '#1a1d29' }}>
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BsChatSquareTextFill className="text-white text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to Gossip-Go</h2>
          <p className="text-gray-400 mb-6">Select a conversation to start messaging</p>
          <div className="text-gray-500 text-sm">
            <p>• Real-time messaging</p>
            <p>• Friend requests</p>
            <p>• Online status</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen" style={{ backgroundColor: '#1a1d29' }}>
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between" style={{ backgroundColor: '#252836' }}>
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-gray-400 hover:text-white mr-2"
            onClick={() => dispatch(setSelectedUser(null))}
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <div className="relative">
            <div className="avatar">
              <div className="w-12 rounded-full">
                <img src={selectedUser.avatar} alt={selectedUser.fullName} />
              </div>
            </div>
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#252836] rounded-full"></span>
            )}
          </div>
          <div>
            <p className="font-semibold text-white">{selectedUser.fullName}</p>
            <p className="text-sm text-gray-400">
              {isTyping ? (
                <span className="text-blue-500">Typing...</span>
              ) : isOnline ? (
                <span className="text-green-500">Online</span>
              ) : (
                'Offline'
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRemoveFriend}
            className="btn btn-ghost btn-circle text-gray-400 hover:text-red-500"
            title="Remove Friend"
          >
            <FaTrash className="text-xl" />
          </button>
          <button className="btn btn-ghost btn-circle text-gray-400 hover:text-white">
            <FaInfoCircle className="text-xl" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4" style={{ backgroundColor: '#1a1d29' }}>
        {/* Date Divider */}
        {/* Removed static TODAY divider */}

        {loading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg text-blue-500"></span>
          </div>
        ) : messages && messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const showDateDivider = index === 0 ||
                formatDateDivider(message.createdAt) !== formatDateDivider(messages[index - 1].createdAt);

              return (
                <div key={message._id}>
                  {showDateDivider && (
                    <div className="date-divider">
                      <span>{formatDateDivider(message.createdAt)}</span>
                    </div>
                  )}
                  <div key={message._id} ref={scrollRef}>
                    <Message message={message} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet</p>
            <p className="text-sm mt-2">Start the conversation!</p>
          </div>
        )}

        {isTyping && (
          <div className="flex items-start gap-2 mt-4">
            <div className="avatar">
              <div className="w-10 rounded-full">
                <img src={selectedUser.avatar} alt={selectedUser.fullName} />
              </div>
            </div>
            <div className="typing-indicator bg-[#252836] rounded-2xl">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Message Input */}
      <SendMessage />
    </div>
  );
};

export default Messagecontainer;