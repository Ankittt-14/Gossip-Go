import React, { useEffect } from 'react';
import Usersidebar from './Usersidebar';
import Messagecontainer from './Messagecontainer';
import { useDispatch, useSelector } from 'react-redux';
import { initializeSocket, setOnlineUsers, setUserTyping } from '../../store/slice/socket/socket.slice';
import { setNewMessage, markMessageAsUnread, setMessagesSeen, setMessageDelivered } from '../../store/slice/message/message.slice';
import { getUnreadMessagesThunk } from '../../store/slice/message/message.thunk';

const Home = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, userProfile } = useSelector((state) => state.userReducer);
  const { selectedUser } = useSelector((state) => state.messageReducer);
  const { socket } = useSelector((state) => state.socketReducer);

  useEffect(() => {
    if (!isAuthenticated || !userProfile) return;
    dispatch(initializeSocket(userProfile._id));
    dispatch(getUnreadMessagesThunk());
  }, [isAuthenticated, userProfile, dispatch]);

  useEffect(() => {
    if (!socket) return;

    socket.on("onlineUsers", (onlineUsers) => {
      dispatch(setOnlineUsers(onlineUsers));
    });

    socket.on("newMessage", (newMessage) => {
      // Logic for 1-on-1 vs Group
      let isChatOpen = false;

      // Ensure senderId is handled whether populated or not
      const senderId = newMessage.senderId?._id || newMessage.senderId;

      if (selectedUser?.isGroup) {
        // Group Logic: Check if message belongs to this group
        // In group messages, conversationId is the Group ID
        isChatOpen = newMessage.conversationId === selectedUser._id;
      } else {
        // 1-on-1 Logic: Check if message is from the selected user AND intended for ME (not a group)
        // In 1-on-1, receiverId matches my profile ID (userProfile._id)
        // And sender should be the selectedUser
        isChatOpen =
          senderId === selectedUser?._id &&
          newMessage.receiverId === userProfile?._id;
      }

      if (isChatOpen) {
        dispatch(setNewMessage(newMessage));
      } else {
        // Dispatch unread
        // If it's a group message, key is conversationId (which is the Group ID)
        // If it's 1-on-1, key is senderId

        // Check if it's a group message (receiverId is a Group ID usually, or conversationId exists)
        // But 1-on-1 also has conversationId now.
        // Use receiverId: if receiverId === userProfile._id, it's 1-on-1 (use senderId).
        // Otherwise it's group (use conversationId).

        const isGroupMsg = newMessage.receiverId !== userProfile?._id;
        const unreadKey = isGroupMsg ? newMessage.conversationId : senderId;

        dispatch(markMessageAsUnread(unreadKey));
      }
    });

    socket.on("userTyping", ({ senderId, isTyping }) => {
      dispatch(setUserTyping({ senderId, isTyping }));
    });

    socket.on("messagesSeen", ({ receiverId }) => {
      if (selectedUser?._id === receiverId) {
        dispatch(setMessagesSeen());
      }
    });

    socket.on("messageDelivered", ({ messageId }) => {
      dispatch(setMessageDelivered({ messageId }));
    });

    return () => {
      socket.off("onlineUsers");
      socket.off("newMessage");
      socket.off("userTyping");
      socket.off("messagesSeen");
      socket.off("messageDelivered");
    };
  }, [socket, dispatch, selectedUser]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#1a1d29' }}>
      <div className={`${selectedUser ? 'hidden md:flex' : 'flex'} w-full md:w-auto`}>
        <Usersidebar />
      </div>
      <div className={`${!selectedUser ? 'hidden md:flex' : 'flex'} flex-1`}>
        <Messagecontainer />
      </div>
    </div>
  );
};

export default Home;