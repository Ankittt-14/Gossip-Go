import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import User from './User';
import { getUserThunk } from '../../store/slice/user/user.thunk';
import { FaUsers, FaUserPlus, FaBell, FaCog, FaSignOutAlt, FaSearch } from 'react-icons/fa';
import axiosInstance from '../../components/axiosInstance';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slice/user/user.slice';
import { closeSocket } from '../../store/slice/socket/socket.slice';
import { setSelectedUser, markMessageAsRead } from '../../store/slice/message/message.slice';

const Usersidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('friends');
  const [friendRequests, setFriendRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sentRequests, setSentRequests] = useState(new Set());

  const { otherUsers, loading, userProfile } = useSelector((state) => state.userReducer);
  const { unreadMessages } = useSelector((state) => state.messageReducer);
  const { socket } = useSelector((state) => state.socketReducer);

  useEffect(() => {
    dispatch(getUserThunk());
    fetchFriendRequests(); // Fetch initially for badge count
    if (activeTab === 'add') {
      fetchAllUsers();
    }
  }, [dispatch, activeTab]);

  useEffect(() => {
    if (!socket) return;

    socket.on("newFriendRequest", (newRequest) => {
      toast.success(`New friend request from ${newRequest.from.fullName}`);
      setFriendRequests(prev => [...prev, newRequest]);
    });

    socket.on("friendRequestAccepted", (data) => {
      toast.success(data.message);
      // Refresh friends list or other users if you want to show the new friend immediately
      dispatch(getUserThunk());
    });

    socket.on("friendRequestRejected", (data) => {
      toast.error(data.message);
    });

    socket.on("friendRemoved", (data) => {
      // Refresh friends list
      dispatch(getUserThunk());
      // If the removed friend was the selected user, clear selection
      // access selectedUser via prop or selector? useSelector is available
    });

    return () => {
      socket.off("newFriendRequest");
      socket.off("friendRequestAccepted");
      socket.off("friendRequestRejected");
      socket.off("friendRemoved");
    };
  }, [socket, dispatch]);

  // Inside component body
  const { selectedUser } = useSelector((state) => state.messageReducer);

  // Update socket effect to handle friendRemoved properly with state access if needed
  // Using another effect or ref might be cleaner but let's stick to this structure

  // Update socket effect to handle friendRemoved properly with state access if needed
  // Using another effect or ref might be cleaner but let's stick to this structure

  const fetchFriendRequests = async () => {
    try {
      const response = await axiosInstance.get('/api/v1/user/friend-requests');
      if (response.data.success) {
        setFriendRequests(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await axiosInstance.get('/api/v1/user/all');
      if (response.data.success) {
        setAllUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await axiosInstance.put(`/api/v1/user/friend-request/accept/${requestId}`);
      if (response.data.success) {
        toast.success('Friend request accepted!');
        fetchFriendRequests();
        dispatch(getUserThunk());
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const response = await axiosInstance.put(`/api/v1/user/friend-request/reject/${requestId}`);
      if (response.data.success) {
        toast.success('Friend request rejected');
        fetchFriendRequests();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject request');
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      const response = await axiosInstance.post(`/api/v1/user/friend-request/${userId}`);
      if (response.data.success) {
        toast.success('Friend request sent!');
        setSentRequests(prev => new Set([...prev, userId]));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/api/v1/user/logout');
      dispatch(logout());
      dispatch(closeSocket());
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const filteredUsers = allUsers.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full md:w-96 flex flex-col h-screen border-r border-gray-800" style={{ backgroundColor: '#1a1d29' }}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800" style={{ backgroundColor: '#252836' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="avatar online">
              <div className="w-10 rounded-full">
                <img src={userProfile?.avatar} alt={userProfile?.fullName} />
              </div>
            </div>
            <div>
              <p className="font-semibold text-white">{userProfile?.fullName}</p>
              <p className="text-xs text-green-500">Online</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-ghost btn-circle btn-sm text-gray-400 hover:text-white">
              <FaCog className="text-lg" />
            </button>
            <button
              onClick={handleLogout}
              className="btn btn-ghost btn-circle btn-sm text-gray-400 hover:text-white"
              title="Logout"
            >
              <FaSignOutAlt className="text-lg" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition ${activeTab === 'friends'
              ? 'bg-blue-500 text-white'
              : 'bg-[#1a1d29] text-gray-400 hover:bg-[#2d3142] hover:text-white'
              }`}
          >
            <FaUsers /> Friends
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition relative ${activeTab === 'requests'
              ? 'bg-blue-500 text-white'
              : 'bg-[#1a1d29] text-gray-400 hover:bg-[#2d3142] hover:text-white'
              }`}
          >
            <FaBell /> Requests
            {friendRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {friendRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition ${activeTab === 'add'
              ? 'bg-blue-500 text-white'
              : 'bg-[#1a1d29] text-gray-400 hover:bg-[#2d3142] hover:text-white'
              }`}
          >
            <FaUserPlus /> Add
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'friends' && (
          <div className="p-4">
            {/* Search */}
            <div className="mb-4 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Find a conversation..."
                className="w-full bg-[#252836] text-white border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Friends List */}
            {loading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-md text-blue-500"></span>
              </div>
            ) : otherUsers && otherUsers.length > 0 ? (
              <div className="space-y-2">
                {otherUsers.map((user) => (
                  <div
                    key={user._id}
                    className="relative cursor-pointer group"
                    onClick={() => {
                      dispatch(setSelectedUser(user));
                      dispatch(markMessageAsRead(user._id));
                    }}
                  >
                    <User user={user} />
                    {unreadMessages.includes(user._id) && (
                      <span className="absolute top-2 right-2 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    )}


                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>No friends yet</p>
                <p className="text-sm mt-2">Click "Add" to find friends!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="p-4 space-y-3">
            {friendRequests.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No pending requests
              </div>
            ) : (
              friendRequests.map((request) => (
                <div key={request._id} className="bg-[#252836] p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-12 rounded-full">
                          <img src={request.from.avatar} alt={request.from.fullName} />
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-white">{request.from.fullName}</p>
                        <p className="text-sm text-gray-400">@{request.from.username}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(request._id)}
                        className="btn btn-sm btn-success text-white"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request._id)}
                        className="btn btn-sm btn-error text-white"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'add' && (
          <div className="p-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#252836] text-white border border-gray-800 rounded-lg px-4 py-2.5 mb-4 text-sm focus:outline-none focus:border-blue-500"
            />

            {/* Users List */}
            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  No users found
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div key={user._id} className="bg-[#252836] p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="w-12 rounded-full">
                            <img src={user.avatar} alt={user.fullName} />
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-white">{user.fullName}</p>
                          <p className="text-sm text-gray-400">@{user.username}</p>
                        </div>
                      </div>
                      {sentRequests.has(user._id) ? (
                        <button className="btn btn-sm btn-disabled">
                          Pending
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSendRequest(user._id)}
                          className="btn btn-sm btn-primary"
                        >
                          <FaUserPlus /> Add
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* New Message Button */}
      <div className="p-4 border-t border-gray-800">
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition">
          <FaUserPlus /> New Message
        </button>
      </div>
    </div>
  );
};

export default Usersidebar;