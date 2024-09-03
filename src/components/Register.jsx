// src/components/Register.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const { darkMode } = useTheme();

  const validateForm = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        console.log('Attempting to register user:', username);
        const result = await register(username, email, password);
        console.log('Registration result:', result);
        addNotification('Registration successful! Please log in.', 'success');
        navigate('/login');
      } catch (err) {
        console.error('Registration error:', err);
        let errorMessage = 'Registration failed: ';
        if (err.response) {
          console.error('Error response:', err.response);
          errorMessage += err.response.data?.message || err.response.statusText;
        } else if (err.request) {
          console.error('Error request:', err.request);
          errorMessage += 'No response received from server';
        } else {
          console.error('Error details:', err.message);
          errorMessage += err.message;
        }
        addNotification(errorMessage, 'error');
      }
    }
  };

  return (
    <div className={`flex items-center justify-center min-h-screen bg-gray-100 ${darkMode ? 'dark' : ''}`}>
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg dark:bg-gray-800 rounded-lg">
        <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-white">Create an account</h3>
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <div className="relative">
              <label className="block text-gray-700 dark:text-gray-300" htmlFor="username">Username</label>
              <div className="flex items-center">
                <FiUser className="absolute left-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter Username"
                  id="username"
                  className={`w-full px-4 py-2 pl-10 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${errors.username ? 'border-red-500' : ''}`}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>
            <div className="mt-4 relative">
              <label className="block text-gray-700 dark:text-gray-300" htmlFor="email">Email</label>
              <div className="flex items-center">
                <FiMail className="absolute left-3 text-gray-400" />
                <input
                  type="email"
                  placeholder="Enter Email"
                  id="email"
                  className={`w-full px-4 py-2 pl-10 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${errors.email ? 'border-red-500' : ''}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div className="mt-4 relative">
              <label className="block text-gray-700 dark:text-gray-300" htmlFor="password">Password</label>
              <div className="flex items-center">
                <FiLock className="absolute left-3 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  id="password"
                  className={`w-full px-4 py-2 pl-10 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${errors.password ? 'border-red-500' : ''}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
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
            <div className="mt-4 relative">
              <label className="block text-gray-700 dark:text-gray-300" htmlFor="confirmPassword">Confirm Password</label>
              <div className="flex items-center">
                <FiLock className="absolute left-3 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  id="confirmPassword"
                  className={`w-full px-4 py-2 pl-10 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff className="text-gray-400" /> : <FiEye className="text-gray-400" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
            <div className="flex items-center justify-between mt-6">
              <button
                type="submit"
                className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-900 transition duration-300 ease-in-out"
              >
                Register
              </button>
            </div>
          </div>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;