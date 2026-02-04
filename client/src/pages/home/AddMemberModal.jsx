import React, { useState, useEffect } from 'react';
import { FaTimes, FaUserPlus } from 'react-icons/fa';
import axiosInstance from '../../components/axiosInstance';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';

const AddMemberModal = ({ onClose, groupId, currentParticipants }) => {
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [friends, setFriends] = useState([]);

    // We can fetch friends again or use from store if available.
    // Let's fetch to be safe and get fresh list.
    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const response = await axiosInstance.get('/api/v1/user/friends');
                if (response.data.success) {
                    // Filter out friends who are already in the group
                    // currentParticipants is an array of objects or IDs? 
                    // Usually objects in GroupInfoModal.
                    const participantIds = currentParticipants.map(p => p._id);
                    const availableFriends = response.data.data.filter(f => !participantIds.includes(f._id));
                    setFriends(availableFriends);
                }
            } catch (error) {
                console.error("Error fetching friends", error);
            }
        };
        fetchFriends();
    }, [currentParticipants]);

    const toggleFriend = (friendId) => {
        if (selectedFriends.includes(friendId)) {
            setSelectedFriends(selectedFriends.filter(id => id !== friendId));
        } else {
            setSelectedFriends([...selectedFriends, friendId]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedFriends.length === 0) return toast.error("Select at least 1 friend to add");

        setLoading(true);
        try {
            const response = await axiosInstance.put(`/api/v1/conversation/add-member/${groupId}`, {
                participants: selectedFriends
            });

            if (response.data.success) {
                toast.success("Invites sent successfully!");
                onClose();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add members");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-[#1a1d29] rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FaUserPlus className="text-blue-500" /> Add Members
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6">
                        <label className="block text-gray-400 text-sm mb-2">Select Friends ({selectedFriends.length})</label>
                        <div className="bg-[#252836] border border-gray-700 rounded-lg max-h-60 overflow-y-auto p-2 space-y-2">
                            {friends.length === 0 ? (
                                <p className="text-gray-500 text-center py-4 text-sm">No new friends to add.</p>
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
                        disabled={loading || friends.length === 0}
                        className={`w-full py-3 rounded-lg font-bold text-white transition flex items-center justify-center gap-2 ${loading || friends.length === 0 ? 'bg-blue-500/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Send Invites'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddMemberModal;
