import React, { useEffect, useState } from 'react';
import { FaUser, FaLock } from "react-icons/fa";
import { BsChatSquareTextFill } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { LoginuserThunk } from '../../store/slice/user/user.thunk';

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, loading } = useSelector((state) => state.userReducer);

    const [loginData, setLoginData] = useState({
        username: "",
        password: "",
    });

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated, navigate]);

    const handleInputChange = (e) => {
        setLoginData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!loginData.username || !loginData.password) {
            toast.error("Please fill in all fields");
            return;
        }

        const response = await dispatch(LoginuserThunk(loginData));
        if (response?.payload?.success) {
            // Fetch profile after successful login
            await dispatch(getUserProfileThunk());
            toast.success("Login successful!");
            navigate("/");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#1a1d29' }}>
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <BsChatSquareTextFill className="text-white text-xl" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Gossip-Go</h1>
                    </div>
                </div>

              
                

                {/* Card */}
                <div className="bg-[#252836] rounded-2xl p-10 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                        <p className="text-gray-400 text-sm">Login to continue your conversations</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Username */}
                        <div>
                            <label className="block text-white text-sm font-medium mb-2">Username</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Enter your username"
                                    value={loginData.username}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className="w-full bg-[#1a1d29] text-white border border-gray-700 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-blue-500 transition"
                                />
                                <FaUser className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-white text-sm font-medium mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    value={loginData.password}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className="w-full bg-[#1a1d29] text-white border border-gray-700 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-blue-500 transition"
                                />
                                <FaLock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                        >
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>
                    </form>

                    {/* Signup Link */}
                    <p className="text-center text-gray-400 text-sm mt-6">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-blue-500 font-semibold hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-xs mt-6">
                    © 2024 Gossip-Go. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Login;