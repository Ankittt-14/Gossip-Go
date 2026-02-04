import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaTimes, FaUser, FaSignOutAlt, FaCrown, FaUserPlus } from 'react-icons/fa';
import axiosInstance from '../../components/axiosInstance';
import toast from 'react-hot-toast';
import { setSelectedUser } from '../../store/slice/message/message.slice';
import AddMemberModal from './AddMemberModal';

const GroupInfoModal = ({ onClose }) => {
    const { selectedUser } = useSelector((state) => state.messageReducer);
    const { userProfile } = useSelector((state) => state.userReducer);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);

    if (!selectedUser || !selectedUser.isGroup) return null;

    const handleLeaveGroup = async () => {
        if (!window.confirm("Are you sure you want to leave this group?")) return;

        setLoading(true);
        try {
            const res = await axiosInstance.put(`/api/v1/conversation/leave-group/${selectedUser._id}`);
            if (res.data.success) {
                toast.success("Left group successfully");
                dispatch(setSelectedUser(null));
                // We probably need to refresh the conversations list
                // Assuming there is a thunk or action to refresh sidebar
                // dispatch(getMyConversationsThunk()); // TODO: Verify this action name
                window.location.reload(); // Simple brute force refresh for now to update sidebar
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to leave group");
        } finally {
            setLoading(false);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1f2230] p-6 rounded-lg w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Group Info</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <FaTimes />
                    </button>
                </div>

                <div className="flex flex-col items-center mb-6">
                    <div className="w-20 h-20 rounded-full overflow-hidden mb-3">
                        <img
                            src={selectedUser.groupAvatar}
                            alt={selectedUser.groupName}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <h3 className="text-xl font-semibold text-white">{selectedUser.groupName}</h3>
                    <p className="text-gray-400 text-sm">{selectedUser.participants.length} members</p>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-gray-400 text-sm font-semibold uppercase tracking-wide">Participants</h4>
                        {selectedUser.groupAdmin?._id === userProfile._id && (
                            <button
                                onClick={() => setShowAddMember(true)}
                                className="text-blue-500 hover:text-blue-400 text-sm flex items-center gap-1 font-medium"
                            >
                                <FaUserPlus /> Add Member
                            </button>
                        )}
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                        {selectedUser.participants.map((participant) => (
                            <div key={participant._id} className="flex items-center justify-between p-2 hover:bg-[#2a2d3e] rounded">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full overflow-hidden">
                                        <img src={participant.avatar} alt={participant.fullName} className="w-full h-full object-cover" />
                                    </div>
                                    <span className="text-gray-200">
                                        {participant._id === userProfile._id ? "You" : participant.fullName}
                                    </span>
                                </div>
                                {selectedUser.groupAdmin?._id === participant._id && (
                                    <span className="text-yellow-500" title="Admin">
                                        <FaCrown />
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-center">
                    {/* Show Leave Button only if I am a participant (not pending) */}
                    {/* Actually if I am in pending I shouldn't see this modal or it should allow reject? 
                But this modal is usually for active members. Pending logic is in banner. */}
                    <button
                        onClick={handleLeaveGroup}
                        disabled={loading}
                        className="btn btn-error btn-outline flex items-center gap-2 w-full"
                    >
                        <FaSignOutAlt />
                        Leave Group
                    </button>
                </div>
            </div>
            {showAddMember && (
                <AddMemberModal
                    groupId={selectedUser._id}
                    currentParticipants={selectedUser.participants}
                    onClose={() => setShowAddMember(false)}
                />
            )}
        </div>
    );
};

export default GroupInfoModal;
