// src/components/Register.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';
import { useTheme } from '../context/ThemeContext';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import '../components/Header.css';
import { useTranslation } from 'react-i18next';

function Register() {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { showToast } = useGymContext();

  const validateForm = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = t("Username is required");
    if (!email.trim()) newErrors.email = t("Email is required");
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = t("Email is invalid");
    if (!password) newErrors.password = t("Password is required");
    else if (password.length < 6) newErrors.password = t("Password must be at least 6 characters");
    if (password !== confirmPassword) newErrors.confirmPassword = t("Passwords do not match");
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
        showToast('success', 'Success', t("Registration successful! Please log in."));
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
        showToast('error', 'Error', errorMessage);
      }
    }
  };

  return (
    <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="px-4 py-6 mx-4 mt-4 text-left bg-white dark:bg-gray-800 shadow-lg rounded-lg sm:w-full sm:max-w-md">
        <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-white">{t("Create an account")}</h3>
        <form onSubmit={handleSubmit} className="mt-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="username">{t("Username")}</label>
            <div className="relative">
              <input
                type="text"
                placeholder={t("Enter Username")}
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
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">{t("Email")}</label>
            <div className="relative">
              <input
                type="email"
                placeholder={t("Enter Email")}
                id="email"
                className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-700 dark:text-white leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div className="mt-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">{t("Password")}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t("Enter Password")}
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
          <div className="mt-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="confirmPassword">{t("Confirm Password")}</label>
            <div className="relative">
              <input
                type={t(showConfirmPassword ? "text" : "password")}
                placeholder={t("Confirm Password")}
                id="confirmPassword"
                className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 pr-10 text-gray-700 dark:text-white leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
              className="nav-btn w-full"
            >
              {t("Register")}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("Already have an account?")}{' '}
            <Link to="/login" className="nav-btn inline-block mt-2">
              {t("Log in")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;