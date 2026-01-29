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
      const isChatOpen = selectedUser?._id === newMessage.senderId;
      if (isChatOpen) {
        dispatch(setNewMessage(newMessage));
      } else {
        dispatch(markMessageAsUnread(newMessage.senderId));
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