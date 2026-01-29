import { createSlice } from '@reduxjs/toolkit';
import { getMessagesThunk, sendMessageThunk, getUnreadMessagesThunk } from './message.thunk';

const initialState = {
  messages: [],
  selectedUser: null,
  loading: false,
  error: null,
  unreadMessages: [], // Array of senderIds
};

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
      state.messages = [];
    },
    setNewMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
      state.selectedUser = null;
    },
    markMessageAsUnread: (state, action) => {
      const senderId = action.payload;
      if (!state.unreadMessages.includes(senderId)) {
        state.unreadMessages.push(senderId);
      }
    },
    markMessageAsRead: (state, action) => {
      const senderId = action.payload;
      state.unreadMessages = state.unreadMessages.filter(id => id !== senderId);
    },
    setMessagesSeen: (state) => {
      state.messages = state.messages.map(msg => ({ ...msg, status: 'seen' }));
    },
    setMessageDelivered: (state, action) => {
      const { messageId } = action.payload;
      state.messages = state.messages.map(msg =>
        msg._id === messageId ? { ...msg, status: 'delivered' } : msg
      );
    },
  },
  extraReducers: (builder) => {
    // Get Messages
    builder
      .addCase(getMessagesThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMessagesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.data?.messages || [];
      })
      .addCase(getMessagesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Send Message
    builder
      .addCase(sendMessageThunk.pending, (state) => {
        state.loading = false;
      })
      .addCase(sendMessageThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push(action.payload.data);
      })
      .addCase(sendMessageThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reset state on logout
      .addCase('user/logout', (state) => {
        state.messages = [];
        state.selectedUser = null;
        state.loading = false;
        state.error = null;
        state.unreadMessages = [];
      })
      // Get Unread Messages
      .addCase(getUnreadMessagesThunk.fulfilled, (state, action) => {
        state.unreadMessages = action.payload.data;
      });
  },
});

export const { setSelectedUser, setNewMessage, clearMessages, markMessageAsUnread, markMessageAsRead, setMessagesSeen, setMessageDelivered } = messageSlice.actions;
export default messageSlice.reducer;