import React, { useState, useEffect } from 'react';
import { FaTimes, FaUsers } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import axiosInstance from '../../components/axiosInstance';
import { toast } from 'react-hot-toast';

const CreateGroupModal = ({ onClose, onSuccess }) => {
    const [groupName, setGroupName] = useState('');
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [loading, setLoading] = useState(false);

    const { otherUsers } = useSelector((state) => state.userReducer); // Assuming friends are in otherUsers when filtered? Or I should fetch friends explicitly.
    // Actually Usersidebar uses activeTab='friends' with otherUsers. 
    // But otherUsers in Usersidebar might be filtered.
    // Let's rely on the passed in list or fetch friends again? 
    // Ideally we should just use the friends list from redux if available. 
    // But userReducer.otherUsers seems to be populated by "getAllUsers" or "getFriends".
    // Let's check userReducer structure.

    // For safety, let's filter otherUsers to ensure we only show friends or fetch friends specificially.
    // But strictly speaking, otherUsers isn't guaranteed to be friends only depending on how it's used.
    // Let's assume for this specific modal we want to fetch *Friends* to add to group.

    const [friends, setFriends] = useState([]);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const response = await axiosInstance.get('/api/v1/user/friends');
                if (response.data.success) {
                    setFriends(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching friends", error);
            }
        };
        fetchFriends();
    }, []);

    const toggleFriend = (friendId) => {
        if (selectedFriends.includes(friendId)) {
            setSelectedFriends(selectedFriends.filter(id => id !== friendId));
        } else {
            setSelectedFriends([...selectedFriends, friendId]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!groupName.trim()) return toast.error("Group name is required");
        if (selectedFriends.length < 2) return toast.error("Select at least 2 friends");

        setLoading(true);
        try {
            const response = await axiosInstance.post('/api/v1/conversation/create-group', {
                name: groupName,
                participants: selectedFriends
            });

            if (response.data.success) {
                toast.success("Group created successfully!");
                onSuccess(response.data.data); // data is the new group object
                onClose();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create group");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1d29] rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FaUsers className="text-blue-500" /> Create Group
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm mb-2">Group Name</label>
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="w-full bg-[#252836] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                            placeholder="e.g. Weekend Trip Squad"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-400 text-sm mb-2">Select Members ({selectedFriends.length})</label>
                        <div className="bg-[#252836] border border-gray-700 rounded-lg max-h-48 overflow-y-auto p-2 space-y-2">
                            {friends.length === 0 ? (
                                <p className="text-gray-500 text-center py-4 text-sm">No friends found to add.</p>
                            ) : (
                                friends.map(friend => (
                                    <div
                                        key={friend._id}
                                        onClick={() => toggleFriend(friend._id)}
                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${selectedFriends.includes(friend._id) ? 'bg-blue-500/20 border border-blue-500/50' : 'hover:bg-[#2d3142]'}`}
                                    >
                                        <div className="w-8 h-8 rounded-full overflow-hidden">
                                            <img src={friend.avatar} alt={friend.fullName} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm font-medium ${selectedFriends.includes(friend._id) ? 'text-blue-400' : 'text-gray-300'}`}>
                                                {friend.fullName}
                                            </p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={selectedFriends.includes(friend._id)}
                                            readOnly
                                            className="checkbox checkbox-sm checkbox-primary"
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg font-bold text-white transition flex items-center justify-center gap-2 ${loading ? 'bg-blue-500/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Create Group'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupModal;
