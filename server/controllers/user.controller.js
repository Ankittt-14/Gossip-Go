import User from "../models/user.model.js";
import { asynchandler } from "../utilities/asynchandler.utilities.js";
import { errorhandler } from "../utilities/errorhandler.utilities.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getSocketId, io } from "../socket/socket.js";

// Generate random unique avatar based on gender
// Generate avatar using DiceBear (Faster Global CDN)
const generateAvatar = (gender, username) => {
  // Using 'avataaars' style which is consistent and fast
  // We use the username as the seed to ensure the same user always gets the same avatar
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
};

// Register new user
export const register = asynchandler(async (req, res, next) => {
  const { fullName, username, password, gender } = req.body;

  if (!fullName || !username || !password || !gender) {
    return next(new errorhandler("All fields are required", 400));
  }

  if (username.length < 3) {
    return next(new errorhandler("Username must be at least 3 characters", 400));
  }

  if (password.length < 6) {
    return next(new errorhandler("Password must be at least 6 characters", 400));
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return next(new errorhandler("Username already exists", 400));
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const avatar = generateAvatar(gender, username);

  const newUser = await User.create({
    username,
    fullName,
    password: hashedPassword,
    gender,
    avatar,
  });

  const tokenData = { _id: newUser._id };
  const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES
  });

  const userResponse = {
    _id: newUser._id,
    fullName: newUser.fullName,
    username: newUser.username,
    gender: newUser.gender,
    avatar: newUser.avatar,
    friends: newUser.friends,
    createdAt: newUser.createdAt
  };

  res
    .status(200)
    .cookie("token", token, {
      expires: new Date(Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' || process.env.VERCEL,
      sameSite: (process.env.NODE_ENV === 'production' || process.env.VERCEL) ? 'None' : 'Lax'
    })
    .json({
      success: true,
      message: "User registered successfully",
      data: userResponse,
      token
    });
});

// Login user
export const login = asynchandler(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new errorhandler("Please enter username and password", 400));
  }

  const user = await User.findOne({ username }).select('+password');
  if (!user) {
    return next(new errorhandler("Invalid username or password", 400));
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return next(new errorhandler("Invalid username or password", 400));
  }

  const tokenData = { _id: user._id };
  const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES
  });

  const userResponse = {
    _id: user._id,
    fullName: user.fullName,
    username: user.username,
    gender: user.gender,
    avatar: user.avatar,
    friends: user.friends,
    createdAt: user.createdAt
  };

  res
    .status(200)
    .cookie("token", token, {
      expires: new Date(Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' || process.env.VERCEL, // Use secure in production or Vercel
      sameSite: (process.env.NODE_ENV === 'production' || process.env.VERCEL) ? 'None' : 'Lax'
    })
    .json({
      success: true,
      message: "User logged in successfully",
      data: userResponse,
      token
    });
});

// Get user profile
export const getprofile = asynchandler(async (req, res, next) => {
  const userId = req.user._id;

  const profile = await User.findById(userId)
    .populate('friends', 'fullName username avatar')
    .populate('friendRequests.from', 'fullName username avatar')
    .populate('sentFriendRequests.to', 'fullName username avatar');

  res.status(200).json({
    success: true,
    message: "User profile fetched successfully",
    data: profile
  });
});

// Logout user
export const logout = asynchandler(async (req, res, next) => {
  res.status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "User logged out successfully",
    });
});

// Get all users (for search)
export const getAllUsers = asynchandler(async (req, res, next) => {
  const currentUserId = req.user._id;
  const users = await User.find({ _id: { $ne: currentUserId } })
    .select('fullName username avatar gender');

  res.status(200).json({
    success: true,
    message: "All users fetched successfully",
    data: users
  });
});

// Get only friends
export const getFriends = asynchandler(async (req, res, next) => {
  const currentUserId = req.user._id;
  const user = await User.findById(currentUserId)
    .populate('friends', 'fullName username avatar gender');

  res.status(200).json({
    success: true,
    message: "Friends fetched successfully",
    data: user.friends
  });
});

// Send friend request
export const sendFriendRequest = asynchandler(async (req, res, next) => {
  const senderId = req.user._id;
  const { receiverId } = req.params;

  if (senderId.toString() === receiverId) {
    return next(new errorhandler("You cannot send friend request to yourself", 400));
  }

  const receiver = await User.findById(receiverId);
  if (!receiver) {
    return next(new errorhandler("User not found", 404));
  }

  const sender = await User.findById(senderId);
  if (sender.friends.includes(receiverId)) {
    return next(new errorhandler("You are already friends", 400));
  }

  const existingRequest = receiver.friendRequests.find(
    req => req.from.toString() === senderId.toString() && req.status === 'pending'
  );

  if (existingRequest) {
    return next(new errorhandler("Friend request already sent", 400));
  }

  receiver.friendRequests.push({ from: senderId, status: 'pending' });
  sender.sentFriendRequests.push({ to: receiverId, status: 'pending' });

  await receiver.save();
  await sender.save();

  const socketId = getSocketId(receiverId);
  if (socketId) {
    io.to(socketId).emit("newFriendRequest", {
      _id: receiver.friendRequests[receiver.friendRequests.length - 1]._id,
      from: {
        _id: sender._id,
        fullName: sender.fullName,
        username: sender.username,
        avatar: sender.avatar
      },
      status: 'pending'
    });
  }

  res.status(200).json({
    success: true,
    message: "Friend request sent successfully"
  });
});

