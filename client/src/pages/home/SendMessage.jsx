import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessageThunk } from '../../store/slice/message/message.thunk';
import { FaPaperPlane, FaPaperclip, FaSmile } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';

const SendMessage = () => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((state) => state.messageReducer);
  const { userProfile } = useSelector((state) => state.userReducer);
  const { socket } = useSelector((state) => state.socketReducer);

  const handleTyping = (e) => {
    setMessage(e.target.value);

    // Only send typing indicator for 1-on-1 chats for now
    if (socket && selectedUser && !selectedUser.isGroup) {
      if (e.target.value.length > 0 && !isTyping) {
        setIsTyping(true);
        socket.emit('typing', {
          receiverId: selectedUser._id,
          senderId: userProfile._id,
          isTyping: true,
        });
      } else if (e.target.value.length === 0 && isTyping) {
        setIsTyping(false);
        socket.emit('typing', {
          receiverId: selectedUser._id,
          senderId: userProfile._id,
          isTyping: false,
        });
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (!selectedUser) {
      toast.error('Please select a user');
      return;
    }

    // Stop typing indicator
    if (socket && isTyping && !selectedUser.isGroup) {
      socket.emit('typing', {
        receiverId: selectedUser._id,
        senderId: userProfile._id,
        isTyping: false,
      });
      setIsTyping(false);
    }

    const response = await dispatch(
      sendMessageThunk({
        receiverId: selectedUser._id,
        message: message.trim(),
      })
    );

    if (response?.payload?.success) {
      setMessage('');
      setShowEmojiPicker(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="p-4 border-t border-gray-800" style={{ backgroundColor: '#252836' }}>
      <form onSubmit={handleSendMessage} className="flex items-center gap-3">
        {/* Attachment Button */}
        <button
          type="button"
          className="btn btn-ghost btn-circle text-gray-400 hover:text-white"
          onClick={() => toast.error("File attachment is coming soon!")}
        >
          <FaPaperclip className="text-xl" />
        </button>

        {/* Emoji Button */}
        <div className="relative">
          <button
            type="button"
            className="btn btn-ghost btn-circle text-gray-400 hover:text-white"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <FaSmile className="text-xl" />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-16 left-0 z-50 shadow-xl rounded-xl overflow-hidden">
              <EmojiPicker
                theme="dark"
                onEmojiClick={(emojiObject) => {
                  setMessage((prev) => prev + emojiObject.emoji);
                }}
              />
            </div>
          )}
        </div>

        {/* Message Input */}
        <input
          type="text"
          value={message}
          onChange={handleTyping}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 bg-[#1a1d29] text-white border border-gray-800 rounded-full px-6 py-3 focus:outline-none focus:border-blue-500 transition"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim()}
          className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaPaperPlane className="text-lg" />
        </button>
      </form>
    </div>
  );
};

export default SendMessage;