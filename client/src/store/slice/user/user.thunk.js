import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../components/axiosInstance";
import { toast } from "react-hot-toast";

export const registeruserThunk = createAsyncThunk(
  "user/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/api/v1/user/register", userData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const LoginuserThunk = createAsyncThunk(
  "user/login",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/api/v1/user/login", userData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// FIXED: Don't call on initial load, only when authenticated
export const getUserProfileThunk = createAsyncThunk(
  "user/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/v1/user/profile");
      return response.data;
    } catch (error) {
      // Don't show error toast, just reject silently
      return rejectWithValue(error.response?.data?.message || "Not authenticated");
    }
  }
);

export const getUserThunk = createAsyncThunk(
  "user/getUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/v1/user/friends");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);