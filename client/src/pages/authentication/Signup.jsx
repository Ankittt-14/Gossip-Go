import React, { useEffect, useState } from 'react';
import { FaUser, FaLock } from "react-icons/fa";
import { BsChatSquareTextFill } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { registeruserThunk } from '../../store/slice/user/user.thunk';

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.userReducer);

  const [signupData, setSignupData] = useState({
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
    gender: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    setSignupData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!signupData.fullName || !signupData.username || !signupData.password || !signupData.confirmPassword || !signupData.gender) {
      toast.error("Please fill in all fields");
      return;
    }

    if (signupData.username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    if (signupData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const { confirmPassword, ...dataToSend } = signupData;
    const response = await dispatch(registeruserThunk(dataToSend));
    
    if (response?.payload?.success) {
      toast.success("Account created successfully!");
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
            <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-gray-400 text-sm">Real-time conversations, simplified.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={signupData.fullName}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full bg-[#1a1d29] text-white border border-gray-700 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-blue-500 transition"
                />
                <FaUser className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Username</label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  placeholder="Choose a unique username"
                  value={signupData.username}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full bg-[#1a1d29] text-white border border-gray-700 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-blue-500 transition"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">@</span>
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={signupData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full bg-[#1a1d29] text-white border border-gray-700 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-blue-500 transition"
                  />
                  <FaLock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={signupData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full bg-[#1a1d29] text-white border border-gray-700 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-blue-500 transition"
                  />
                  <FaLock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-white text-sm font-medium mb-3">Gender</label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center justify-center gap-2 bg-[#1a1d29] border border-gray-700 rounded-lg px-4 py-3 cursor-pointer hover:border-blue-500 transition">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={signupData.gender === "male"}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="radio radio-primary radio-sm"
                  />
                  <span className="text-white text-sm">Male</span>
                </label>

                <label className="flex items-center justify-center gap-2 bg-[#1a1d29] border border-gray-700 rounded-lg px-4 py-3 cursor-pointer hover:border-blue-500 transition">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={signupData.gender === "female"}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="radio radio-primary radio-sm"
                  />
                  <span className="text-white text-sm">Female</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 font-semibold hover:underline">
              Log In
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

export default Signup;