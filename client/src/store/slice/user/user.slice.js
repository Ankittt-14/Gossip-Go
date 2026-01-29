import { createSlice } from '@reduxjs/toolkit';
import { registeruserThunk, LoginuserThunk, getUserProfileThunk, getUserThunk } from './user.thunk';

const initialState = {
  isAuthenticated: false,
  userProfile: null,
  otherUsers: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.userProfile = null;
      state.otherUsers = [];
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registeruserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registeruserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.userProfile = action.payload.data;
      })
      .addCase(registeruserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Login
    builder
      .addCase(LoginuserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(LoginuserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.userProfile = action.payload.data;
      })
      .addCase(LoginuserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Profile
    builder
      .addCase(getUserProfileThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.userProfile = action.payload.data;
      })
      .addCase(getUserProfileThunk.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
      });

    // Get Friends/Users
    builder
      .addCase(getUserThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.otherUsers = action.payload.data;
      })
      .addCase(getUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;