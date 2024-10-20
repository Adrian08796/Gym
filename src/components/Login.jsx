// src/components/Login.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';
import { useTheme } from '../context/ThemeContext';
import { FiEye, FiEyeOff, FiUser, FiLock } from 'react-icons/fi';
import '../components/Header.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const {  showToast } = useGymContext();

  const validateForm = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        console.log('Attempting to log in with username:', username);
        const result = await login(username, password);
        console.log('Login result:', result);
        if (result && result.user) {
          showToast('success', 'Success', 'Logged in successfully');
          setTimeout(() => navigate('/'), 500);
        }
      } catch (err) {
        console.error('Login error:', err);
        showToast('error', 'Error', 'Failed to log in: ' + (err.response?.data?.message || err.message || 'Unknown error'));
      }
    }
  };

  return (
    <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="px-4 py-6 mx-4 mt-4 text-left bg-white dark:bg-gray-800 shadow-lg rounded-lg sm:w-full sm:max-w-md">
        <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-white">Login to your account</h3>
        <form onSubmit={handleSubmit} className="mt-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="username">Username</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter Username"
                id="username"
                className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-700 dark:text-white leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>
          <div className="mt-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                id="password"
                className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 pr-10 text-gray-700 dark:text-white leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff className="text-gray-400" /> : <FiEye className="text-gray-400" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          <div className="flex items-center justify-between mt-6">
            <button
              type="submit"
              className="nav-btn w-full"
            >
              Login
            </button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="nav-btn inline-block mt-2">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;