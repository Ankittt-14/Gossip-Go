import { createSlice } from '@reduxjs/toolkit';
import io from 'socket.io-client';

const initialState = {
  socket: null,
  onlineUsers: [],
  typing: {},
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    initializeSocket: (state, action) => {
      const userId = action.payload;
      if (userId) {
        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
          query: { userId },
        });
        state.socket = newSocket;
      }
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setUserTyping: (state, action) => {
      const { senderId, isTyping } = action.payload;
      state.typing[senderId] = isTyping;
    },
    closeSocket: (state) => {
      if (state.socket) {
        state.socket.close();
        state.socket = null;
      }
      state.onlineUsers = [];
      state.typing = {};
    },
  },
});

export const { initializeSocket, setOnlineUsers, setUserTyping, closeSocket } = socketSlice.actions;
export default socketSlice.reducer;