// Accept friend request
export const acceptFriendRequest = asynchandler(async (req, res, next) => {
  const currentUserId = req.user._id;
  const { requestId } = req.params;

  const user = await User.findById(currentUserId);
  const requestIndex = user.friendRequests.findIndex(
    req => req._id.toString() === requestId && req.status === 'pending'
  );

  if (requestIndex === -1) {
    return next(new errorhandler("Friend request not found", 404));
  }

  const senderId = user.friendRequests[requestIndex].from;
  user.friendRequests[requestIndex].status = 'accepted';
  user.friends.push(senderId);

  const sender = await User.findById(senderId);
  const sentRequestIndex = sender.sentFriendRequests.findIndex(
    req => req.to.toString() === currentUserId.toString() && req.status === 'pending'
  );

  if (sentRequestIndex !== -1) {
    sender.sentFriendRequests[sentRequestIndex].status = 'accepted';
  }

  sender.friends.push(currentUserId);

  await user.save();
  await sender.save();

  const socketId = getSocketId(senderId);
  if (socketId) {
    io.to(socketId).emit("friendRequestAccepted", {
      message: `${user.fullName} accepted your friend request`,
      user: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        avatar: user.avatar
      }
    });
  }

  res.status(200).json({
    success: true,
    message: "Friend request accepted successfully"
  });
});

// Reject friend request
export const rejectFriendRequest = asynchandler(async (req, res, next) => {
  const currentUserId = req.user._id;
  const { requestId } = req.params;

  const user = await User.findById(currentUserId);
  const requestIndex = user.friendRequests.findIndex(
    req => req._id.toString() === requestId && req.status === 'pending'
  );

  if (requestIndex === -1) {
    return next(new errorhandler("Friend request not found", 404));
  }

  const senderId = user.friendRequests[requestIndex].from;
  user.friendRequests[requestIndex].status = 'rejected';

  const sender = await User.findById(senderId);
  const sentRequestIndex = sender.sentFriendRequests.findIndex(
    req => req.to.toString() === currentUserId.toString() && req.status === 'pending'
  );

  if (sentRequestIndex !== -1) {
    sender.sentFriendRequests[sentRequestIndex].status = 'rejected';
  }

  await user.save();
  await sender.save();

  const socketId = getSocketId(senderId);
  if (socketId) {
    io.to(socketId).emit("friendRequestRejected", {
      message: `${user.fullName} rejected your friend request`
    });
  }

  res.status(200).json({
    success: true,
    message: "Friend request rejected successfully"
  });
});

// Get pending friend requests
export const getFriendRequests = asynchandler(async (req, res, next) => {
  const currentUserId = req.user._id;

  const user = await User.findById(currentUserId)
    .populate({
      path: 'friendRequests.from',
      select: 'fullName username avatar'
    });

  const pendingRequests = user.friendRequests.filter(req => req.status === 'pending');

  res.status(200).json({
    success: true,
    message: "Friend requests fetched successfully",
    data: pendingRequests
  });
});

// Remove friend
export const removeFriend = asynchandler(async (req, res, next) => {
  const currentUserId = req.user._id;
  const { friendId } = req.params;

  const user = await User.findById(currentUserId);
  const friend = await User.findById(friendId);

  if (!user || !friend) {
    return next(new errorhandler("User not found", 404));
  }

  // Remove friend from both users' friends list
  user.friends = user.friends.filter(id => id.toString() !== friendId);
  friend.friends = friend.friends.filter(id => id.toString() !== currentUserId.toString());

  // Also remove any existing friend requests to keep it clean
  user.friendRequests = user.friendRequests.filter(req => req.from.toString() !== friendId);
  user.sentFriendRequests = user.sentFriendRequests.filter(req => req.to.toString() !== friendId);

  friend.friendRequests = friend.friendRequests.filter(req => req.from.toString() !== currentUserId.toString());
  friend.sentFriendRequests = friend.sentFriendRequests.filter(req => req.to.toString() !== currentUserId.toString());

  await user.save();
  await friend.save();

  // Notify the removed friend
  const socketId = getSocketId(friendId);
  if (socketId) {
    io.to(socketId).emit("friendRemoved", {
      message: `${user.fullName} removed you from friends`,
      removerId: user._id
    });
  }

  res.status(200).json({
    success: true,
    message: "Friend removed successfully"
  });
});