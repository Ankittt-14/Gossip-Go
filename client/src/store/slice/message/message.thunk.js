import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../components/axiosInstance";
import { toast } from "react-hot-toast";

export const sendMessageThunk = createAsyncThunk(
  "message/send",
  async ({ receiverId, message }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/api/v1/message/send/${receiverId}`,
        { message }
      );
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to send message";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const getMessagesThunk = createAsyncThunk(
  "message/get",
  async (otherParticipantId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/api/v1/message/${otherParticipantId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getUnreadMessagesThunk = createAsyncThunk(
  "message/getUnread",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/v1/message/unread/all");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);