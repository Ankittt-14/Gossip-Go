import express from "express";
import {
  register,
  login,
  logout,
  getprofile,
  getAllUsers,
  getFriends,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequests,
  removeFriend
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Authentication routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", isAuthenticated, logout);

// Profile route
router.get("/profile", isAuthenticated, getprofile);

// User routes
router.get("/all", isAuthenticated, getAllUsers);
router.get("/friends", isAuthenticated, getFriends);

// Friend request routes
router.post("/friend-request/:receiverId", isAuthenticated, sendFriendRequest);
router.put("/friend-request/accept/:requestId", isAuthenticated, acceptFriendRequest);
router.put("/friend-request/reject/:requestId", isAuthenticated, rejectFriendRequest);
router.get("/friend-requests", isAuthenticated, getFriendRequests);
router.put("/remove-friend/:friendId", isAuthenticated, removeFriend);

export default router;